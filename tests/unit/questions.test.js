import { describe, test, expect } from 'vitest';
import {
  pickDistinct, comparePair, patternQuestion, PATTERN_TYPES, stepsQuestion, addSubQuestion, splitTens,
} from '@공통/games/questions.js';

const many = (fn, times = 200) => Array.from({ length: times }, fn);

describe('pickDistinct: 서로 다른 수 고르기 (풍선)', () => {
  test('정답이 들어 있고, 모두 다르고, 범위 안에 있다', () => {
    many(() => pickDistinct(14, 11, 20, 5)).forEach((list) => {
      expect(list).toHaveLength(5);
      expect(list).toContain(14);
      expect(new Set(list).size).toBe(5);
      list.forEach((v) => expect(v >= 11 && v <= 20).toBe(true));
    });
  });

  test('범위가 좁으면 있는 만큼만', () => {
    expect(pickDistinct(1, 1, 3, 5).sort()).toEqual([1, 2, 3]);
  });
});

describe('comparePair: 많다/적다 비교 두 묶음', () => {
  test('두 수는 다르고 범위 안에 있다', () => {
    many(() => comparePair([1, 5])).forEach(([a, b]) => {
      expect(a).not.toBe(b);
      [a, b].forEach((v) => expect(v >= 1 && v <= 5).toBe(true));
    });
  });

  test('쉬운 단계(차이 2 이상)', () => {
    many(() => comparePair([1, 5], 2)).forEach(([a, b]) => expect(Math.abs(a - b)).toBeGreaterThanOrEqual(2));
  });
});

describe('patternQuestion: 무늬 잇기', () => {
  const ITEMS = ['penguin', 'fish', 'shell', 'star'];

  test('규칙대로 되풀이하고, 물음표 자리의 정답이 규칙의 다음 것이다', () => {
    PATTERN_TYPES.forEach((type, t) => {
      many(() => patternQuestion(t, ITEMS), 30).forEach((q) => {
        const unit = type.length;
        expect(q.sequence.length).toBeGreaterThanOrEqual(unit * 2);
        q.sequence.forEach((item, i) => expect(item).toBe(q.sequence[i % unit]));
        expect(q.answer).toBe(q.sequence[q.sequence.length % unit]);
      });
    });
  });

  test('보기는 3개, 서로 다르고 정답이 들어 있다', () => {
    many(() => patternQuestion(2, ITEMS)).forEach((q) => {
      expect(q.options).toHaveLength(3);
      expect(new Set(q.options).size).toBe(3);
      expect(q.options).toContain(q.answer);
    });
  });
});

describe('stepsQuestion: 이어지는 수의 빈칸', () => {
  test('5개가 1씩 커지고 범위 안에 있다', () => {
    many(() => stepsQuestion([10, 100, 'any'])).forEach((q) => {
      expect(q.numbers).toHaveLength(5);
      q.numbers.forEach((v, i) => {
        if (i > 0) expect(v).toBe(q.numbers[i - 1] + 1);
        expect(v >= 10 && v <= 100).toBe(true);
      });
      expect(q.answer).toBe(q.numbers[q.blank]);
    });
  });

  test('쉬운 단계는 늘 마지막(다음 수)이 빈칸', () => {
    many(() => stepsQuestion([1, 10, 'end'])).forEach((q) => expect(q.blank).toBe(4));
  });
});

describe('addSubQuestion: 10 이하 더하기·빼기', () => {
  test('답이 범위 안에 있고, 시작·바뀐 수는 1 이상, 모든 수가 10 이하', () => {
    many(() => addSubQuestion([2, 8])).forEach((q) => {
      expect(['add', 'sub']).toContain(q.op);
      expect(q.start).toBeGreaterThanOrEqual(1);
      expect(q.change).toBeGreaterThanOrEqual(1);
      expect(q.answer >= 2 && q.answer <= 8).toBe(true);
      expect(q.op === 'add' ? q.start + q.change : q.start - q.change).toBe(q.answer);
      expect(Math.max(q.start, q.answer)).toBeLessThanOrEqual(10);
    });
  });

  test('더하기와 빼기가 모두 나온다', () => {
    const ops = new Set(many(() => addSubQuestion([3, 6]).op));
    expect(ops).toEqual(new Set(['add', 'sub']));
  });
});

describe('splitTens: 묶음과 낱개', () => {
  test('23 → 묶음 2개, 낱개 3개', () => {
    expect(splitTens(23)).toEqual({ bundles: 2, ones: 3 });
    expect(splitTens(30)).toEqual({ bundles: 3, ones: 0 });
  });
});
