import { describe, test, expect } from 'vitest';
import { buildPath, pointAt, startTrace, pressTrace, moveTrace, releaseTrace, progressOf, isDone } from '../../src/games/lineTrace.js';

const OPTS = { tolerance: 5, finish: 0.92 };
const straight = () => buildPath([[0, 0], [100, 0]]);

/** 손가락이 points를 차례로 지나간 뒤의 상태 (처음 점에서 눌러서 시작) */
const drag = (path, points, trace = startTrace()) => {
  let t = pressTrace(path, trace, points[0], OPTS);
  points.slice(1).forEach((p) => {
    t = moveTrace(path, t, p, OPTS);
  });
  return t;
};

describe('길 만들기', () => {
  test('길이는 점들 사이 거리의 합이다', () => {
    expect(buildPath([[0, 0], [30, 40]]).length).toBeCloseTo(50, 5);
    expect(buildPath([[0, 0], [10, 0], [10, 10]]).length).toBeCloseTo(20, 5);
  });

  test('pointAt은 길을 따라간 거리에 해당하는 자리를 돌려준다', () => {
    const path = buildPath([[0, 0], [10, 0], [10, 10]]);
    expect(pointAt(path, 0)).toEqual([0, 0]);
    expect(pointAt(path, 5)[0]).toBeCloseTo(5, 5);
    expect(pointAt(path, 15)[1]).toBeCloseTo(5, 5);
    expect(pointAt(path, 999)).toEqual([10, 10]); // 끝을 넘으면 끝점
  });

  test('점이 2개 미만이면 오류를 낸다', () => {
    expect(() => buildPath([[0, 0]])).toThrow();
  });
});

describe('눌러서 시작하기', () => {
  test('처음에는 진행 0이고 긋고 있지 않다', () => {
    const t = startTrace();
    expect(progressOf(straight(), t)).toBe(0);
    expect(t.active).toBe(false);
  });

  test('시작점 가까이에서 누르면 긋기가 시작된다', () => {
    expect(pressTrace(straight(), startTrace(), [3, 4], OPTS).active).toBe(true);
  });

  test('시작점에서 먼 곳을 누르면 시작되지 않고, 움직여도 그대로다', () => {
    const path = straight();
    const t = pressTrace(path, startTrace(), [60, 0], OPTS);
    expect(t.active).toBe(false);
    expect(moveTrace(path, t, [70, 0], OPTS).reached).toBe(0);
  });
});

describe('길 따라 긋기', () => {
  test('길을 따라가면 간 만큼 진행이 늘어난다', () => {
    const path = straight();
    const t = drag(path, [[0, 0], [10, 1], [30, -2], [55, 3]]);
    expect(t.reached).toBeCloseTo(55, 5);
    expect(progressOf(path, t)).toBeCloseTo(0.55, 5);
  });

  test('길에서 허용 폭보다 더 벗어나면 진행이 멈춘다', () => {
    const path = straight();
    const t = drag(path, [[0, 0], [20, 0], [40, 9]]); // 9 > 5
    expect(t.reached).toBeCloseTo(20, 5);
  });

  test('다시 길 가까이 오면 이어서 간다', () => {
    const path = straight();
    const t = drag(path, [[0, 0], [20, 0], [40, 9], [45, 2]]);
    expect(t.reached).toBeCloseTo(45, 5);
  });

  test('뒤로 가도 진행은 줄지 않는다', () => {
    const path = straight();
    const t = drag(path, [[0, 0], [20, 0], [40, 0], [10, 0]]);
    expect(t.reached).toBeCloseTo(40, 5);
  });

  test('한 번에 너무 멀리 건너뛰면 인정하지 않는다 (길을 따라가야 한다)', () => {
    const path = straight();
    const t = drag(path, [[0, 0], [10, 0], [95, 0]]);
    expect(t.reached).toBeCloseTo(10, 5);
  });

  test('다른 쪽 길로 지름길을 타도 건너뛰지 않는다', () => {
    // U자 길: 오른쪽으로 갔다가 위로 갔다가 왼쪽으로 돌아온다. 시작점 바로 위의 끝쪽 길로 건너뛰면 안 된다.
    const path = buildPath([[0, 0], [60, 0], [60, 8], [0, 8]]);
    const t = drag(path, [[0, 0], [2, 4], [4, 8]]); // 위쪽 길(끝쪽)에 가깝지만 아직 앞쪽을 못 갔다
    expect(t.reached).toBeLessThan(10);
  });

  test('끝까지 가면(92% 이상) 다 한 것이다', () => {
    const path = straight();
    expect(isDone(path, drag(path, [[0, 0], [30, 0], [60, 0], [90, 0]]), 0.92)).toBe(false);
    expect(isDone(path, drag(path, [[0, 0], [30, 0], [60, 0], [90, 0], [95, 0]]), 0.92)).toBe(true);
  });
});

describe('손을 떼고 이어 긋기', () => {
  test('손을 떼도 간 만큼은 남는다', () => {
    const path = straight();
    const t = releaseTrace(drag(path, [[0, 0], [30, 0], [50, 0]]));
    expect(t.active).toBe(false);
    expect(t.reached).toBeCloseTo(50, 5);
  });

  test('간 곳 끝(또는 가까이)을 다시 누르면 거기서 이어진다', () => {
    const path = straight();
    const rest = releaseTrace(drag(path, [[0, 0], [30, 0], [50, 0]]));
    const again = pressTrace(path, rest, [52, 3], OPTS);
    expect(again.active).toBe(true);
    expect(moveTrace(path, again, [70, 0], OPTS).reached).toBeCloseTo(70, 5);
  });

  test('엉뚱한 곳을 누르면 이어지지 않는다', () => {
    const path = straight();
    const rest = releaseTrace(drag(path, [[0, 0], [30, 0], [50, 0]]));
    expect(pressTrace(path, rest, [90, 0], OPTS).active).toBe(false);
  });
});

describe('상태는 바뀌지 않는 값이다', () => {
  test('moveTrace는 원래 상태를 바꾸지 않고 새 상태를 돌려준다', () => {
    const path = straight();
    const before = pressTrace(path, startTrace(), [0, 0], OPTS);
    const after = moveTrace(path, before, [20, 0], OPTS);
    expect(before.reached).toBe(0);
    expect(after).not.toBe(before);
    expect(Object.isFrozen(after)).toBe(true);
  });
});
