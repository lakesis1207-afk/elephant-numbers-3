import { describe, test, expect } from 'vitest';
import { VILLAGES, findVillage, isVillageOpen, previousVillage } from '../../src/villages/index.js';
import { SAVANNA } from '../../src/villages/savanna.js';
import { DEFAULT_PROGRESS } from '../../src/storage/progress.js';
import { findGame } from '../../src/games/index.js';

const fresh = { ...DEFAULT_PROGRESS, day: '2026-10-21' };

describe('마을 목록', () => {
  test('지도에는 마을 3개가 순서대로 있다', () => {
    expect(VILLAGES.map((v) => v.key)).toEqual(['savanna', 'forest', 'sea']);
  });

  test('사바나 마을에는 동물 9마리와 게임 3개가 있다', () => {
    expect(SAVANNA.animals).toHaveLength(9);
    expect(SAVANNA.animals[0].key).toBe('elephant');
    expect(SAVANNA.games.map((g) => g.key)).toEqual(['fruit', 'balloon', 'road']);
  });

  test('모든 마을에 이야기와 게임 3개가 있고, 게임마다 화면이 있다', () => {
    VILLAGES.forEach((v) => {
      expect(v.detail, v.key).toBeTruthy();
      expect(v.detail.key).toBe(v.key);
      expect(v.detail.story.enterVoice).toBeTruthy();
      expect(v.detail.games).toHaveLength(3);
      v.detail.games.forEach((g) => expect(findGame(v.key, g.key).ask).toBeTypeOf('function'));
    });
  });

  test('게임 이름(key)과 동물 이름(key)은 모든 마을을 통틀어 한 번씩만 쓴다 (기록이 섞이지 않게)', () => {
    const games = VILLAGES.flatMap((v) => v.detail.games.map((g) => g.key));
    const animals = VILLAGES.flatMap((v) => v.detail.animals.map((a) => a.key));
    expect(new Set(games).size).toBe(games.length);
    expect(new Set(animals).size).toBe(animals.length);
  });

  test('없는 마을을 찾으면 오류를 낸다', () => {
    expect(() => findVillage('moon')).toThrow();
    expect(() => findGame('savanna', 'oops')).toThrow();
  });
});

describe('마을 열림 규칙', () => {
  test('처음에는 사바나만 열려 있다', () => {
    const open = VILLAGES.filter((v) => isVillageOpen(v.key, fresh)).map((v) => v.key);
    expect(open).toEqual(['savanna']);
  });

  test('앞 마을을 끝낼 때마다 다음 마을이 하나씩 열린다', () => {
    expect(isVillageOpen('forest', { ...fresh, forestOpen: true })).toBe(true);
    expect(isVillageOpen('sea', { ...fresh, forestOpen: true })).toBe(false);
    expect(isVillageOpen('sea', { ...fresh, seaOpen: true })).toBe(true);
  });

  test('잠긴 마을은 바로 앞 마을을 알려 준다', () => {
    expect(previousVillage('forest').key).toBe('savanna');
    expect(previousVillage('sea').key).toBe('forest');
    expect(previousVillage('savanna')).toBeNull();
  });

  test('부모님이 모든 마을을 열면 다 열린다', () => {
    const all = { ...fresh, allOpen: true };
    expect(VILLAGES.every((v) => isVillageOpen(v.key, all))).toBe(true);
  });
});
