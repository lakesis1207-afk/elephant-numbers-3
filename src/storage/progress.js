// 진행 기록 저장소: 브라우저 저장소(localStorage)에만 저장한다. 서버로 보내지 않는다.

export const STORAGE_KEY = 'elephant-numbers';

/** 안쪽 목록까지 얼려서(바꿀 수 없게) 돌려준다. */
export const freezeProgress = (p) =>
  Object.freeze({ ...p, stickers: Object.freeze([...p.stickers]), done: Object.freeze({ ...p.done }) });

export const DEFAULT_PROGRESS = freezeProgress({
  stickers: [],        // 받은 동물 스티커 (동물 키 목록)
  done: {},            // 끝낸 게임 { fruit: true, ... }
  special: false,      // 특별 친구(부엉이)를 받았는지 (스티커북 칸)
  specialSeen: false,  // 특별 친구 등장 장면을 아이가 실제로 봤는지
  forestOpen: false,   // 숲속 마을이 열렸는지 (사바나를 다 끝냄)
  seaOpen: false,      // 바닷가 마을 (숲속을 다 끝냄)
  allOpen: false,      // 부모님이 모든 마을을 열었는지
  music: true,         // 배경 음악
  limitMin: 15,        // 하루 놀이 시간(분)
  day: '',             // 마지막으로 논 날짜 (YYYY-MM-DD)
  usedMs: 0,           // 오늘 쓴 시간
  bonusMs: 0,          // 부모님이 더해 준 시간
});

const BOOLEAN_FIELDS = ['special', 'specialSeen', 'forestOpen', 'seaOpen', 'allOpen', 'music'];
const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isCount = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0;

/** 저장된 값을 칸별로 검사한다. 모양이 틀린 칸은 기본값으로 되돌린다(화면이 멈추지 않게). */
function sanitize(saved) {
  const d = DEFAULT_PROGRESS;
  const booleans = Object.fromEntries(
    BOOLEAN_FIELDS.map((k) => [k, typeof saved[k] === 'boolean' ? saved[k] : d[k]]),
  );
  return {
    stickers: Array.isArray(saved.stickers) ? saved.stickers.filter((s) => typeof s === 'string') : [],
    done: isPlainObject(saved.done)
      ? Object.fromEntries(Object.entries(saved.done).filter(([, v]) => v === true))
      : {},
    ...booleans,
    limitMin: isCount(saved.limitMin) && saved.limitMin > 0 ? saved.limitMin : d.limitMin,
    day: typeof saved.day === 'string' ? saved.day : d.day,
    usedMs: isCount(saved.usedMs) ? saved.usedMs : d.usedMs,
    bonusMs: isCount(saved.bonusMs) ? saved.bonusMs : d.bonusMs,
  };
}

const defaultsFor = (today) => ({ ...DEFAULT_PROGRESS, stickers: [], done: {}, day: today });

function readRaw(storage) {
  try {
    return storage.getItem(STORAGE_KEY);
  } catch (error) {
    console.warn('[progress] 저장소를 읽을 수 없어 기본값을 씁니다.', error);
    return null;
  }
}

function parse(raw) {
  if (raw == null) return null;
  try {
    const value = JSON.parse(raw);
    return isPlainObject(value) ? value : null;
  } catch (error) {
    console.warn('[progress] 저장된 기록이 깨져 있어 기본값을 씁니다.', error);
    return null;
  }
}

export function createProgressStore(storage = globalThis.localStorage) {
  function load(today) {
    const saved = storage ? parse(readRaw(storage)) : null;
    if (!saved) return defaultsFor(today);

    const clean = sanitize(saved);
    if (clean.day === today) return clean;
    // 날짜가 바뀌면 오늘 쓴 시간만 새로 시작한다.
    return { ...clean, day: today, usedMs: 0, bonusMs: 0 };
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
