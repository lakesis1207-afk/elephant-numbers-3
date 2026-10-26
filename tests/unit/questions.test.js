import { describe, expect, it } from 'vitest';
import { GAME_KEYS, LEVELS, makeQuestion } from '../../src/games/questions.js';
import { ALL_GAMES, VILLAGES } from '../../src/games/villages.js';

describe('마을과 게임 구성', () => {
  it('마을 3개, 게임 9개이고 키가 겹치지 않는다', () => {
    expect(VILLAGES).toHaveLength(3);
    expect(ALL_GAMES).toHaveLength(9);
    expect(new Set(ALL_GAMES.map((g) => g.key)).size).toBe(9);
  });

  it('모든 게임에 문제 만들기가 있다', () => {
    expect([...GAME_KEYS].sort()).toEqual(ALL_GAMES.map((g) => g.key).sort());
  });
});

describe('문제 만들기', () => {
  for (const { key } of ALL_GAMES.filter((g) => g.key !== 'count')) {
    it(`${key}: 보기 2개 중 정답은 정확히 하나, 두 보기는 서로 다르다`, () => {
      for (const range of LEVELS) {
        for (let i = 0; i < 100; i++) {
          const q = makeQuestion(key, { range, last: q0(i) });
          expect(q.choices).toHaveLength(2);
          expect(q.choices.filter((c) => c.right)).toHaveLength(1);
          expect(q.choices[0].label).not.toBe(q.choices[1].label);
          expect(q.prompt.length).toBeGreaterThan(0);
        }
      }
    });
  }

  it('세어 주기: 단계 범위 안의 수를 담고, 과일 더미는 필요한 수보다 많다(10이면 10개)', () => {
    for (const range of LEVELS) {
      for (let i = 0; i < 100; i++) {
        const q = makeQuestion('count', { range });
        expect(q.n).toBeGreaterThanOrEqual(range[0]);
        expect(q.n).toBeLessThanOrEqual(range[1]);
        expect(q.pile).toBeLessThanOrEqual(10);
        expect(q.pile).toBeGreaterThan(Math.min(q.n, 9));
      }
    }
  });

  it('많다/적다: "더 많을까?"에는 큰 수가 정답이다', () => {
    for (let i = 0; i < 100; i++) {
      const q = makeQuestion('more', { range: [1, 5] });
      const [right, wrong] = [q.choices.find((c) => c.right), q.choices.find((c) => !c.right)];
      if (q.prompt.includes('많')) expect(right.count).toBeGreaterThan(wrong.count);
      else expect(right.count).toBeLessThan(wrong.count);
    }
  });

  it('한눈에 알기: 점은 1~3개만 보여 준다', () => {
    for (let i = 0; i < 100; i++) expect(makeQuestion('subitize', { range: [1, 10] }).count).toBeLessThanOrEqual(3);
  });

  it('모르는 게임이면 오류를 낸다', () => {
    expect(() => makeQuestion('nope')).toThrow();
  });
});

const q0 = (i) => (i % 5) + 1;

describe('대사', () => {
  it('힌트: 세는 게임만 "세어", 한눈에 알기는 세라고 하지 않는다', async () => {
    const { hintFor } = await import('../../src/games/questions.js');
    expect(hintFor('count')).toContain('세어');
    expect(hintFor('subitize')).not.toContain('세');
    expect(hintFor('shape')).not.toContain('세');
  });

  it('칭찬과 안내에 "잘 했어" 띄어쓰기 오류가 없다', async () => {
    const { PRAISE } = await import('../../src/games/logic.js');
    expect(PRAISE.join(' ')).not.toContain('잘 했');
  });
});
