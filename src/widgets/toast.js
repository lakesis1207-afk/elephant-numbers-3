// 잠깐 떴다 사라지는 글자 안내 (부모님용)

const SHOW_MS = 2200;

export function createToast(el) {
  let timer = null;
  return function toast(text) {
    el.textContent = text;
    el.hidden = false;
    clearTimeout(timer);
    timer = setTimeout(() => { el.hidden = true; }, SHOW_MS);
  };
}
