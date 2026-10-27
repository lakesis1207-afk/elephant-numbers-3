// 꾹 누르기: ms 동안 누르고 있어야 done이 불린다 (부모님 전용 버튼). 누르는 동안 'holding' 클래스.
// 손을 떼거나 버튼 밖으로 나가면 취소된다. 키보드(Enter/Space)도 같다.
export const PARENT_HOLD_MS = 1000;
// 꾹 누르기가 끝난 뒤 따라오는 click을 무시하는 시간. 지나면 표시를 지운다
// (손을 뗀 곳이 버튼 밖이라 click이 안 오면 표시가 남아 다음 톡 누르기를 막기 때문).
const HELD_FLAG_MS = 800;

export function holdable(el, ms, done) {
  let timer = null;
  el.style.setProperty('--hold-ms', `${ms}ms`);

  const start = (e) => {
    e?.preventDefault?.();
    delete el.dataset.held;
    el.classList.add('holding');
    clearTimeout(timer);
    timer = setTimeout(() => {
      el.classList.remove('holding');
      el.dataset.held = '1'; // 바로 뒤따르는 click을 무시하게
      setTimeout(() => delete el.dataset.held, HELD_FLAG_MS);
      done();
    }, ms);
  };
  const stop = () => {
    el.classList.remove('holding');
    clearTimeout(timer);
  };

  el.addEventListener('pointerdown', start);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => el.addEventListener(ev, stop));
  el.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) start(e);
  });
  el.addEventListener('keyup', (e) => {
    if (e.key === 'Enter' || e.key === ' ') stop();
  });
  el.addEventListener('contextmenu', (e) => e.preventDefault());
}

/** 꾹 누르기가 끝난 직후의 click인지 (한 번만 true) */
export function consumeHeld(el) {
  const held = el.dataset.held === '1';
  delete el.dataset.held;
  return held;
}
