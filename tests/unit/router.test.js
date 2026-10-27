import { describe, test, expect } from 'vitest';
import { createRouter } from '../../src/app/router.js';

describe('화면 전환', () => {
  test('처음에는 아무 화면도 없다', () => {
    const router = createRouter({ screens: { start: {} }, onChange: () => {} });
    expect(router.current).toBeNull();
  });

  test('go로 화면을 바꾸면 onChange가 화면 이름과 값을 받는다', () => {
    const seen = [];
    const router = createRouter({ screens: { start: {}, map: {} }, onChange: (c) => seen.push(c) });

    router.go('start');
    router.go('map', { from: 'start' });

    expect(seen.map((c) => c.name)).toEqual(['start', 'map']);
    expect(router.current).toEqual({ name: 'map', params: { from: 'start' } });
  });

  test('없는 화면으로 가면 오류를 내고 지금 화면은 그대로다', () => {
    const router = createRouter({ screens: { start: {} }, onChange: () => {} });
    router.go('start');

    expect(() => router.go('nowhere')).toThrow();
    expect(router.current.name).toBe('start');
  });
});
