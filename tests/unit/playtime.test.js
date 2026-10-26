import { describe, expect, it } from 'vitest';
import { DEFAULT_PROGRESS, createProgressStore } from '../../src/storage/progress.js';
import { MINUTE, remainingMs, resetChange, tickChange, timeState, unlockChange } from '../../src/app/playtime.js';
import { PARENT_HOLD_MS } from '../../src/widgets/hold.js';

const base = { ...DEFAULT_PROGRESS, day: '2026-10-23' };

describe('10분 놀이 시간', () => {
  it('기본은 10분이고 부모 메뉴 누르기는 2초다', () => {
    expect(DEFAULT_PROGRESS.limitMin).toBe(10);
    expect(remainingMs(base)).toBe(10 * MINUTE);
    expect(PARENT_HOLD_MS).toBe(2000);
  });

  it('9분이 지나면 경고, 10분이 지나면 끝', () => {
    expect(timeState({ ...base, usedMs: 8 * MINUTE })).toBe('ok');
    expect(timeState({ ...base, usedMs: 9 * MINUTE })).toBe('warn');
    expect(timeState({ ...base, usedMs: 10 * MINUTE })).toBe('over');
  });

  it('잠금을 풀면 다시 10분을 준다', () => {
    const over = { ...base, usedMs: 10 * MINUTE };
    const after = { ...over, ...unlockChange(over) };
    expect(remainingMs(after)).toBe(10 * MINUTE);
  });

  it('날짜가 바뀌면 시간을 처음부터 잰다', () => {
    expect(tickChange({ ...base, usedMs: 5000 }, 1000, '2026-10-24')).toEqual({ day: '2026-10-24', usedMs: 1000, bonusMs: 0 });
  });

  it('기록 지우기는 스티커를 지우고 제한을 10분으로 되돌린다', () => {
    expect(resetChange()).toEqual({ stickers: [], done: {}, limitMin: 10 });
  });
});

describe('저장소', () => {
  const memory = (initial) => {
    let value = initial;
    return { getItem: () => value, setItem: (_, v) => (value = v) };
  };

  it('깨진 기록은 기본값으로 읽는다', () => {
    expect(createProgressStore(memory('{깨짐')).load('2026-10-23').limitMin).toBe(10);
  });

  it('저장한 기록을 같은 날 다시 읽는다', () => {
    const storage = memory(null);
    const store = createProgressStore(storage);
    store.save({ ...base, stickers: ['count'], done: { count: true }, usedMs: 3000 });
    const loaded = store.load('2026-10-23');
    expect(loaded.stickers).toEqual(['count']);
    expect(loaded.usedMs).toBe(3000);
  });
});
