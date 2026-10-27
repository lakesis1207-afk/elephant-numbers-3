import { describe, test, expect } from 'vitest';
import { balloonGame, BALLOON_CHOICES } from '../../src/games/savanna/balloon.js';
import { pickDistinct } from '@공통/games/questions.js';

describe('풍선 터뜨리기 (1단계, 만 3세)', () => {
  test('난이도는 1~4 → 1~7 → 1~10 이다', () => {
    expect(balloonGame.levels).toEqual([[1, 4], [1, 7], [1, 10]]);
  });

  test('풍선은 3개다', () => {
    expect(BALLOON_CHOICES).toBe(3);
  });

  test('가장 쉬운 범위(1~4)에서도 정답을 포함한 서로 다른 수 3개가 나온다', () => {
    for (let answer = 1; answer <= 4; answer += 1) {
      const list = pickDistinct(answer, 1, 4, BALLOON_CHOICES);
      expect(list).toHaveLength(3);
      expect(new Set(list).size).toBe(3);
      expect(list).toContain(answer);
    }
  });
});
