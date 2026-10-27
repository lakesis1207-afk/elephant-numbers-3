// 선 긋기 게임 틀 (사바나 직선, 숲속 곡선, 바닷가 지그재그). 초록 점에서 시작해 점선 길을 손가락으로 따라간다.
// 지나간 만큼 길이 색 선으로 채워지고, 동물이 선 끝을 따라 걷는다. 끝까지(92%) 가면 정답.
// 틀림은 없다: 길에서 벗어나면 선이 멈춰 기다리고, 손을 떼면 그 끝에서 이어 그을 수 있다.
// 한동안 가만있으면 노란 점이 길을 한 번 따라가며 보여 준다.
import { pickHandler, replayClass } from '@공통/games/widgets.js';
import { artUrl } from '../../art/registry.js';
import { buildPath, pointAt, startTrace, pressTrace, moveTrace, releaseTrace, isDone } from '../lineTrace.js';
import { VIEW, pickPath, toleranceFor } from '../linePaths.js';
import { LINE_START_HINT, LINE_IDLE_HINT } from '../../audio/villageScript.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const ICON = 15; // 동물·목표 그림 크기 (게임판 좌표)
const START_DOT = 4.4;
const ARROW_AT = 11; // 시작 화살표를 놓는 거리 (길을 따라)
const IDLE_HINT_MS = 5000;
const DEMO_MS = 2200;
const DEMO_STEP_MS = 40;
const MAX_DEMOS = 2; // 가만있기 안내는 한 문제에 이만큼만
const START_HINT_GAP_MS = 3000; // "초록 점을 눌러" 안내를 너무 자주 하지 않게
// 브라우저 자동 검사가 길을 따라 그을 수 있게, 개발 서버와 검사용 빌드에만 길 좌표를 적어 둔다
const EXPOSE_PATH = import.meta.env.DEV || import.meta.env.VITE_E2E === '1';

function svg(tag, attrs = {}, ...children) {
  const el = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, String(value)));
  el.append(...children);
  return el;
}

const dOf = (points) => points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
const round2 = (v) => Math.round(v * 100) / 100;

/** 그림 한 장: 아랫변 가운데가 (x, y)에 오도록 (길 위에 서 있게) */
const standing = (kind, name, cls) =>
  svg('image', { href: artUrl(kind, name), width: ICON, height: ICON, x: -ICON / 2, y: -ICON, class: cls });
const placeAt = (el, [x, y]) => el.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);

/** 시작 화살표: 길이 처음 나아가는 방향을 가리킨다 */
function startArrow(path) {
  const [ax, ay] = pointAt(path, ARROW_AT - 2);
  const [bx, by] = pointAt(path, ARROW_AT + 2);
  const deg = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
  const [x, y] = pointAt(path, ARROW_AT);
  return svg('polygon', { class: 'larrow', points: '-2.6,-3 3.2,0 -2.6,3', transform: `translate(${x} ${y}) rotate(${deg})` });
}

/**
 * @param kind 'straight' | 'curve' | 'zigzag'
 * @param traveler {kind,name} 길을 걷는 동물
 * @param goal {kind,name} 길 끝의 목표 그림
 * @param prompt 묻는 말
 * @param color 채워지는 선 색
 */
