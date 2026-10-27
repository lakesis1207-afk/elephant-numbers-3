// 풍선이 터지는 효과. 풍선 터뜨리기와 풍선 불기가 함께 쓴다.
import { h } from '@공통/widgets/dom.js';

export const BALLOON_COLORS = ['balloon-red', 'balloon-blue', 'balloon-yellow', 'balloon-green'];
export const PIECE_COLORS = ['#ff6b5e', '#5fb6f0', '#ffd23f', '#6cc96a']; // 터질 때 튀는 조각 색 (풍선 색과 같은 순서)
const PIECES = 8;
const POP_AT_MS = 600; // 둥실 올라간 뒤 터지는 때 (villages.css의 balloon-rise 길이와 같다)

/** 풍선 버튼(.balloon > .bfloat): 올라가다 펑! 조각과 글자를 넣고, 터지는 순간 소리를 낸다 */
export function popBalloon(btn, run, sfx) {
  const pieces = Array.from({ length: PIECES }, (_, k) => h('i', { style: `--a:${(360 / PIECES) * k}deg` }));
  btn.querySelector('.bfloat').append(h('span', { class: 'bpop', 'aria-hidden': 'true' }, pieces, h('em', {}, '펑!')));
  setTimeout(() => {
    if (!run.state.stopped) sfx.pop();
  }, POP_AT_MS);
}
