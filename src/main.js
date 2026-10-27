// 앱 시작점: 진행 기록을 읽고, 화면 전환·소리·위쪽 막대·놀이 시간을 묶어 첫 화면을 띄운다.
import '@fontsource/jua';
import '@fontsource/dongle/700.css'; // 마을·게임 이름용 귀여운 굵은 글씨 (한글 전체가 나뉘어 들어 있다)
import './styles/base.css';
import './styles/screens.css';
import './styles/games.css';
import './styles/villages.css';
import './styles/rewards.css';
import './styles/lock.css';
import { createProgressStore, freezeProgress } from './storage/progress.js';
import { localDay } from './app/time.js';
import { createRouter, blockBackButton } from './app/router.js';
import { createClock, timeState } from './app/playtime.js';
import { sfx } from './audio/sfx.js';
import { audioContext } from './audio/context.js';
import { say } from './audio/voice.js';
import { WARN_TEXT } from './audio/script.js';
import { art, setArtLookup } from '@공통/widgets/dom.js';
import { artUrl } from './art/registry.js';
import { createToast } from './widgets/toast.js';
import { createTopbar } from './widgets/topbar.js';
import { createParentMenu } from './widgets/parentMenu.js';
import { registerOffline } from './app/offline.js';
import { startScreen } from './screens/start.js';
import { mapScreen } from './screens/map.js';
import { villageScreen } from './screens/village.js';
import { soonScreen } from './screens/soon.js';
import { gameScreen } from './screens/game.js';
import { rewardScreen } from './screens/reward.js';
import { bookScreen } from './screens/book.js';
import { lockScreen } from './screens/lock.js';

setArtLookup(artUrl); // 공통 코드가 이 앱의 그림 목록을 쓰도록 등록한다

const $ = (id) => document.getElementById(id);

const store = createProgressStore();
let progress = freezeProgress(store.load(localDay()));

const SCREENS = {
  start: startScreen, map: mapScreen, village: villageScreen, soon: soonScreen, game: gameScreen,
  reward: rewardScreen, book: bookScreen, lock: lockScreen,
};
const DEFAULT_BACKGROUND = 'savanna-base';
// 시간이 다 됐을 때 바로 잠그는 화면 (게임은 하던 문제까지, 보상 화면은 ▶ 뒤에)
const LOCK_NOW = ['map', 'village', 'soon', 'book'];
// 시계를 멈추는 화면
const CLOCK_PAUSED = ['start', 'lock'];

let background = '';
function setBackground(name) {
  if (background === name) return;
  background = name;
  $('bg').replaceChildren(art('background', name));
}

/** 잠금을 풀면 돌아갈 곳: 지도·마을이면 그대로, 그 밖에는 마을이나 지도 */
function resumeTarget({ name, params }) {
  if (name === 'map' || name === 'village') return { name, params };
  if (params?.village) return { name: 'village', params: { village: params.village } };
  return { name: 'map', params: {} };
}

// 화면들이 함께 쓰는 기능 모음
const app = {
  get progress() {
    return progress;
  },
  get current() {
    return router.current;
  },
  /** 기록 바꾸기: 새 객체를 만든다(원래 객체는 그대로). change는 객체 또는 (기록) => 객체 */
  update(change, { save = true } = {}) {
    const patch = typeof change === 'function' ? change(progress) : change;
    progress = freezeProgress({ ...progress, ...patch });
    if (save) store.save(progress);
  },
  go: (name, params) => router.go(name, params),
  /** 지금 화면을 다시 그린다 (부모 메뉴에서 설정을 바꾼 뒤) */
  refresh: () => router.go(router.current.name, router.current.params),
  /** 스티커북을 열고, 닫으면 지금 화면으로 돌아간다 */
  openBook: () => router.go('book', { back: router.current }),
  openParentMenu: () => parentMenu.open(),
  lock: (from = router.current) => router.go('lock', { resume: resumeTarget(from) }),
  isTimeOver: () => timeState(progress) === 'over',
  startSound: () => audioContext(), // 첫 터치에 소리 장치를 깨워 둔다 (배경 음악은 없음)
  say,
  sfx,
  toast: createToast($('toast')),
};

const topbar = createTopbar($('bar'), app);
// 게임 화면이 위쪽 막대의 문제 점·돌아가기 버튼을 쓴다
app.bar = { setDots: (done, total) => topbar.setDots(done, total), setBack: (fn, label) => topbar.setBack(fn, label) };
const parentMenu = createParentMenu($('stage'), app);

// 화면마다 배경을 정할 수 있다: 이름 또는 (params) => 이름
const backgroundOf = (screen, params) =>
  (typeof screen.background === 'function' ? screen.background(params) : screen.background) ?? DEFAULT_BACKGROUND;

let leaving = null;
let shownName = null;

const router = createRouter({
  screens: SCREENS,
  onChange: ({ name, params }) => {
    leaving?.(); // 앞 화면 정리 (게임 타이머 멈추기 등)
    // 다른 화면으로 바뀌면(잠금 등) 부모 메뉴를 닫는다. 같은 화면 다시 그리기(설정 반영)는 그대로 둔다.
    if (name !== shownName) parentMenu.close();
    shownName = name;
    const screen = SCREENS[name];
    leaving = screen.leave ? () => screen.leave() : null;
    const root = $('screen');
    root.replaceChildren();
    root.className = `screen ${name}`;
    setBackground(backgroundOf(screen, params));
    topbar.update({ visible: screen.showBar !== false, showBook: screen.showBook !== false });
    screen.render(root, app, params);
  },
});

// 놀이 시간: 1초마다 재고, 1분 전에 알리고, 다 되면 잠근다
const clock = createClock({
  getProgress: () => progress,
  update: (change, opts) => app.update(change, opts),
  today: localDay,
  isPaused: () => document.hidden || CLOCK_PAUSED.includes(router.current?.name),
  onWarn: () => say(WARN_TEXT),
  onOver: () => {
    if (parentMenu.isOpen) return;
    if (LOCK_NOW.includes(router.current.name)) app.lock();
  },
});

// 화면이 꺼질 때(다른 앱으로 갈 때) 쓴 시간을 바로 저장
document.addEventListener('visibilitychange', () => {
  if (document.hidden) store.save(progress);
});

blockBackButton();
router.go('start');
clock.start();
registerOffline();
