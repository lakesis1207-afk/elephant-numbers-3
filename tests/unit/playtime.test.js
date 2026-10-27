import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  MINUTE, limitMs, remainingMs, timeState, tickChange, unlockChange, moreTimeChange, testLimitChange, resetChange,
  MISSIONS, pickMission, createClock,
} from '../../src/app/playtime.js';
import { DEFAULT_PROGRESS, freezeProgress } from '../../src/storage/progress.js';

const TODAY = '2026-10-21';
const progressWith = (change) => freezeProgress({ ...DEFAULT_PROGRESS, day: TODAY, ...change });

describe('놀이 시간 계산', () => {
  test('하루 제한은 정한 분 + 부모님이 더해 준 시간', () => {
    expect(limitMs(progressWith({ limitMin: 15, bonusMs: 5 * MINUTE }))).toBe(20 * MINUTE);
  });

  test('남은 시간은 0 아래로 내려가지 않는다', () => {
    expect(remainingMs(progressWith({ usedMs: 16 * MINUTE }))).toBe(0);
    expect(remainingMs(progressWith({ usedMs: 5 * MINUTE }))).toBe(10 * MINUTE);
  });

  test('1분 넘게 남으면 ok, 1분 이하면 warn, 다 쓰면 over', () => {
    expect(timeState(progressWith({ usedMs: 13 * MINUTE }))).toBe('ok');
    expect(timeState(progressWith({ usedMs: 14 * MINUTE }))).toBe('warn');
    expect(timeState(progressWith({ usedMs: 15 * MINUTE }))).toBe('over');
  });

  test('같은 날이면 쓴 시간을 더하고, 날짜가 바뀌면 처음부터 잰다', () => {
    expect(tickChange(progressWith({ usedMs: 3000 }), 1000, TODAY)).toEqual({ usedMs: 4000 });
    expect(tickChange(progressWith({ usedMs: 3000, bonusMs: 99 }), 1000, '2026-10-22')).toEqual({
      day: '2026-10-22', usedMs: 1000, bonusMs: 0,
    });
  });

  test('잠금을 풀면 정한 시간만큼 더 놀 수 있다', () => {
    const p = progressWith({ usedMs: 15 * MINUTE });
    const unlocked = { ...p, ...unlockChange(p) };
    expect(remainingMs(unlocked)).toBe(15 * MINUTE);
  });

  test('"15분 더 놀기"는 시간을 넘긴 뒤에 눌러도 지금부터 15분을 준다', () => {
    const over = progressWith({ usedMs: 19 * MINUTE }); // 제한 15분을 4분 넘김
    expect(remainingMs({ ...over, ...moreTimeChange(over, 15) })).toBe(15 * MINUTE);
    const left = progressWith({ usedMs: 10 * MINUTE }); // 아직 5분 남음
    expect(remainingMs({ ...left, ...moreTimeChange(left, 15) })).toBe(20 * MINUTE);
  });

  test('시험용 1분은 오늘 쓴 시간을 지우고 1분으로 바꾼다', () => {
    expect(testLimitChange()).toEqual({ limitMin: 1, usedMs: 0, bonusMs: 0 });
  });

  test('기록 지우기는 스티커·별·마을만 지우고 시간과 설정은 남긴다', () => {
    const p = progressWith({ stickers: ['elephant'], done: { fruit: true }, special: true, specialSeen: true,
      forestOpen: true, allOpen: true, music: false, limitMin: 1, usedMs: 500, bonusMs: 7 });
    const after = { ...p, ...resetChange(p) };
    expect(after).toMatchObject({ stickers: [], done: {}, special: false, specialSeen: false,
      forestOpen: false, allOpen: false, music: false, limitMin: 1, usedMs: 500, bonusMs: 7, day: TODAY });
  });

  test('화면 밖 미션은 여러 개 중 하나를 고른다', () => {
    expect(MISSIONS.length).toBeGreaterThanOrEqual(5);
    expect(MISSIONS).toContain(pickMission(() => 0));
  });
});

describe('시계 (1초마다)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function setup(start = {}, paused = () => false) {
    let p = progressWith(start);
    const update = vi.fn((change) => (p = freezeProgress({ ...p, ...change })));
    const onWarn = vi.fn();
    const onOver = vi.fn();
    const clock = createClock({ getProgress: () => p, update, today: () => TODAY, isPaused: paused, onWarn, onOver });
    clock.start();
    return { clock, update, onWarn, onOver, get p() { return p; } };
  }

  test('1초마다 쓴 시간을 더하고, 5초마다 저장한다', () => {
    const s = setup();
    vi.advanceTimersByTime(5000);
    expect(s.p.usedMs).toBe(5000);
    expect(s.update.mock.calls.filter(([, opt]) => opt?.save)).toHaveLength(1);
  });

  test('멈춤(화면 꺼짐·시작 화면·잠금 화면) 동안은 재지 않는다', () => {
    const s = setup({}, () => true);
    vi.advanceTimersByTime(5000);
    expect(s.p.usedMs).toBe(0);
  });

  test('1분 남으면 한 번만 미리 알리고, 시간이 다 되면 알린다', () => {
    const s = setup({ usedMs: 14 * MINUTE - 2000 });
    vi.advanceTimersByTime(5000);
    expect(s.onWarn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(60_000);
    expect(s.onWarn).toHaveBeenCalledTimes(1);
    expect(s.onOver).toHaveBeenCalled();
  });

  test('실제로 흐른 시간을 잰다 (기기가 느려도 덜 재지 않고, 너무 큰 틈은 5초로 자른다)', () => {
    let t = 0;
    let p = progressWith({});
    const clock = createClock({
      getProgress: () => p, update: (c) => (p = freezeProgress({ ...p, ...c })), today: () => TODAY,
      isPaused: () => false, onWarn: () => {}, onOver: () => {}, now: () => t,
    });
    clock.start();
    t = 3000; vi.advanceTimersByTime(1000); // 1초 간격인데 3초가 흐름
    expect(p.usedMs).toBe(3000);
    t = 63_000; vi.advanceTimersByTime(1000); // 1분 동안 멈춰 있었음
    expect(p.usedMs).toBe(8000);
    clock.stop();
  });

  test('stop하면 더 이상 재지 않는다', () => {
    const s = setup();
    s.clock.stop();
    vi.advanceTimersByTime(5000);
    expect(s.p.usedMs).toBe(0);
  });
});
