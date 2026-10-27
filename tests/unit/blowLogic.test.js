import { describe, test, expect } from 'vitest';
import { BLOW_MAX_SCALE, blowScale, nextPress, isBlown } from '../../src/games/blowLogic.js';

describe('풍선 불기 계산', () => {
  test('아직 안 눌렀으면 처음 크기(1배)다', () => {
    expect(blowScale(0, 5)).toBe(1);
  });

  test('정해진 수만큼 누르면 처음의 2.5배가 된다', () => {
    expect(BLOW_MAX_SCALE).toBe(2.5);
    [1, 4, 7, 10].forEach((n) => expect(blowScale(n, n)).toBeCloseTo(2.5, 10));
  });

  test('누를수록 점점 커진다', () => {
    const sizes = Array.from({ length: 11 }, (_, k) => blowScale(k, 10));
    sizes.slice(1).forEach((s, i) => expect(s).toBeGreaterThan(sizes[i]));
  });

  test('수를 넘겨 눌러도 2.5배보다 커지지 않는다', () => {
    expect(blowScale(12, 10)).toBeCloseTo(2.5, 10);
  });

  test('누를 때마다 1씩 늘고, 정해진 수에서 멈춘다', () => {
    expect(nextPress(0, 3)).toBe(1);
    expect(nextPress(2, 3)).toBe(3);
    expect(nextPress(3, 3)).toBe(3);
  });

  test('정해진 수만큼 눌렀을 때만 터진다', () => {
    expect(isBlown(2, 3)).toBe(false);
    expect(isBlown(3, 3)).toBe(true);
    expect(isBlown(0, 1)).toBe(false);
    expect(isBlown(1, 1)).toBe(true);
  });
});
