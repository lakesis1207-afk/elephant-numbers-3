import { describe, test, expect } from 'vitest';
import { nativeCount, nativeAdj, sinoWord, tensChoices } from '@공통/games/numbers.js';

describe('고유어로 세기 (하나~서른아홉)', () => {
  test('세는 말', () => {
    expect([1, 10, 11, 15, 20, 21, 30, 39].map(nativeCount)).toEqual(
      ['하나', '열', '열하나', '열다섯', '스물', '스물하나', '서른', '서른아홉'],
    );
  });

  test('단위 앞에 붙는 말 (열한 개, 스무 개, 스물두 마리)', () => {
    expect([3, 10, 11, 14, 20, 22, 30, 33].map(nativeAdj)).toEqual(
      ['세', '열', '열한', '열네', '스무', '스물두', '서른', '서른세'],
    );
  });

  test('범위 밖이면 오류를 낸다', () => {
    expect(() => nativeCount(0)).toThrow();
    expect(() => nativeAdj(100)).toThrow();
  });
});

describe('한자어로 숫자 읽기 (일~백)', () => {
  test('읽는 말', () => {
    expect([1, 9, 10, 11, 14, 20, 35, 99, 100].map(sinoWord)).toEqual(
      ['일', '구', '십', '십일', '십사', '이십', '삼십오', '구십구', '백'],
    );
  });

  test('범위 밖이면 오류를 낸다', () => {
    expect(() => sinoWord(0)).toThrow();
    expect(() => sinoWord(101)).toThrow();
  });
});

describe('열 단위 보기', () => {
  test('정답 + 10씩 가까운 수 2개, 10~100 안에서', () => {
    for (const answer of [10, 50, 100]) {
      const opts = tensChoices(answer);
      expect(opts).toHaveLength(3);
      expect(opts).toContain(answer);
      opts.forEach((v) => {
        expect(v % 10).toBe(0);
        expect(v).toBeGreaterThanOrEqual(10);
        expect(v).toBeLessThanOrEqual(100);
        expect(Math.abs(v - answer)).toBeLessThanOrEqual(20);
      });
    }
  });
});
