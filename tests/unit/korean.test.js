import { describe, test, expect } from 'vitest';
import { withTopic, withSubject, withObject } from '@공통/app/korean.js';

describe('은/는 붙이기', () => {
  test('받침이 있으면 "은"', () => {
    expect(withTopic('숲속 마을')).toBe('숲속 마을은');
    expect(withTopic('바닷가 마을')).toBe('바닷가 마을은');
  });

  test('받침이 없으면 "는"', () => {
    expect(withTopic('공룡 나라')).toBe('공룡 나라는');
  });
});

describe('이/가 붙이기', () => {
  test('받침이 있으면 "이", 없으면 "가"', () => {
    expect(withSubject('숲속 마을')).toBe('숲속 마을이');
    expect(withSubject('공룡 나라')).toBe('공룡 나라가');
  });
});

describe('을/를 붙이기', () => {
  test('받침이 있으면 "을", 없으면 "를"', () => {
    expect(withObject('숲속 마을')).toBe('숲속 마을을');
    expect(withObject('삼십오')).toBe('삼십오를');
  });
});
