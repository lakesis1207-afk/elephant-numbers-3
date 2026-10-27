import { describe, test, expect } from 'vitest';
import { createProgressStore, DEFAULT_PROGRESS, STORAGE_KEY, freezeProgress } from '../../src/storage/progress.js';

// localStorage와 같은 모양의 가짜 저장소 (검사용)
function fakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v); },
    removeItem: (k) => { delete data[k]; },
  };
}

const TODAY = '2026-10-21';

describe('진행 기록 저장소', () => {
  test('저장한 기록을 다시 읽으면 같은 내용이 나온다', () => {
    const store = createProgressStore(fakeStorage());
    const progress = { ...DEFAULT_PROGRESS, day: TODAY, stickers: ['elephant', 'hippo'], usedMs: 5000 };

    store.save(progress);
    const loaded = store.load(TODAY);

    expect(loaded.stickers).toEqual(['elephant', 'hippo']);
    expect(loaded.usedMs).toBe(5000);
  });

  test('기록이 없으면 기본값을 돌려준다', () => {
    const store = createProgressStore(fakeStorage());

    const loaded = store.load(TODAY);

    expect(loaded).toEqual({ ...DEFAULT_PROGRESS, day: TODAY });
  });

  test('저장된 내용이 깨져 있으면 기본값을 돌려준다', () => {
    const store = createProgressStore(fakeStorage({ [STORAGE_KEY]: '{깨진 내용' }));

    const loaded = store.load(TODAY);

    expect(loaded).toEqual({ ...DEFAULT_PROGRESS, day: TODAY });
  });

  test('날짜가 바뀌면 오늘 쓴 시간은 0으로, 스티커는 그대로 둔다', () => {
    const store = createProgressStore(fakeStorage());
    store.save({ ...DEFAULT_PROGRESS, day: '2026-10-20', stickers: ['lion'], usedMs: 900000, bonusMs: 60000 });

    const loaded = store.load(TODAY);

    expect(loaded.day).toBe(TODAY);
    expect(loaded.usedMs).toBe(0);
    expect(loaded.bonusMs).toBe(0);
    expect(loaded.stickers).toEqual(['lion']);
  });

  test('얼려 둔(바꿀 수 없는) 기록도 저장할 수 있다', () => {
    const store = createProgressStore(fakeStorage());
    const progress = Object.freeze({ ...DEFAULT_PROGRESS, day: TODAY });

    expect(store.save(progress)).toBe(true);
  });

  test('칸의 모양이 틀리면 그 칸만 기본값으로 되돌린다', () => {
    const broken = {
      day: TODAY, stickers: 'x', done: null, special: 'yes', forestOpen: 1,
      allOpen: true, music: 'on', limitMin: -5, usedMs: 'abc', bonusMs: Infinity,
    };
    const store = createProgressStore(fakeStorage({ [STORAGE_KEY]: JSON.stringify(broken) }));

    const loaded = store.load(TODAY);

    expect(loaded).toEqual({ ...DEFAULT_PROGRESS, day: TODAY, allOpen: true });
  });

  test('스티커 목록에서 글자가 아닌 것은 빼고, done은 true인 것만 남긴다', () => {
    const saved = { day: TODAY, stickers: ['lion', 3, null, 'hippo'], done: { fruit: true, pond: 'x', spots: false } };
    const store = createProgressStore(fakeStorage({ [STORAGE_KEY]: JSON.stringify(saved) }));

    const loaded = store.load(TODAY);

    expect(loaded.stickers).toEqual(['lion', 'hippo']);
    expect(loaded.done).toEqual({ fruit: true });
  });

  test('읽은 기록의 목록은 기본값과 따로 떨어진 복사본이다', () => {
    const store = createProgressStore(fakeStorage());

    const loaded = store.load(TODAY);

    expect(loaded.stickers).not.toBe(DEFAULT_PROGRESS.stickers);
    expect(loaded.done).not.toBe(DEFAULT_PROGRESS.done);
    expect(Object.isFrozen(DEFAULT_PROGRESS.stickers)).toBe(true);
    expect(Object.isFrozen(DEFAULT_PROGRESS.done)).toBe(true);
  });

  test('freezeProgress는 안쪽 목록까지 얼린다', () => {
    const frozen = freezeProgress({ ...DEFAULT_PROGRESS, day: TODAY, stickers: ['lion'], done: { fruit: true } });

    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isFrozen(frozen.stickers)).toBe(true);
    expect(Object.isFrozen(frozen.done)).toBe(true);
  });

  test('저장소를 쓸 수 없는 환경에서도 멈추지 않고 기본값을 돌려준다', () => {
    const broken = {
      getItem: () => { throw new Error('막힘'); },
      setItem: () => { throw new Error('막힘'); },
    };
    const store = createProgressStore(broken);

    expect(store.load(TODAY)).toEqual({ ...DEFAULT_PROGRESS, day: TODAY });
    expect(store.save({ ...DEFAULT_PROGRESS, day: TODAY })).toBe(false);
  });
});