export function makeLineGame({ key, background, kind, traveler, goal, prompt, color }) {
  return {
    key,
    background,
    levels: [
      [0, 0],
      [1, 1],
      [2, 2],
    ], // 선 긋기는 수 범위 대신 단계 번호를 쓴다 (range[0])

    ask(play, { run, bubble, sfx }, { range, last }) {
      const level = range[0];
      const shape = pickPath(kind, level, last);
      const path = buildPath(shape.points);
      const opts = { tolerance: toleranceFor(level) };
      const d = dOf(shape.points);
      let trace = startTrace();
      let finished = false;
      let idleTimer = null;
      let demoTimer = null;
      let demos = 0;
      let lastStartHint = 0;

      // 빈칸을 길보다 조금 길게: 같으면 다음 선 조각이 길 끝에 둥근 점으로 찍힌다
      const fill = svg('path', { class: 'lfill', d, pathLength: path.length, 'stroke-dasharray': `${path.length} ${path.length + 1}` });
      const start = svg('g', { class: 'lstart' }, svg('circle', { r: START_DOT }));
      placeAt(start, shape.points[0]);
      const goalImg = standing(goal.kind, goal.name, 'lgoal');
      placeAt(goalImg, shape.points.at(-1));
      const arrow = startArrow(path);
      const walker = standing(traveler.kind, traveler.name, 'lwalker');
      const hintDot = svg('circle', { class: 'lhint', r: 3.2 });
      const board = svg(
        'svg',
        { class: 'lineq', viewBox: `0 0 ${VIEW.width} ${VIEW.height}`, style: `--line:${color}`, role: 'img', 'aria-label': '선 긋기 길' },
        svg('path', { class: 'lbed', d }),
        svg('path', { class: 'lguide', d }),
        fill,
        start,
        arrow,
        goalImg,
        walker,
        hintDot,
      );
      if (EXPOSE_PATH) board.dataset.path = JSON.stringify(shape.points.map(([x, y]) => [round2(x), round2(y)]));
      const onDone = pickHandler(run, shape.id);

      function draw() {
        fill.setAttribute('stroke-dashoffset', String(path.length - trace.reached));
        fill.style.visibility = trace.reached > 0 ? '' : 'hidden'; // 아직 안 그었으면 둥근 끝도 보이지 않게
        arrow.style.visibility = trace.reached > 0 ? 'hidden' : ''; // 긋기 시작하면 화살표는 할 일을 다 했다
        placeAt(walker, pointAt(path, trace.reached));
      }

      const alive = () => board.isConnected && !run.state.stopped && !finished;

      function stopDemo() {
        clearInterval(demoTimer);
        demoTimer = null;
        hintDot.classList.remove('on');
      }

      function armIdle() {
        clearTimeout(idleTimer);
        if (demos >= MAX_DEMOS) return;
        idleTimer = setTimeout(() => {
          if (!alive() || run.state.busy || trace.active) return;
          demos += 1;
          bubble(LINE_IDLE_HINT, true);
          const from = trace.reached;
          const began = Date.now();
          hintDot.classList.add('on');
          demoTimer = setInterval(() => {
            const t = Math.min((Date.now() - began) / DEMO_MS, 1);
            if (!alive()) return stopDemo();
            placeAt(hintDot, pointAt(path, from + (path.length - from) * t));
            if (t >= 1) {
              stopDemo();
              armIdle();
            }
          }, DEMO_STEP_MS);
        }, IDLE_HINT_MS);
      }

      function finish() {
        finished = true;
        clearTimeout(idleTimer);
        stopDemo();
        trace = Object.freeze({ reached: path.length, active: false });
        draw();
        board.classList.remove('drawing');
        onDone(shape.id, board);
      }

      const toLocal = (e) => {
        const m = board.getScreenCTM();
        if (!m) return null;
        const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
        return [p.x, p.y];
      };

      board.addEventListener('pointerdown', (e) => {
        run.poke();
        if (finished || run.state.busy) return;
        const p = toLocal(e);
        if (!p) return;
        e.preventDefault();
        clearTimeout(idleTimer);
        stopDemo();
        trace = pressTrace(path, trace, p, opts);
        if (trace.active) {
          board.setPointerCapture?.(e.pointerId);
          board.classList.add('drawing');
          sfx.pop();
          return;
        }
        // 엉뚱한 곳을 눌렀으면 이어 그을 자리(처음엔 초록 점)를 반짝여 알려 준다
        replayClass(trace.reached === 0 ? start : walker, 'hl');
        if (Date.now() - lastStartHint > START_HINT_GAP_MS) {
          lastStartHint = Date.now();
          bubble(LINE_START_HINT, true);
        }
        armIdle();
      });

      board.addEventListener('pointermove', (e) => {
        if (!trace.active || finished) return;
        const p = toLocal(e);
        if (!p) return;
        run.poke();
        trace = moveTrace(path, trace, p, opts);
        draw();
        if (isDone(path, trace)) finish();
      });

      const release = () => {
        if (!trace.active || finished) return;
        trace = releaseTrace(trace);
        board.classList.remove('drawing');
        armIdle();
      };
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((ev) => board.addEventListener(ev, release));

      draw();
      play.replaceChildren(board);
      armIdle();

      // 틀리는 일이 없어서 엔진이 힌트를 부르지 않는다. 힌트는 위의 가만있기 안내가 맡는다.
      return { n: shape.id, prompt, hint: async () => {} };
    },
  };
}
