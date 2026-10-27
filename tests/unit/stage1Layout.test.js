import { describe, test, expect } from 'vitest';
import { VILLAGES } from '../../src/villages/index.js';
import { findGame } from '../../src/games/index.js';
import { fruitGame, FRUIT_MAX } from '../../src/games/savanna/fruit.js';
import { pondGame, MAX_HIPPOS } from '../../src/games/forest/pond.js';
import { spotsGame, SPOTS_MAX } from '../../src/games/sea/spots.js';
import { compareGame } from '../../src/games/sea/index.js';

const STAGE1 = [[1, 3], [1, 4], [1, 5]]; // 만 3세: 1~3 → 1~4 → 1~5

describe('1단계 마을 구성', () => {
  test('마을마다 [세기·짝짓기·많다적다 쪽, 풍선, 선 긋기] 게임 3개가 있다', () => {
    const games = Object.fromEntries(VILLAGES.map((v) => [v.key, v.detail.games.map((g) => g.key)]));
    expect(games).toEqual({
      savanna: ['fruit', 'balloon', 'road'],
      forest: ['pond', 'blow', 'curvy'],
      sea: ['compare', 'spots', 'zigzag'],
    });
  });

  test('게임 배경은 그 게임이 있는 마을 배경이다', () => {
    VILLAGES.forEach((v) =>
      v.detail.games.forEach((g) => expect(findGame(v.key, g.key).background, `${v.key}/${g.key}`).toBe(`${v.key}-base`)),
    );
  });

  test('모든 게임의 수는 10을 넘지 않는다', () => {
    VILLAGES.forEach((v) =>
      v.detail.games.forEach((g) =>
        findGame(v.key, g.key).levels.forEach(([lo, hi]) => {
          expect(lo).toBeGreaterThanOrEqual(0);
          expect(hi).toBeLessThanOrEqual(10);
        }),
      ),
    );
  });
});

describe('세기·짝짓기·많다적다·무늬 보기는 1~3 → 1~4 → 1~5', () => {
  test('과일 세기 (세기): 범위와 숫자 보기가 5를 넘지 않는다', () => {
    expect(fruitGame.levels).toEqual(STAGE1);
    expect(FRUIT_MAX).toBe(5);
  });

  test('물웅덩이 채우기 (짝짓기): 범위, 하마는 많아야 6마리', () => {
    expect(pondGame.levels).toEqual(STAGE1);
    expect(MAX_HIPPOS).toBe(6);
  });

  test('누가 더 많아? (많다·적다): 범위 (세 번째 수는 두 줄의 최소 차이)', () => {
    expect(compareGame.levels.map(([lo, hi]) => [lo, hi])).toEqual(STAGE1);
    compareGame.levels.forEach((level) => expect(level[2]).toBeGreaterThanOrEqual(1));
  });

  test('반짝 무늬 보기: 범위와 숫자 보기가 5를 넘지 않는다', () => {
    expect(spotsGame.levels).toEqual(STAGE1);
    expect(SPOTS_MAX).toBe(5);
  });
});
