// 게임별 그림 그리기: 문제(questions.js)를 받아 보여 줄 그림(show)과 보기(choices)를 만든다.
// - 세어 주기: 과일을 바구니에 끌어 담기 (톡 눌러도 담긴다)
// - 모양 찾기: 같은 모양을 빈 칸에 끌어 넣기 (톡 눌러도 된다)
// - 나머지 7개: 그림 보기 2개 중 누르기
import { h, pic, button } from '../widgets/dom.js';
import { draggable } from '../widgets/drag.js';

const SUBITIZE_SHOW_MS = 1500; // 한눈에 알기: 점을 보여 주는 시간 (세지 않고 알아보게 짧게)

/** 같은 그림 count개 묶음 */
function groupOf(art, count, cls = '') {
  const box = h('div', `group ${cls}`.trim());
  for (let i = 0; i < count; i++) box.append(pic(art));
  return box;
}

const frame = (child, cls = '') => {
  const f = h('div', `frame ${cls}`.trim());
  f.append(child);
  return f;
};

/** 잠깐 보여 주고 가린다. 다시 누르면 또 보여 준다. */
function flash(el) {
  el.classList.remove('covered');
  clearTimeout(el.coverTimer);
  el.coverTimer = setTimeout(() => el.classList.add('covered'), SUBITIZE_SHOW_MS);
}

// 보기 안 그림 (없으면 그림 하나). 위에 보여 주는 예시와 같은 크기로 그린다 (styles.css --item).
const CARD = {
  more: (c) => groupOf(c.art, c.count),
  size: (c) => pic(c.art, c.big ? 'big' : 'small'),
  subitize: (c) => groupOf(c.art, c.count),
  samecount: (c) => groupOf(c.art, c.count),
  position: (c) => {
    const scene = h('div', `scene pos-${c.where}`);
    scene.append(pic('box-open', 'box'), pic('turtle', 'mover'));
    return scene;
  },
};

// 보기 위에 보여 줄 그림
const SHOW = {
  match: (q) => frame(pic(q.target)),
  samecount: (q) => frame(groupOf('shell', q.count)),
  subitize: (q) => {
    const f = frame(groupOf('dot', q.count), 'peek');
    flash(f);
    f.addEventListener('click', () => flash(f));
    return f;
  },
  pattern: (q) => {
    const row = h('div', 'pattern');
    q.sequence.forEach((art) => row.append(pic(art)));
    row.append(h('div', 'slot'));
    return row;
  },
};

/** 세어 주기: 과일 더미에서 바구니로 */
function renderFill(q, { show, choices, fill }) {
  const basket = h('div', 'fill-basket');
  const tray = h('div', 'tray');
  basket.append(tray, pic('basket', 'basket-img'));
  show.append(basket);
  let filled = 0;
  for (let i = 0; i < q.pile; i++) {
    const fruit = pic(q.fruit, 'piece');
    const put = () => {
      if (fruit.dataset.locked || filled >= q.n) return;
      fruit.dataset.locked = '1';
      tray.append(fruit);
      filled += 1;
      fill(filled);
    };
    draggable(fruit, { target: () => basket, onDrop: put, onTap: put });
    choices.append(fruit);
  }
  return { hintTarget: basket };
}

/** 모양 찾기: 빈 칸(희미한 모양)에 같은 모양 넣기 */
function renderSlot(q, { show, choices, choose }) {
  const slot = h('div', 'shape-slot');
  slot.append(pic(q.target, 'ghost'));
  show.append(slot);
  const pieces = q.choices.map((c) => {
    const piece = pic(c.art, 'piece');
    piece.setAttribute('aria-label', c.label);
    const pick = async () => {
      if ((await choose(c, piece)) !== 'right') return;
      piece.dataset.locked = '1';
      slot.replaceChildren(piece);
    };
    draggable(piece, { target: () => slot, onDrop: pick, onTap: pick });
    return piece;
  });
  choices.append(...pieces);
  return { hintTarget: pieces[q.choices.findIndex((c) => c.right)] };
}

/**
 * 문제 하나를 그린다.
 * @param parts { show, choices, choose(choice, el) → Promise<결과>, fill(담은 개수) }
 * @returns { hintTarget } 힌트 때 반짝일 요소
 */
export function renderQuestion(gameKey, q, parts) {
  parts.show.replaceChildren();
  parts.choices.replaceChildren();
  if (gameKey === 'count') return renderFill(q, parts);
  if (gameKey === 'shape') return renderSlot(q, parts);

  const shown = SHOW[gameKey]?.(q);
  if (shown) parts.show.append(shown);
  const buttons = q.choices.map((c) => {
    const btn = button(c.label, 'choice', async () => {
      if ((await parts.choose(c, btn)) === 'right') btn.classList.add('right');
    });
    btn.append(CARD[gameKey] ? CARD[gameKey](c) : pic(c.art));
    return btn;
  });
  parts.choices.append(...buttons);
  return { hintTarget: buttons[q.choices.findIndex((c) => c.right)] };
}
