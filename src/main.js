// 앱 시작점: 기록을 읽고, 화면 전환·소리·위쪽 막대·놀이 시간(10분)을 묶어 첫 화면을 띄운다.
import '@fontsource/jua';
import './styles.css';
import { createProgressStore, freezeProgress } from './storage/progress.js';
import { localDay } from './app/time.js';
import { createRouter, blockBackButton } from './app/router.js';
import { createClock, timeState } from './app/playtime.js';
import { say, sfx } from './audio/sound.js';
import { WARN_TEXT } from './audio/script.js';
import { pic } from './widgets/dom.js';
import { createTopbar } from './widgets/topbar.js';
import { createParentMenu } from './widgets/parentMenu.js';
import { createToast } from './widgets/toast.js';
import { startScreen, mapScreen, villageScreen, rewardScreen, bookScreen, lockScreen } from './screens/basic.js';
import { gameScreen } from './screens/game.js';
import { registerOffline } from './app/offline.js';

const $ = (id) => document.getElementById(id);

const store = createProgressStore();
let progress = freezeProgress(store.load(localDay()));

const SCREENS = { start: startScreen, map: mapScreen, village: villageScreen, game: gameScreen, reward: rewardScreen, book: bookScreen, lock: lockScreen };
const LOCK_NOW = ['map', 'village', 'book']; // 시간이 다 되면 바로 잠그는 화면 (게임은 하던 문제까지)
const CLOCK_PAUSED = ['start', 'lock'];

function resumeTarget({ name, params }) {
  if (name === 'map' || name === 'village') return { name, params };
  return params?.village ? { name: 'village', params: { village: params.village } } : { name: 'map', params: {} };
}

const app = {
  get progress() { return progress; },
  get current() { return router.current; },
  update(change, { save = true } = {}) {
    const patch = typeof change === 'function' ? change(progress) : change;
    progress = freezeProgress({ ...progress, ...patch });
    if (save) store.save(progress);
  },
  go: (name, params) => router.go(name, params),
  refresh: () => router.go(router.current.name, router.current.params),
  openParentMenu: () => parentMenu.open(),
  /** 스티커북을 열고, 닫으면 지금 화면으로 돌아간다 */
  openBook: () => router.go('book', { back: router.current }),
  lock: (from = router.current) => router.go('lock', { resume: resumeTarget(from) }),
  isTimeOver: () => timeState(progress) === 'over',
  /** 게임 하나를 끝까지 했을 때: 끝낸 표시 + 스티커 1장(점수와 무관) 후 보상 화면 */
  finishGame(village, game) {
    const isNew = !progress.stickers.includes(game);
    app.update((p) => ({
      done: { ...p.done, [game]: true },
      stickers: isNew ? [...p.stickers, game] : p.stickers,
    }));
    router.go('reward', { village, game, isNew });
  },
  say,
  sfx,
  toast: createToast($('toast')),
};

const topbar = createTopbar($('bar'), app);
app.bar = { setDots: topbar.setDots, setBack: topbar.setBack };
const parentMenu = createParentMenu($('stage'), app);

let leaving = null;
let shownName = null;

const router = createRouter({
  screens: SCREENS,
  onChange: ({ name, params }) => {
    leaving?.();
    if (name !== shownName) parentMenu.close();
    shownName = name;
    const screen = SCREENS[name];
    leaving = screen.leave ? () => screen.leave() : null;
    const root = $('screen');
    root.replaceChildren();
    root.className = `screen ${name}`;
    const bgName = typeof screen.background === 'function' ? screen.background(params) : screen.background;
    $('bg').replaceChildren(pic(bgName ?? 'bg-savanna', 'bg-img'));
    topbar.update({ visible: screen.showBar !== false, showBook: screen.showBook !== false });
    screen.render(root, app, params);
  },
});

const clock = createClock({
  getProgress: () => progress,
  update: (change, opts) => app.update(change, opts),
  today: localDay,
  isPaused: () => document.hidden || CLOCK_PAUSED.includes(router.current?.name),
  onWarn: () => say(WARN_TEXT),
  onOver: () => {
    if (!parentMenu.isOpen && LOCK_NOW.includes(router.current.name)) app.lock();
  },
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) store.save(progress);
});

blockBackButton();
router.go('start');
clock.start();
registerOffline();
