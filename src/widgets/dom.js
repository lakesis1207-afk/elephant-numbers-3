// 화면 조각 만들기 도우미: 태그(h), 그림(pic), 버튼(button)
import { artUrl } from '../art.js';

export function h(tag, cls = '', text = '', style = '') {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text) el.textContent = text;
  if (style) el.style.cssText = style;
  return el;
}

/** 그림 하나 (art.js 목록의 이름). 끌기 기본 동작(그림 저장 끌기)은 막는다. */
export function pic(name, cls = '', style = '') {
  const img = h('img', `pic ${cls}`.trim(), '', style);
  img.src = artUrl(name);
  img.alt = '';
  img.draggable = false;
  return img;
}

/** 버튼. 아이에게는 글자 대신 그림을 보여 주고, label은 화면 읽기용 이름으로 둔다. */
export function button(label, cls, onClick, style = '') {
  const el = h('button', cls, '', style);
  el.type = 'button';
  el.setAttribute('aria-label', label);
  el.addEventListener('click', onClick);
  return el;
}

/** 그림 버튼: 그림 하나가 들어 있는 버튼 */
export function picButton(label, art, cls, onClick, style = '') {
  const el = button(label, cls, onClick, style);
  el.append(pic(art, 'fill'));
  return el;
}
