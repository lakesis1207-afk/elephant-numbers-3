// 게임 밖 화면들: 시작, 마을 지도, 마을, 보상, 스티커북, 잠금.
// 아이 화면은 그림 위주이고, 위쪽 막대·잠금·보상·스티커북은 4세 앱과 같은 모양이다.
import { h, pic, button, picButton } from '../widgets/dom.js';
import { holdable, PARENT_HOLD_MS } from '../widgets/hold.js';
import { cheer } from '../widgets/cheer.js';
import { ANIMAL_NAMES, VILLAGES, gameOf, villageDone, villageOf } from '../games/villages.js';
import { pickMission, unlockChange } from '../app/playtime.js';
import {
  GREETING, MAP_GUIDE, MAP_WORD, LOCK_TEXT, NOT_MET, UNLOCK_TEXT,
  bookCount, lockLine, stickerLine, villageComplete,
} from '../audio/script.js';

/** 끝낸 표시(별)를 붙인다 */
const withStar = (el, done) => {
  if (done) el.append(pic('star', 'badge'));
  return el;
};

/** 지도로 돌아가며 "지도" 하고 말한다 */
const goMap = (app) => {
  app.go('map');
  app.say(MAP_WORD);
};

export const startScreen = {
  showBar: false,
  background: 'bg-savanna',
  render(root, app) {
    // 브라우저는 화면을 한 번 누르기 전에는 소리를 막는다. 그래서 처음 화면을 누를 때도 안내한다.
    app.say(GREETING);
    root.addEventListener('pointerdown', (e) => {
      if (!e.target.closest('.start-btn')) app.say(GREETING);
    });
    root.append(pic('elephant', 'hero'));
    root.append(picButton('시작', 'play', 'big-btn start-btn', () => {
      app.go('map');
      app.say(MAP_GUIDE);
    }));
  },
};

export const mapScreen = {
  background: 'bg-savanna',
  render(root, app) {
    const row = h('div', 'card-row');
    for (const v of VILLAGES) {
      const card = button(v.name, 'village-card', () => {
        app.go('village', { village: v.key });
        app.say(v.intro);
      });
      const thumb = h('div', 'thumb');
      thumb.append(pic(v.background, 'thumb-img'), pic(v.animals[0], 'friend'));
      card.append(thumb, h('span', 'name', v.name));
      row.append(withStar(card, villageDone(v, app.progress.done)));
    }
    root.append(row);
  },
};

export const villageScreen = {
  background: (params) => villageOf(params.village).background,
  render(root, app, { village: key }) {
    const village = villageOf(key);
    app.bar.setBack(() => goMap(app), '지도로 가기');
    const row = h('div', 'card-row games');
    village.games.forEach((g, i) => {
      const card = button(g.name, 'game-card', () => app.go('game', { village: key, game: g.key }));
      card.append(pic(g.icon, 'icon'), pic(village.animals[i], 'friend'));
      row.append(withStar(card, app.progress.done[g.key]));
    });
    root.append(row, pic('elephant', 'guide'));
  },
};

export const rewardScreen = {
  showBook: false,
  background: (params) => villageOf(params.village).background,
  render(root, app, { village: key, game, isNew = true }) {
    const village = villageOf(key);
    const complete = villageDone(village, app.progress.done);
    const animal = gameOf(game).sticker;
    const name = ANIMAL_NAMES[animal];
    root.append(
      h('div', 'glowbg'),
      pic(animal, 'sticker'),
      h('p', 'sticker-name', isNew ? `${name} 스티커!` : `${name} 스티커 하나 더!`),
    );
    if (complete) {
      const friends = h('div', 'complete-row');
      village.animals.forEach((a) => friends.append(pic(a)));
      root.append(friends);
    }
    app.sfx.sticker();
    cheer(root.closest('.stage'));
    app.say(complete ? villageComplete(village.name) : stickerLine(name, isNew));
    root.append(picButton('다음', 'play', 'big-btn next-btn', () => app.go('village', { village: key })));
  },
};

/** 스티커북 칸: 모은 친구는 색깔, 아직 없는 친구는 흐린 그림자. 누르면 이름을 말한다. */
function slot(animal, has, app) {
  const el = button(has ? ANIMAL_NAMES[animal] : '아직 없음', `slot ${has ? 'has' : 'miss'}`, () =>
    app.say(has ? ANIMAL_NAMES[animal] : NOT_MET));
  el.append(pic(animal));
  return el;
}

export const bookScreen = {
  showBook: false,
  background: 'bg-savanna',
  render(root, app, { back = { name: 'map', params: {} } } = {}) {
    const stickers = app.progress.stickers;
    const slots = h('div', 'slots');
    const tabs = VILLAGES.map((v) => {
      const tab = button(`${v.name} 스티커`, 'btab', () => show(v.key));
      tab.dataset.village = v.key;
      tab.append(pic(v.animals[0]));
      return tab;
    });
    function show(key) {
      tabs.forEach((t) => t.classList.toggle('on', t.dataset.village === key));
      slots.replaceChildren(...villageOf(key).games.map((g) => slot(g.sticker, stickers.includes(g.key), app)));
    }
    const btabs = h('div', 'btabs');
    btabs.append(...tabs);
    root.append(btabs, slots, picButton('스티커북 닫기', 'close', 'bookclose', () => app.go(back.name, back.params)));
    show(back.params?.village ?? VILLAGES[0].key);
    app.say(bookCount(stickers.length));
  },
};

export const lockScreen = {
  showBar: false,
  background: 'bg-night',
  render(root, app, { resume = { name: 'map', params: {} } } = {}) {
    const mission = pickMission();
    const hold = button('부모님: 2초 동안 누르면 다시 놀 수 있어요', 'hold', () => {});
    hold.textContent = '부모님: 2초 동안 누르기';
    holdable(hold, PARENT_HOLD_MS, () => {
      app.update(unlockChange);
      app.go(resume.name, resume.params);
      app.say(UNLOCK_TEXT);
    });
    root.append(
      h('div', 'zzz', 'Z z z'),
      pic('elephant', 'sleepy'),
      h('p', '', LOCK_TEXT),
      h('p', 'mission', mission),
      hold,
    );
    app.say(lockLine(mission));
  },
};
