// 마을별 게임 목록. 게임 화면(screens/game.js)이 마을·게임 이름으로 찾는다.
import { SAVANNA_GAMES } from './savanna/index.js';
import { FOREST_GAMES } from './forest/index.js';
import { SEA_GAMES } from './sea/index.js';

const GAMES_BY_VILLAGE = Object.freeze({
  savanna: SAVANNA_GAMES,
  forest: FOREST_GAMES,
  sea: SEA_GAMES,
});

export function findGame(village, key) {
  const game = GAMES_BY_VILLAGE[village]?.[key];
  if (!game) throw new Error(`[game] 없는 게임입니다: ${village}/${key}`);
  return game;
}
