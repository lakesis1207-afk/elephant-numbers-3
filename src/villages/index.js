// 마을 목록과 열림 규칙. 새 마을은 여기에 한 줄 추가하고, 마을 파일(savanna.js처럼)을 만든다.
// 지도 순서대로 앞 마을의 게임 3개를 다 끝내면 다음 마을이 열린다.
import { SAVANNA } from './savanna.js';
import { FOREST } from './forest.js';
import { SEA } from './sea.js';

// openFlag: 이 마을이 열렸는지 저장하는 기록 이름 (사바나는 늘 열림)
export const VILLAGES = Object.freeze([
  { key: 'savanna', name: '사바나 마을', character: 'elephant', round: false, detail: SAVANNA, openFlag: null },
  { key: 'forest', name: '숲속 마을', character: 'rabbit', round: false, detail: FOREST, openFlag: 'forestOpen' },
  { key: 'sea', name: '바닷가 마을', character: 'penguin', round: false, detail: SEA, openFlag: 'seaOpen' },
]);

export function findVillage(key) {
  const village = VILLAGES.find((v) => v.key === key);
  if (!village) throw new Error(`[villages] 없는 마을입니다: ${key}`);
  return village;
}

const indexOf = (key) => VILLAGES.indexOf(findVillage(key));

/** 지도에서 바로 앞 마을 (사바나는 null) */
export const previousVillage = (key) => VILLAGES[indexOf(key) - 1] ?? null;

/** 이 마을을 끝내면 열리는 마을 (마지막 마을은 null) */
export const nextVillage = (key) => VILLAGES[indexOf(key) + 1] ?? null;

/** 사바나는 늘 열림, 나머지는 앞 마을을 다 끝내면(openFlag), 부모님이 열면 모두 열림 */
export function isVillageOpen(key, progress) {
  const { openFlag } = findVillage(key);
  if (!openFlag || progress.allOpen) return true;
  return Boolean(progress[openFlag]);
}
