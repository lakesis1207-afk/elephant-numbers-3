// 선 긋기 길 모양 (화면을 모르는 순수 데이터). 좌표는 게임판 기준 가로 126 × 세로 83 (cqh와 같은 비율).
// 모양마다 3단계: 직선(가로 → 비스듬히 → 길고 가파르게), 곡선(호 → S자 → 물결), 지그재그(꺾임 2 → 4 → 6번).
// 모두 왼쪽에서 오른쪽으로 간다(읽는 방향). 위아래를 뒤집은 모양도 함께 써서 다양하게 한다.
export const VIEW = Object.freeze({ width: 126, height: 83 });
export const LINE_KINDS = Object.freeze(['straight', 'curve', 'zigzag']);
export const LEVELS = 3;
const TOLERANCE = [9, 8, 7]; // 길에서 이만큼 벗어나도 이어진다 (단계가 오를수록 조금 좁게)
const BEZIER_STEPS = 40;

const flipY = (points) => points.map(([x, y]) => [x, VIEW.height - y]);

/** 3차 베지어 곡선을 점들로 (첫 점 포함) */
function cubic([x0, y0], [x1, y1], [x2, y2], [x3, y3]) {
  return Array.from({ length: BEZIER_STEPS + 1 }, (_, i) => {
    const t = i / BEZIER_STEPS;
    const u = 1 - t;
    const a = u * u * u;
    const b = 3 * u * u * t;
    const c = 3 * u * t * t;
    const d = t * t * t;
    return [a * x0 + b * x1 + c * x2 + d * x3, a * y0 + b * y1 + c * y2 + d * y3];
  });
}

/** 곡선 여러 개를 이어 붙인다 (이음매 점은 한 번만) */
const chain = (...curves) => curves.flatMap((pts, i) => (i === 0 ? pts : pts.slice(1)));

/** 한 모양과 위아래를 뒤집은 모양 */
const withFlip = (points) => [points, flipY(points)];

const SHAPES = {
  straight: [
    [[[16, 30], [110, 30]], [[16, 44], [110, 44]], [[16, 58], [110, 58]]],
    withFlip([[16, 60], [110, 26]]),
    withFlip([[12, 70], [114, 14]]),
  ],
  curve: [
    withFlip(cubic([16, 58], [40, 16], [86, 16], [110, 58])),
    withFlip(cubic([16, 62], [70, 62], [56, 22], [110, 22])),
    withFlip(chain(cubic([14, 42], [26, 10], [50, 10], [62, 42]), cubic([62, 42], [74, 74], [98, 74], [112, 42]))),
  ],
  zigzag: [
    withFlip([[16, 60], [48, 24], [80, 60], [110, 24]]),
    withFlip([[14, 58], [34, 24], [54, 58], [74, 24], [94, 58], [112, 30]]),
    withFlip([[12, 56], [26, 26], [40, 56], [54, 26], [68, 56], [82, 26], [96, 56], [112, 26]]),
  ],
};

/** 이 모양·단계의 길들: [{ id, points }]. id는 한 모양 안에서 서로 다르다 (직전 모양을 피할 때 쓴다) */
export function pathsFor(kind, level) {
  const levels = SHAPES[kind];
  if (!levels) throw new Error(`[line] 없는 길 모양입니다: ${kind}`);
  const variants = levels[level];
  if (!variants) throw new Error(`[line] 없는 단계입니다: ${kind} ${level}`);
  return variants.map((points, i) => Object.freeze({ id: level * 10 + i, points }));
}

/** 길 하나를 고른다 (직전 id와 다른 것으로) */
export function pickPath(kind, level, lastId, rnd = Math.random) {
  const all = pathsFor(kind, level);
  const pool = all.filter((p) => p.id !== lastId);
  const list = pool.length ? pool : all;
  return list[Math.floor(rnd() * list.length)];
}

export const toleranceFor = (level) => TOLERANCE[Math.min(Math.max(level, 0), TOLERANCE.length - 1)];
