import { describe, test, expect } from 'vitest';
import { NATIVE, ADJ, PRAISE, DICE, nearChoices, pickNumber, tenFrame, shuffle } from '@공통/games/logic.js';

// 정해진 순서로 값을 돌려주는 가짜 Math.random
const seq = (...values) => {
  let i = 0;
  return () => values[i++ % values.length];
};

describe('말 목록', () => {
  test('고유어로 1부터 10까지 셀 수 있다', () => {
    expect(NATIVE[1]).toBe('하나');
    expect(NATIVE[10]).toBe('열');
    expect(ADJ[3]).toBe('세');
  });

  test('칭찬에는 과정 칭찬이 섞여 있다', () => {
    expect(PRAISE.length).toBeGreaterThanOrEqual(4);
    expect(PRAISE.some((p) => p.includes('끝까지'))).toBe(true);
  });
});

describe('nearChoices: 정답 + 가까운 수 2개', () => {
  test('보기는 3개이고 모두 다르며 정답이 들어 있다', () => {
    for (let n = 1; n <= 10; n++) {
      const opts = nearChoices(n, 1, 10);
      expect(opts).toHaveLength(3);
      expect(new Set(opts).size).toBe(3);
      expect(opts).toContain(n);
    }
  });

  test('보기는 범위 안에 있고 정답과 2 이하로 차이 난다', () => {
    for (let k = 0; k < 50; k++) {
      const opts = nearChoices(1, 1, 6);
      opts.forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(1);
        expect(v).toBeLessThanOrEqual(6);
        expect(Math.abs(v - 1)).toBeLessThanOrEqual(2);
      });
    }
  });

  test('범위가 좁아 3개를 못 만들면 있는 만큼만 준다', () => {
    expect(nearChoices(1, 1, 2).sort()).toEqual([1, 2]);
  });
});

describe('pickNumber', () => {
  test('바로 앞 문제와 같은 수는 피한다', () => {
    // 첫 값은 3(=앞 문제)이 나오게 하고, 다음 값은 5가 나오게 한다
    const rnd = seq(0.4, 0.9);
    expect(pickNumber(1, 5, 3, rnd)).toBe(5);
  });

  test('범위 안의 수만 고른다', () => {
    for (let k = 0; k < 50; k++) {
      const n = pickNumber(3, 7, 0);
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThanOrEqual(7);
    }
  });

  test('범위에 수가 하나뿐이면 같은 수라도 준다', () => {
    expect(pickNumber(2, 2, 2)).toBe(2);
  });
});

describe('tenFrame과 DICE', () => {
  test('텐프레임은 10칸 중 앞에서부터 n칸이 채워진다', () => {
    const cells = tenFrame(4);
    expect(cells).toHaveLength(10);
    expect(cells.filter(Boolean)).toHaveLength(4);
    expect(cells.slice(0, 4).every(Boolean)).toBe(true);
  });

  test('주사위 배치는 1~6 모두 무늬 수가 맞고 3×3 칸 안에 있다', () => {
    for (let n = 1; n <= 6; n++) {
      expect(DICE[n]).toHaveLength(n);
      DICE[n].forEach((cell) => {
        expect(cell).toBeGreaterThanOrEqual(0);
        expect(cell).toBeLessThan(9);
      });
    }
  });
});

test('shuffle은 원래 배열을 바꾸지 않는다', () => {
  const original = [1, 2, 3, 4];
  const mixed = shuffle(original);
  expect(original).toEqual([1, 2, 3, 4]);
  expect([...mixed].sort()).toEqual([1, 2, 3, 4]);
});
