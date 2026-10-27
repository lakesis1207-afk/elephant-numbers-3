// public/audio/voice 폴더의 mp3 파일을 보고 manifest.json(녹음이 있는 문장 목록)을 만든다.
// 빌드·개발 서버 시작 전에 자동으로 실행된다 (package.json의 prebuild·predev).
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('../public/audio/voice/', import.meta.url));
const ids = readdirSync(dir)
  .filter((f) => f.endsWith('.mp3'))
  .map((f) => f.slice(0, -'.mp3'.length))
  .sort();
writeFileSync(join(dir, 'manifest.json'), `${JSON.stringify(ids, null, 2)}\n`);
console.log(`[voice] 녹음 파일 ${ids.length}개를 목록에 넣었어요.`);
