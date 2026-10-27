// 음성 목록 만들기 (npm run voice:list) — 앱 대사(src/audio)가 바뀌면 다시 실행한다.
// docs/음성 목록.md : 파일 이름 ↔ 문장 목록. 녹음은 npm run voice:azure 로 만든다.
import { mkdirSync, writeFileSync } from 'node:fs';
import { VOICE_LINES } from '../src/audio/voiceLines.js';

const groups = [...new Set(VOICE_LINES.map((l) => l.group))];
const linesOf = (g) => VOICE_LINES.filter((l) => l.group === g);
const cell = (s) => s.split('|').join('\\|'); // 표 칸 나눔 기호(|)가 문장에 있으면 글자로 보이게

const out = [
  '# 음성 목록',
  '',
  '`public/audio/voice/<파일 이름>.mp3` 가 있으면 그 녹음이 나와요. `npm run voice:azure` 로 아직 없는 문장을 만들어요.',
  '파일이 없는 문장은 브라우저 기본 음성으로 읽어요. 이 문서는 `npm run voice:list` 로 다시 만들 수 있어요(직접 고치지 마세요).',
  '',
  `모두 ${VOICE_LINES.length}개`,
];
for (const g of groups) {
  out.push('', `## ${g} (${linesOf(g).length}개)`, '', '| 파일 이름 | 문장 |', '|---|---|');
  linesOf(g).forEach((l) => out.push(`| ${l.id}.mp3 | ${cell(l.text)} |`));
}
mkdirSync(new URL('../docs/', import.meta.url), { recursive: true });
writeFileSync(new URL('../docs/음성 목록.md', import.meta.url), `${out.join('\n')}\n`);
console.log(`[voice] 음성 목록을 만들었어요 (${VOICE_LINES.length}문장).`);
