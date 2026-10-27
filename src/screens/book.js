// 스티커북: 마을마다 한 쪽. 왼쪽 마을 버튼으로 쪽을 넘긴다 (처음엔 지금 있던 마을, 지도에서 열면 사바나).
// 모은 친구는 색깔, 아직 없는 친구는 흐린 그림자. 특별 친구가 있는 마을은 마지막 칸이 특별 친구.
// X를 누르면 스티커북을 열기 전 화면으로 돌아간다.
import { h, art, roundButton } from '@공통/widgets/dom.js';
import { VILLAGES, findVillage } from '../villages/index.js';
import { bookCount, NOT_MET } from '../audio/script.js';
import { stopVoice } from '../audio/voice.js';

const SPECIAL_MISSING = '특별 친구, 아직 없음';

function slot(animal, has, app, extraClass = '') {
  const tap = () => {
    if (has) {
      app.sfx.pop();
      app.say(animal.name);
    } else {
      app.sfx.boing();
      app.say(NOT_MET);
    }
  };
  return h(
    'button',
    {
      class: `slot ${has ? 'has' : 'miss'} ${extraClass}`.trim(),
      'data-animal': animal.key,
      'aria-label': has ? animal.name : animal.missingLabel ?? '아직 없음',
      onclick: tap,
    },
    art('character', animal.key),
  );
}

function pageSlots(villageKey, app) {
  const p = app.progress;
  const { animals, special } = findVillage(villageKey).detail;
  return [
    ...animals.map((a) => slot(a, p.stickers.includes(a.key), app)),
    special ? slot({ ...special, missingLabel: SPECIAL_MISSING }, p.special, app, 'sp') : null,
  ];
}

export const bookScreen = {
  showBook: false,

  render(root, app, { back = { name: 'map', params: {} } } = {}) {
    const p = app.progress;
    const slots = h('div', { class: 'slots' });
    const tabs = VILLAGES.map((v) =>
      h('button', { class: 'btab press', 'data-village': v.key, 'aria-label': `${v.name} 스티커`, onclick: () => show(v.key, true) },
        art('character', v.character, { class: v.round ? 'round' : '' })));

    function show(key, tapped = false) {
      if (tapped) app.sfx.pop();
      tabs.forEach((t) => t.classList.toggle('on', t.dataset.village === key));
      slots.replaceChildren(...pageSlots(key, app).filter(Boolean));
    }

    const close = () => {
      app.sfx.pop();
      app.go(back.name, back.params);
    };
    root.append(h('div', { class: 'btabs' }, tabs), slots, roundButton('close', '스티커북 닫기', close, 'bookclose'));
    show(back.params?.village ?? 'savanna');
    app.say(bookCount(p.stickers.length + (p.special ? 1 : 0)));
  },

  leave: stopVoice,
};
