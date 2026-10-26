import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createGameRun, NEXT_DELAY_MS, RETRY_LOCK_MS, RETRY_TEXT } from '../../src/games/engine.js';

const LEVELS = [[1, 3], [1, 5], [1, 10]];

function setup(extra = {}) {
  const fx = { say: vi.fn(), cheer: vi.fn(), bubble: vi.fn(), sfx: { yes: vi.fn(), boing: vi.fn() } };
  const hint = vi.fn(async () => {});
  const onFinish = vi.fn();
  const run = createGameRun({ levels: LEVELS, fx, ask: () => ({ n: 1, prompt: '문제', hint }), onFinish, ...extra });
  return { run, fx, hint, onFinish };
}

describe('게임 흐름', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('5문제를 모두 맞히면 끝난다', async () => {
    const { run, onFinish } = setup();
    run.start();
    for (let i = 0; i < 5; i++) {
      expect(await run.answer(true)).toBe('right');
      vi.advanceTimersByTime(NEXT_DELAY_MS);
    }
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('첫 오답은 실패 표시 없이 "다시 해 볼까?"만 말한다', async () => {
    const { run, fx } = setup();
    run.start();
    expect(await run.answer(false)).toBe('retry');
    expect(fx.bubble).toHaveBeenCalledWith(RETRY_TEXT, true);
    expect(RETRY_TEXT).toBe('다시 해 볼까?');
  });

  it('두 번 틀리면 힌트를 보여 준다', async () => {
    const { run, hint } = setup();
    run.start();
    await run.answer(false);
    vi.advanceTimersByTime(RETRY_LOCK_MS);
    expect(await run.answer(false)).toBe('hint');
    expect(hint).toHaveBeenCalledTimes(1);
  });

  it('놀이 시간이 다 되면 다음 문제 전에 멈춘다', async () => {
    const onPause = vi.fn();
    const { run } = setup({ shouldPause: () => true, onPause });
    run.start();
    await run.answer(true);
    vi.advanceTimersByTime(NEXT_DELAY_MS);
    expect(onPause).toHaveBeenCalledTimes(1);
  });
});
