// 진행 기록 저장소: 기기 안(localStorage)에만 저장한다. 서버로 보내지 않는다.

export const STORAGE_KEY = 'elephant-numbers-3';

export const freezeProgress = (p) =>
  Object.freeze({ ...p, stickers: Object.freeze([...p.stickers]), done: Object.freeze({ ...p.done }) });

export const DEFAULT_PROGRESS = freezeProgress({
  stickers: [], // 받은 스티커 (게임 키 목록)
  done: {},     // 끝낸 게임 { count: true, ... }
  limitMin: 10, // 하루 놀이 시간(분)
  day: '',      // 마지막으로 논 날짜 (YYYY-MM-DD)
  usedMs: 0,    // 오늘 쓴 시간
  bonusMs: 0,   // 부모님이 더해 준 시간
});

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isCount = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0;

/** 저장된 값을 칸별로 검사한다. 모양이 틀린 칸은 기본값으로 되돌린다(화면이 멈추지 않게). */
function sanitize(saved) {
  const d = DEFAULT_PROGRESS;
  return {
    stickers: Array.isArray(saved.stickers) ? saved.stickers.filter((s) => typeof s === 'string') : [],
    done: isPlainObject(saved.done)
      ? Object.fromEntries(Object.entries(saved.done).filter(([, v]) => v === true))
      : {},
    limitMin: isCount(saved.limitMin) && saved.limitMin > 0 ? saved.limitMin : d.limitMin,
    day: typeof saved.day === 'string' ? saved.day : d.day,
    usedMs: isCount(saved.usedMs) ? saved.usedMs : d.usedMs,
    bonusMs: isCount(saved.bonusMs) ? saved.bonusMs : d.bonusMs,
  };
}

const defaultsFor = (today) => ({ ...DEFAULT_PROGRESS, stickers: [], done: {}, day: today });

function readSaved(storage) {
  try {
    const value = JSON.parse(storage.getItem(STORAGE_KEY));
    return isPlainObject(value) ? value : null;
  } catch (error) {
    console.warn('[progress] 저장된 기록을 읽지 못해 기본값을 씁니다.', error);
    return null;
  }
}

export function createProgressStore(storage = globalThis.localStorage) {
  function load(today) {
    const saved = storage ? readSaved(storage) : null;
    if (!saved) return defaultsFor(today);
    const clean = sanitize(saved);
    if (clean.day === today) return clean;
    return { ...clean, day: today, usedMs: 0, bonusMs: 0 }; // 날짜가 바뀌면 시간만 새로
  }

  function save(progress) {
    if (!storage) return false;
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(progress));
      return true;
    } catch (error) {
      console.warn('[progress] 기록을 저장하지 못했습니다.', error);
      return false;
    }
  }

  return { load, save };
}
