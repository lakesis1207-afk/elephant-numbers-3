import { describe, test, expect } from 'vitest';
import { VIEW, LINE_KINDS, LEVELS, pathsFor, pickPath, toleranceFor } from '../../src/games/linePaths.js';
import { buildPath } from '../../src/games/lineTrace.js';

const MARGIN = 8;
const turns = (points) => {
  // 방향이 꺾이는 곳의 수 (지그재그가 점점 많이 꺾이는지 볼 때 쓴다)
  let count = 0;
  for (let i = 1; i < points.length - 1; i += 1) {
    const a = Math.sign(points[i][1] - points[i - 1][1]);
    const b = Math.sign(points[i + 1][1] - points[i][1]);
    if (a !== 0 && b !== 0 && a !== b) count += 1;
  }
  return count;
};

describe('길 모양', () => {
  test('모양은 직선, 곡선, 지그재그 세 가지고 난이도는 3단계다', () => {
    expect(LINE_KINDS).toEqual(['straight', 'curve', 'zigzag']);
    expect(LEVELS).toBe(3);
  });

  test.each(LINE_KINDS.flatMap((kind) => [0, 1, 2].map((level) => [kind, level])))(
    '%s 단계 %i: 길이 화면 안에 있고, 왼쪽에서 오른쪽으로 가며, 충분히 길다',
    (kind, level) => {
      const variants = pathsFor(kind, level);
      expect(variants.length).toBeGreaterThanOrEqual(2);
      variants.forEach(({ points }) => {
        points.forEach(([x, y]) => {
          expect(x).toBeGreaterThanOrEqual(MARGIN);
          expect(x).toBeLessThanOrEqual(VIEW.width - MARGIN);
          expect(y).toBeGreaterThanOrEqual(MARGIN);
          expect(y).toBeLessThanOrEqual(VIEW.height - MARGIN);
        });
        expect(points[0][0]).toBeLessThan(points.at(-1)[0]);
        expect(buildPath(points).length).toBeGreaterThan(60);
      });
    },
  );

  test('모양 번호(id)는 한 종류 안에서 서로 다르다', () => {
    LINE_KINDS.forEach((kind) => {
      const ids = [0, 1, 2].flatMap((level) => pathsFor(kind, level).map((p) => p.id));
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  test('직선은 점 2개로 된 곧은 길이다', () => {
    [0, 1, 2].forEach((level) => pathsFor('straight', level).forEach((p) => expect(p.points).toHaveLength(2)));
  });

  test('지그재그는 단계가 오를수록 더 많이 꺾인다', () => {
    const maxTurns = (level) => Math.max(...pathsFor('zigzag', level).map((p) => turns(p.points)));
    expect(maxTurns(0)).toBeLessThan(maxTurns(1));
    expect(maxTurns(1)).toBeLessThan(maxTurns(2));
  });
});

describe('난이도와 고르기', () => {
  test('허용 폭은 단계가 오를수록 조금씩 좁아진다', () => {
    expect(toleranceFor(0)).toBeGreaterThan(toleranceFor(1));
    expect(toleranceFor(1)).toBeGreaterThan(toleranceFor(2));
  });

  test('직전과 같은 모양은 다시 뽑지 않는다', () => {
    LINE_KINDS.forEach((kind) => {
      [0, 1, 2].forEach((level) => {
        const first = pickPath(kind, level, -1);
        for (let i = 0; i < 40; i += 1) expect(pickPath(kind, level, first.id).id).not.toBe(first.id);
      });
    });
  });

  test('없는 모양이나 단계를 부르면 오류를 낸다', () => {
    expect(() => pathsFor('spiral', 0)).toThrow();
    expect(() => pathsFor('straight', 5)).toThrow();
  });
});
