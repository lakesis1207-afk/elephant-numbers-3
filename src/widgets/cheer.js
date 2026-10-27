// 정답 효과: 별 조각이 1초 동안 퍼졌다 사라진다 (지시서: 정답 효과는 1초 안팎으로 짧게)
import { h } from '@공통/widgets/dom.js';

const PIECES = 14;
const LIFE_MS = 1000;
const COLORS = ['#FF7A59', '#FFC83A', '#7CC36A', '#4FB3E8'];

export function cheer(stage) {
  if (!stage) return;
  const burst = h(
    'div',
    { class: 'cheer', 'aria-hidden': 'true' },
    Array.from({ length: PIECES }, (_, i) => {
      const angle = (i / PIECES) * Math.PI * 2;
      const dist = 18 + Math.random() * 14;
      return h('i', {
        style: `--x:${(Math.cos(angle) * dist).toFixed(1)}cqh;--y:${(Math.sin(angle) * dist).toFixed(1)}cqh;background:${COLORS[i % COLORS.length]}`,
      });
    }),
  );
  stage.append(burst);
  setTimeout(() => burst.remove(), LIFE_MS);
}
