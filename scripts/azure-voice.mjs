// Azure 음성(TTS)으로 대사 녹음 만들기 (npm run voice:azure [-- --limit 3])
// 문장마다 public/audio/voice/<파일 이름>.mp3 로 저장한다. (4세 앱 scripts/azure-voice.mjs 를 3세 앱용으로 고친 것)
// 키는 파일에 적지 않고 실행할 때 환경 변수로 넣는다: AZURE_SPEECH_KEY, AZURE_SPEECH_REGION (예: koreacentral)
// 이미 파일이 있는 문장은 건너뛴다(4세 앱에서 복사한 녹음 포함). 다시 만들려면 --force.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { VOICE_LINES } from '../src/audio/voiceLines.js';

const VOICE = 'ko-KR-SeoHyeonNeural'; // 서현: 아이 목소리
const RATE = '+10%'; // 말 속도 (기본보다 빠르게)
const PITCH = '+8%'; // 목소리 높이 (높을수록 밝게)
const FORMAT ='audio-24khz-48kbitrate-mono-mp3';
const GAP_MS = 3100; // 무료 요금제(F0)는 1분에 20번까지
const BUSY_WAIT_MS = 15000; // 너무 많이 보냈다(429)고 하면 기다렸다 다시
const MAX_TRIES = 4;

const OUT_DIR = fileURLToPath(new URL('../public/audio/voice/', import.meta.url));

const key = process.env.AZURE_SPEECH_KEY;
const region = process.env.AZURE_SPEECH_REGION;
if (!key || !region) {
  console.error('[azure] AZURE_SPEECH_KEY 와 AZURE_SPEECH_REGION 을 먼저 넣어 주세요.');
  process.exit(1);
}

const args = process.argv.slice(2);
const limitAt = args.indexOf('--limit');
const limit = limitAt >= 0 ? Number(args[limitAt + 1]) : Infinity;
const force = args.includes('--force');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const escapeXml = (s) => s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]);
const ssml = (text) =>
  `<speak version="1.0" xml:lang="ko-KR"><voice name="${VOICE}"><prosody rate="${RATE}" pitch="${PITCH}">${escapeXml(text)}</prosody></voice></speak>`;

async function synth(text) {
  for (let tryNo = 1; tryNo <= MAX_TRIES; tryNo += 1) {
    const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': FORMAT,
        'User-Agent': 'elephant-numbers-3',
      },
      body: ssml(text),
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if (res.status === 401) throw new Error('키 또는 지역이 맞지 않아요 (401).');
    if (res.status !== 429 && res.status < 500) throw new Error(`Azure 오류 ${res.status}: ${await res.text()}`);
    console.warn(`  잠시 기다렸다 다시 보내요 (${res.status}, ${tryNo}번째)`);
    await sleep(BUSY_WAIT_MS);
  }
  throw new Error('여러 번 다시 보내도 실패했어요.');
}

const fileOf = (line) => `${OUT_DIR}${line.id}.mp3`;
const missing = VOICE_LINES.filter((l) => force || !existsSync(fileOf(l)));
const todo = missing.slice(0, limit);
console.log(`[azure] ${VOICE} · 만들 문장 ${todo.length}개 (이미 있는 것 ${VOICE_LINES.length - missing.length}개, 전체 ${VOICE_LINES.length}개)`);
mkdirSync(OUT_DIR, { recursive: true });

let made = 0;
try {
  for (const [i, line] of todo.entries()) {
    if (i > 0) await sleep(GAP_MS);
    writeFileSync(fileOf(line), await synth(line.text));
    made += 1;
    if (made % 20 === 0 || made === todo.length) console.log(`  ${made}/${todo.length}`);
  }
} catch (error) {
  console.error(`[azure] 멈췄어요: ${error.message} 다시 실행하면 이어서 만들어요.`);
  process.exitCode = 1;
}
console.log(`[azure] ${made}개를 만들었어요.`);
