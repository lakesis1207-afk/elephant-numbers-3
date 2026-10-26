import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { allArtPaths, artUrl } from '../../src/art.js';
import { VILLAGES, ALL_GAMES } from '../../src/games/villages.js';
import { GAME_KEYS, LEVELS, makeQuestion } from '../../src/games/questions.js';

const IMAGES = new URL('../../public/images/', import.meta.url);

describe('그림', () => {
  it('목록의 모든 그림 파일이 있다', () => {
    for (const p of allArtPaths()) expect(existsSync(new URL(p, IMAGES)), p).toBe(true);
  });

  it('마을·게임·스티커가 쓰는 그림이 모두 목록에 있다', () => {
    for (const v of VILLAGES) [v.background, ...v.animals].forEach((n) => expect(() => artUrl(n)).not.toThrow());
    for (const g of ALL_GAMES) [g.icon, g.sticker].forEach((n) => expect(() => artUrl(n)).not.toThrow());
    expect(new Set(ALL_GAMES.map((g) => g.sticker)).size).toBe(9);
  });

  it('문제가 쓰는 그림이 모두 목록에 있다', () => {
    for (const key of GAME_KEYS) {
      for (const range of LEVELS) {
        for (let i = 0; i < 50; i++) {
          const q = makeQuestion(key, { range });
          const names = [q.fruit, q.target, ...(q.sequence ?? []), ...q.choices.map((c) => c.art)].filter(Boolean);
          names.forEach((n) => expect(() => artUrl(n), `${key}: ${n}`).not.toThrow());
        }
      }
    }
  });

  it('없는 그림 이름은 오류를 낸다', () => {
    expect(() => artUrl('없는그림')).toThrow();
  });
});
