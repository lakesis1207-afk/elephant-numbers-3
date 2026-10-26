// 축하 효과: 색종이 조각이 1초 동안 퍼졌다 사라진다 (4세 앱 cheer.js와 같은 모양)
import { h } from './dom.js';

const PIECES = 14;
const LIFE_MS = 1000;
const COLORS = ['#FF7A59', '#FFC83A', '#7CC36A', '#4FB3E8'];

export function cheer(stage) {
  if (!stage) return;
  const burst = h('div', 'confetti');
  burst.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < PIECES; i++) {
    const angle = (i / PIECES) * Math.PI * 2;
    const dist = 18 + Math.random() * 14;
    burst.append(h('i', '', '', `--x:${(Math.cos(angle) * dist).toFixed(1)}cqh;--y:${(Math.sin(angle) * dist).toFixed(1)}cqh;background:${COLORS[i % COLORS.length]}`));
  }
  stage.append(burst);
  setTimeout(() => burst.remove(), LIFE_MS);
}
