import { describe, test, expect } from 'vitest';
import { localDay } from '../../src/app/time.js';

describe('오늘 날짜', () => {
  test('기기 시간대 기준 YYYY-MM-DD로 만든다', () => {
    // 2026년 10월 21일 오전 8시 (한국 아침: UTC로는 아직 20일)
    const morning = new Date(2026, 9, 21, 8, 0, 0);
    expect(localDay(morning)).toBe('2026-10-21');
  });

  test('한 자리 달과 날에는 0을 붙인다', () => {
    expect(localDay(new Date(2026, 0, 5, 12))).toBe('2026-01-05');
  });
});
