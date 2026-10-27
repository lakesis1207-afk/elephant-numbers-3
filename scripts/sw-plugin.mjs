// 빌드가 끝나면 dist의 모든 파일 목록으로 오프라인 저장 파일(dist/sw.js)을 만든다.
//  - 앱 파일: 내용이 바뀌면 저장 이름(CACHE)도 바뀌어서, 새 버전을 받으면 예전 저장본을 지운다.
//  - 녹음(mp3): 따로 저장한다(VOICE_CACHE). 파일마다 버전(내용 해시)이 있어 바뀐 녹음만 다시 받고,
//    하나를 못 받아도 앱 설치는 계속된다(못 받은 녹음은 인터넷이 될 때 받는다).
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { createHash } from 'node:crypto';

const SW_FILE = 'sw.js';
const VOICE_DIR = 'audio/voice/';
const HASH_LEN = 12;

function listFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? listFiles(full) : [full];
  });
}

const hashOf = (...parts) => {
  const hash = createHash('sha256');
  parts.forEach((p) => hash.update(p));
  return hash.digest('hex').slice(0, HASH_LEN);
};

const swSource = (cache, files, voice) => `// 자동으로 만든 파일 (scripts/sw-plugin.mjs). 직접 고치지 마세요.
const CACHE = ${JSON.stringify(cache)};
const VOICE_CACHE = 'elephant-voice';
const FILES = ${JSON.stringify(files)};
const VOICE = ${JSON.stringify(voice)}; // [파일, 버전]

const urlOf = (f) => new URL(f, self.location).href;
const voiceUrl = ([f, v]) => \`\${urlOf(f)}?v=\${v}\`;
const savedUrls = async (cache) => new Set((await cache.keys()).map((r) => r.url));

// 앱 파일: 없는 것만 받는다(저장 이름이 내용 해시라 있는 것은 같은 내용).
// 브라우저 임시 저장(HTTP 캐시)을 거치지 않고 서버에서 새로 받는다 (예전 index.html이 섞이지 않게).
async function saveApp() {
  const cache = await caches.open(CACHE);
  const have = await savedUrls(cache);
  const missing = FILES.filter((f) => !have.has(urlOf(f)));
  await cache.addAll(missing.map((f) => new Request(f, { cache: 'reload' })));
}

// 녹음: 바뀐 것만 받고, 하나가 실패해도 멈추지 않는다
async function saveVoice() {
  const cache = await caches.open(VOICE_CACHE);
  const have = await savedUrls(cache);
  await Promise.allSettled(VOICE.map(voiceUrl).filter((u) => !have.has(u)).map(async (u) => {
    const res = await fetch(u, { cache: 'reload' });
    if (res.ok) await cache.put(u, res);
  }));
}

// 새 버전은 다 받으면 기다리지 않고 바로 바뀐다 (홈 화면 앱은 완전히 닫히지 않아 예전 화면이 계속 남았다).
// 화면은 offline.js가 한 번 새로고침해 준다.
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(saveApp().then(saveVoice));
});

// 바뀐 뒤에 예전 앱 저장본과, 지금 목록에 없는 녹음을 지우고, 열려 있는 화면을 새 버전이 맡는다.
async function cleanUp() {
  const keys = await caches.keys();
  await Promise.all(keys.filter((k) => k.startsWith('elephant-') && k !== CACHE && k !== VOICE_CACHE).map((k) => caches.delete(k)));
  const voice = await caches.open(VOICE_CACHE);
  const keep = new Set(VOICE.map(voiceUrl));
  await Promise.all((await voice.keys()).filter((r) => !keep.has(r.url)).map((r) => voice.delete(r)));
}
self.addEventListener('activate', (event) => event.waitUntil(cleanUp().then(() => self.clients.claim())));

// 저장본에 없는 녹음은 인터넷에서 받아 오면서 저장해 둔다 (설치 때 못 받은 것)
function voiceKeyOf(url) {
  const path = new URL(url).pathname;
  const hit = VOICE.find(([f]) => new URL(urlOf(f)).pathname === path);
  return hit ? voiceUrl(hit) : null;
}
async function fetchAndKeep(request) {
  const res = await fetch(request);
  const key = voiceKeyOf(request.url);
  if (key && res.ok) {
    const copy = res.clone();
    caches.open(VOICE_CACHE).then((c) => c.put(key, copy)).catch(() => {});
  }
  return res;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  // 부분 요청(Range)은 저장본(파일 전체)으로 답할 수 없어 서버로 보낸다.
  // 앱의 녹음은 파일 전체를 받으므로(Web Audio) 여기에 해당하지 않는다.
  if (request.headers.has('range')) return;
  // 녹음 목록은 새 녹음을 넣었을 때 바로 반영되게 인터넷 먼저
  if (request.url.endsWith('/audio/voice/manifest.json')) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }
  // 페이지 열기(index.html)는 인터넷 먼저: 새 버전이 있으면 바로 보인다. 인터넷이 없을 때만 저장본.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request, { cache: 'no-cache' }).catch(() =>
        caches.match(request, { ignoreSearch: true, ignoreVary: true })
          .then((hit) => hit || caches.match('./index.html', { ignoreVary: true }))),
    );
    return;
  }
  // 그 밖에는 저장본 먼저 (인터넷이 없어도 열린다. 앱 파일은 이름에 내용 해시가 있어 늘 맞는 버전).
  // ignoreSearch: 녹음은 "?v=버전"을 붙여 저장했으므로. ignoreVary: 서버가 붙이는 Vary 때문에 못 찾는 일이 없게
  event.respondWith(
    caches.match(request, { ignoreSearch: true, ignoreVary: true })
      .then((hit) => hit || fetchAndKeep(request)),
  );
});
`;

export function offlineServiceWorker() {
  let outDir = 'dist';
  return {
    name: 'offline-service-worker',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const files = listFiles(outDir)
        .map((f) => relative(outDir, f).split(sep).join('/'))
        .filter((f) => f !== SW_FILE)
        // 옛날 브라우저용 .woff(같은 글꼴의 .woff2가 있음)와 숨김 파일(.gitkeep)은 저장하지 않는다
        .filter((f) => !f.endsWith('.woff') && !f.split('/').pop().startsWith('.'))
        .sort();
      const isVoice = (f) => f.startsWith(VOICE_DIR) && f.endsWith('.mp3');
      const read = (f) => readFileSync(join(outDir, f));
      const app = files.filter((f) => !isVoice(f));
      const voice = files.filter(isVoice).map((f) => [`./${f}`, hashOf(read(f))]);
      // 앱 저장 이름: 앱 파일과 저장 방식(sw.js 틀)이 같으면 그대로 (녹음만 바뀌면 앱은 다시 받지 않는다)
      const cache = `elephant-${hashOf(swSource('', [], []), ...app.flatMap((f) => [f, read(f)]))}`;
      writeFileSync(join(outDir, SW_FILE), swSource(cache, ['./', ...app.map((f) => `./${f}`)], voice));
      console.log(`[offline] ${SW_FILE}: 앱 파일 ${app.length}개 (${cache}) + 녹음 ${voice.length}개`);
    },
  };
}
