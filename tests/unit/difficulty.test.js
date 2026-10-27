import { describe, test, expect } from 'vitest';
import { startDifficulty, nextDifficulty, rangeOf } from '@공통/games/difficulty.js';

const LEVELS = [
  [1, 3],
  [2, 5],
  [3, 6],
];

const play = (state, results) => results.reduce((s, r) => nextDifficulty(s, r, LEVELS.length), state);

describe('적응형 난이도', () => {
  test('처음에는 가장 쉬운 단계에서 시작한다', () => {
    const s = startDifficulty();
    expect(s.level).toBe(0);
    expect(rangeOf(s, LEVELS)).toEqual([1, 3]);
  });

  test('한 번에 3번 연속 맞히면 한 단계 올라간다', () => {
    const s = play(startDifficulty(), ['first', 'first', 'first']);
    expect(s.level).toBe(1);
    expect(s.streak).toBe(0);
  });

  test('2번 연속은 그대로다', () => {
    expect(play(startDifficulty(), ['first', 'first']).level).toBe(0);
  });

  test('한 번 틀리고 맞히면 연속 기록이 처음부터 다시 시작된다', () => {
    const s = play(startDifficulty(), ['first', 'first', 'retry', 'first', 'first']);
    expect(s.level).toBe(0);
    expect(s.streak).toBe(2);
  });

  test('힌트를 받은 문제(2번 틀림) 다음에는 한 단계 쉬워진다', () => {
    const s = play(startDifficulty(), ['first', 'first', 'first', 'hinted']);
    expect(s.level).toBe(0);
  });

  test('가장 쉬운 단계 아래로, 가장 어려운 단계 위로는 가지 않는다', () => {
    expect(play(startDifficulty(), ['hinted']).level).toBe(0);
    expect(play(startDifficulty(), Array(12).fill('first')).level).toBe(2);
  });

  test('원래 상태는 바뀌지 않는다', () => {
    const s = startDifficulty();
    nextDifficulty(s, 'first', 3);
    expect(s).toEqual({ level: 0, streak: 0 });
    expect(Object.isFrozen(s)).toBe(true);
  });

  test('모르는 결과를 넣으면 오류를 낸다', () => {
    expect(() => nextDifficulty(startDifficulty(), 'oops', 3)).toThrow();
  });
});
