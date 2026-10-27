// 선 긋기 게임 3종: 마을마다 길 모양이 다르다 (key는 각 마을 파일의 games[].key와 같다)
import { makeLineGame } from './makeLineGame.js';
import { LINE_ROAD_PROMPT, LINE_CURVY_PROMPT, LINE_ZIGZAG_PROMPT } from '../../audio/villageScript.js';

// 사바나: 곧은 길 (코끼리 → 물웅덩이)
export const roadGame = makeLineGame({
  key: 'road',
  background: 'savanna-base',
  kind: 'straight',
  traveler: { kind: 'character', name: 'elephant' },
  goal: { kind: 'prop', name: 'pond' },
  prompt: LINE_ROAD_PROMPT,
  color: '#ff8a3d',
});

// 숲속: 꼬불꼬불 길 (다람쥐 → 도토리)
export const curvyGame = makeLineGame({
  key: 'curvy',
  background: 'forest-base',
  kind: 'curve',
  traveler: { kind: 'character', name: 'squirrel' },
  goal: { kind: 'prop', name: 'acorn' },
  prompt: LINE_CURVY_PROMPT,
  color: '#e85d9a',
});

// 바닷가: 지그재그 길 (게 → 조개)
export const zigzagGame = makeLineGame({
  key: 'zigzag',
  background: 'sea-base',
  kind: 'zigzag',
  traveler: { kind: 'character', name: 'crab' },
  goal: { kind: 'prop', name: 'shell' },
  prompt: LINE_ZIGZAG_PROMPT,
  color: '#ff6b5e',
});
