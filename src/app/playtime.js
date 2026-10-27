// 하루 놀이 시간: 계산(화면과 상관없음) + 1초마다 재는 시계.
// 시간이 다 되면 잠금 화면으로 가고, 부모님이 1초 눌러 풀 수 있다.
import { pickOne } from '@공통/games/logic.js';

export const MINUTE = 60_000;
export const WARN_BEFORE_MS = MINUTE; // 끝나기 1분 전에 알림
const TICK_MS = 1000;
const MAX_GAP_MS = 5000; // 기기가 잠들었다 깨어난 틈은 이만큼만 센다
const SAVE_EVERY_TICKS = 5;

// 잠금 화면의 화면 밖 미션 (집에서 수를 찾아보기)
export const MISSIONS = Object.freeze([
  '집에서 숟가락 세 개를 찾아볼까?',
  '빨간 물건 두 개를 찾아볼까?',
  '인형 다섯 개를 줄 세워 볼까?',
  '손가락으로 하나부터 열까지 세어 볼까?',
  '양말 짝 두 개를 찾아볼까?',
  '창문 밖 나무가 몇 그루인지 세어 볼까?',
]);
export const pickMission = (rnd = Math.random) => pickOne(MISSIONS, rnd);

export const limitMs = (p) => p.limitMin * MINUTE + p.bonusMs;
export const remainingMs = (p) => Math.max(0, limitMs(p) - p.usedMs);

/** 'ok' | 'warn'(1분 이하 남음) | 'over'(다 씀) */
export function timeState(p) {
  const left = limitMs(p) - p.usedMs;
  if (left <= 0) return 'over';
  if (left <= WARN_BEFORE_MS) return 'warn';
  return 'ok';
}

/** 시간이 흐른 만큼의 변경. 날짜가 바뀌었으면 오늘 시간을 처음부터 잰다. */
export function tickChange(p, ms, today) {
  if (p.day !== today) return { day: today, usedMs: ms, bonusMs: 0 };
  return { usedMs: p.usedMs + ms };
}

/** 지금부터 minutes분 더 놀 수 있게 한다 (이미 넘긴 시간은 메워 준다). 부모 메뉴 "15분 더 놀기"도 이것. */
export const moreTimeChange = (p, minutes) => ({
  bonusMs: p.bonusMs + Math.max(p.usedMs - limitMs(p), 0) + minutes * MINUTE,
});
/** 잠금 해제: 지금부터 정한 시간(limitMin)만큼 */
export const unlockChange = (p) => moreTimeChange(p, p.limitMin);
/** 부모 메뉴 "1분 (시험용)" */
export const testLimitChange = () => ({ limitMin: 1, usedMs: 0, bonusMs: 0 });

/** 기록 지우기: 스티커·별·마을 열림만 처음으로. 시간과 설정(음악, 제한)은 그대로. */
export const resetChange = () => ({
  stickers: [],
  done: {},
  special: false,
  specialSeen: false,
  forestOpen: false,
  seaOpen: false,
  allOpen: false,
});

/**
 * 1초마다 시간을 잰다.
 * @param update (change, { save }) => void  — save가 true일 때만 저장소에 쓴다
 */
export function createClock({ getProgress, update, today, isPaused, onWarn, onOver, now = Date.now }) {
  let timer = null;
  let ticks = 0;
  let warned = false;
  let last = now();

  function tick() {
    const t = now();
    // 실제로 흐른 시간 (타이머가 늦게 와도 덜 재지 않게). 멈춘 동안은 세지 않는다.
    const elapsed = Math.min(Math.max(t - last, 0), MAX_GAP_MS);
    last = t;
    if (isPaused()) return;
    ticks += 1;
    update(tickChange(getProgress(), elapsed, today()), { save: ticks % SAVE_EVERY_TICKS === 0 });
    const state = timeState(getProgress());
    if (state === 'ok') warned = false; // 시간을 더 받으면 다시 알릴 수 있게
    if (state === 'warn' && !warned) {
      warned = true;
      onWarn();
    }
    if (state === 'over') onOver();
  }

  return {
    start() {
      clearInterval(timer);
      last = now();
      timer = setInterval(tick, TICK_MS);
    },
    stop() {
      clearInterval(timer);
      timer = null;
    },
  };
}
