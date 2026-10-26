// 부모님 메뉴 (설정 버튼 2초 누르기로 열림). 4세 앱과 같은 구성과 모양. 부모님용이라 글자로 된 메뉴.
// (3세 앱은 마을이 잠겨 있지 않아서 "모든 마을 열기"는 없다)
import { h, button } from './dom.js';
import { remainingMs, MINUTE, moreTimeChange, testLimitChange, resetChange } from '../app/playtime.js';
import { ALL_GAMES } from '../games/villages.js';

const MORE_MINUTES = 10;
const DEFAULT_LIMIT_MIN = 10;

/** 글자 버튼 */
const textButton = (label, onClick, cls = '') => {
  const el = button(label, cls, onClick);
  el.textContent = label;
  return el;
};

function row(title, ...controls) {
  const el = h('div', 'row');
  const ctrls = h('span', 'ctrls');
  ctrls.append(...controls);
  el.append(h('span', '', title), ctrls);
  return el;
}

export function createParentMenu(stage, app) {
  let modal = null;
  let resetArmed = false;

  function close() {
    modal?.remove();
    modal = null;
    resetArmed = false;
  }

  function apply(change, message) {
    app.update(change);
    if (message) app.toast(message);
    render();
  }

  function render() {
    const p = app.progress;
    const left = Math.ceil(remainingMs(p) / MINUTE);
    const current = app.current;
    const inGame = current.name === 'game';

    const resetBtn = textButton(resetArmed ? '한 번 더 누르면 지워져요' : '지우기', () => {
      if (!resetArmed) {
        resetArmed = true;
        render();
        return;
      }
      app.update(resetChange);
      close();
      app.go('map');
      app.toast('진행 기록을 지웠어요');
    }, resetArmed ? 'danger' : '');

    const panel = h('div', 'panel');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', '부모님 메뉴');
    panel.append(
      h('h3', '', '부모님 메뉴'),
      h('div', 'left', `오늘 남은 놀이 시간: 약 ${left}분 · 스티커 ${p.stickers.length}/${ALL_GAMES.length}`),
      row('놀이 시간', textButton(`${MORE_MINUTES}분 더 놀기`, () => apply((q) => moreTimeChange(q, MORE_MINUTES), `${MORE_MINUTES}분 더 놀 수 있어요`))),
      row(
        '시간 제한',
        textButton(`${DEFAULT_LIMIT_MIN}분`, () => apply({ limitMin: DEFAULT_LIMIT_MIN }), p.limitMin === DEFAULT_LIMIT_MIN ? 'on' : ''),
        textButton('1분 (시험용)', () => apply(testLimitChange, '1분 뒤에 잠겨요 (시험용)'), p.limitMin === 1 ? 'on' : ''),
      ),
      ...(inGame
        ? [row('게임 그만하고 나가기', textButton('마을로 나가기', () => {
          close();
          app.go('village', { village: current.params.village });
        }))]
        : []),
      row('진행 기록 지우기', resetBtn),
      textButton('닫기', close, 'close'),
    );

    const next = h('div', 'modal');
    next.append(panel);
    if (modal) modal.replaceWith(next);
    else stage.append(next);
    modal = next;
  }

  return {
    open() {
      resetArmed = false;
      render();
    },
    close,
    get isOpen() {
      return modal != null;
    },
  };
}
