// 선 긋기 계산 (화면을 모르는 순수 함수). 손가락 위치로 "길을 어디까지 따라왔는지"를 센다.
// 상태(trace)는 { reached: 길을 따라간 거리, active: 지금 긋고 있는지 } 이고, 바꿀 때마다 새 값을 돌려준다.
// 너그럽게 판정한다: 길에서 허용 폭(tolerance) 안이면 이어지고, 벗어나면 멈추고 기다린다(틀림은 없다).
const STEP = 0.5; // 길을 이만큼씩 잘게 나눠 가장 가까운 자리를 찾는다
const START_RADIUS_RATIO = 1.6; // 시작·이어 긋기 때 눌러도 되는 거리 (허용 폭의 몇 배)
const MAX_JUMP_RATIO = 6; // 한 번에 건너뛸 수 있는 거리 (허용 폭의 몇 배). 다른 쪽 길로 지름길을 타지 못하게 한다
export const FINISH_RATIO = 0.92; // 길의 이만큼 가면 다 한 것

const dist = ([ax, ay], [bx, by]) => Math.hypot(ax - bx, ay - by);

/** 점들을 이은 길. length는 전체 길이, samples는 STEP 간격의 자리들 */
export function buildPath(points) {
  if (!Array.isArray(points) || points.length < 2) throw new Error('[line] 길에는 점이 2개 이상 필요합니다');
  const cum = [0];
  for (let i = 1; i < points.length; i += 1) cum.push(cum[i - 1] + dist(points[i - 1], points[i]));
  const length = cum.at(-1);
  const path = { points, cum, length, samples: [] };
  const count = Math.ceil(length / STEP);
  path.samples = Array.from({ length: count + 1 }, (_, k) => pointAt(path, Math.min(k * STEP, length)));
  return Object.freeze(path);
}

/** 길을 s만큼 따라간 자리 [x, y] (범위 밖이면 처음·끝점) */
export function pointAt(path, s) {
  const { points, cum, length } = path;
  if (s <= 0) return [...points[0]];
  if (s >= length) return [...points.at(-1)];
  let i = 1;
  while (cum[i] < s) i += 1;
  const t = (s - cum[i - 1]) / (cum[i] - cum[i - 1]);
  const [ax, ay] = points[i - 1];
  const [bx, by] = points[i];
  return [ax + (bx - ax) * t, ay + (by - ay) * t];
}

export const startTrace = () => Object.freeze({ reached: 0, active: false });

/** 눌렀을 때: 시작점(이어 긋기면 지금까지 간 끝) 가까이여야 긋기가 시작된다 */
export function pressTrace(path, trace, point, { tolerance }) {
  const anchor = trace.reached === 0 ? path.points[0] : pointAt(path, trace.reached);
  return Object.freeze({ reached: trace.reached, active: dist(point, anchor) <= tolerance * START_RADIUS_RATIO });
}

/** 손가락이 움직였을 때: 앞쪽 길 가까이면 그만큼 나아간다 (뒤로는 줄지 않고, 멀리 건너뛰지도 않는다) */
export function moveTrace(path, trace, point, { tolerance }) {
  if (!trace.active) return trace;
  const lo = Math.floor(trace.reached / STEP);
  const hi = Math.min(Math.ceil((trace.reached + tolerance * MAX_JUMP_RATIO) / STEP), path.samples.length - 1);
  let best = -1;
  let bestDist = Infinity;
  for (let k = lo; k <= hi; k += 1) {
    const d = dist(point, path.samples[k]);
    if (d < bestDist) {
      bestDist = d;
      best = k;
    }
  }
  const s = Math.min(best * STEP, path.length);
  if (bestDist > tolerance || s <= trace.reached) return trace;
  return Object.freeze({ reached: s, active: true });
}

/** 손을 뗐을 때: 간 만큼은 남고, 긋기만 멈춘다 */
export const releaseTrace = (trace) => Object.freeze({ reached: trace.reached, active: false });

export const progressOf = (path, trace) => trace.reached / path.length;

export const isDone = (path, trace, finish = FINISH_RATIO) => progressOf(path, trace) >= finish;
