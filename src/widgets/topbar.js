// 위쪽 막대: 왼쪽 위 설정(부모 메뉴, 2초 누르기), 오른쪽 아래 뒤로가기(빨간 화살표),
// 가운데 문제 점, 오른쪽 스티커북(별 + 모은 개수)
import { h, button, picButton } from './dom.js';
import { holdable, consumeHeld, PARENT_HOLD_MS } from './hold.js';

const PARENT_TIP = '2초간 꾹 눌러주세요';
const TIP_MS = 2000; // 안내 말풍선이 보이는 시간
const BACK_ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4 7 12l8 8" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export function createTopbar(bar, app) {
  // 부모 메뉴: 2초 동안 누르고 있어야 열린다. 아이가 톡 누르면 설정 버튼 옆에 안내 말풍선만 뜬다.
  const tip = h('span', 'ptip', PARENT_TIP);
  tip.hidden = true;
  tip.setAttribute('role', 'status');
  let tipTimer = null;
  const showTip = () => {
    tip.hidden = false;
    clearTimeout(tipTimer);
    tipTimer = setTimeout(() => { tip.hidden = true; }, TIP_MS);
  };
  const parent = picButton('부모님 메뉴, 2초 동안 누르고 있기', 'settings', 'pbtn', () => {
    if (!consumeHeld(parent)) showTip();
  });
  holdable(parent, PARENT_HOLD_MS, () => app.openParentMenu());

  let backHandler = null;
  const back = button('돌아가기', 'backbtn', () => backHandler?.());
  back.innerHTML = BACK_ARROW;
  const dots = h('div', 'bar-dots');
  const count = h('b', '', '0');
  const book = picButton('스티커북', 'star', 'bookbtn', () => app.openBook());
  book.append(count);
  bar.append(parent, tip, back, h('div', 'spacer'), dots, h('div', 'spacer'), book);

  return {
    update({ visible, showBook = true }) {
      bar.hidden = !visible;
      book.hidden = !showBook;
      count.textContent = String(app.progress.stickers.length);
      backHandler = null;
      back.hidden = true;
      dots.replaceChildren();
    },
    setBack(fn, label = '돌아가기') {
      backHandler = fn;
      back.setAttribute('aria-label', label);
      back.hidden = false;
    },
    setDots(done, total) {
      dots.replaceChildren(...Array.from({ length: total }, (_, i) => h('span', i < done ? 'dot on' : 'dot')));
    },
  };
}
