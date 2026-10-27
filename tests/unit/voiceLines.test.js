import { describe, test, expect } from 'vitest';
import { VOICE_LINES, voiceIdOf } from '../../src/audio/voiceLines.js';
import * as script from '../../src/audio/script.js';
import { NATIVE, PRAISE } from '@공통/games/logic.js';
import { RETRY_TEXT, IDLE_TEXT } from '@공통/games/engine.js';
import { MISSIONS } from '../../src/app/playtime.js';
import { SAVANNA } from '../../src/villages/savanna.js';

describe('음성 목록', () => {
  test('파일 이름과 문장은 모두 한 번씩만 나온다', () => {
    const ids = VOICE_LINES.map((l) => l.id);
    const texts = VOICE_LINES.map((l) => l.text);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(texts).size).toBe(texts.length);
  });

  test('파일 이름은 영문 소문자·숫자·하이픈만 쓴다', () => {
    VOICE_LINES.forEach(({ id }) => expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/));
  });

  test('수 세기, 칭찬, 다시 세기, 알림이 모두 들어 있다', () => {
    expect(voiceIdOf(NATIVE[3])).toBe('count-3');
    PRAISE.forEach((p) => expect(voiceIdOf(p)).toBeTruthy());
    expect(voiceIdOf(RETRY_TEXT)).toBeTruthy();
    expect(voiceIdOf(IDLE_TEXT)).toBeTruthy();
    expect(voiceIdOf(script.WARN_TEXT)).toBeTruthy();
  });

  test('게임 문제와 힌트는 나올 수 있는 수만큼 모두 들어 있다', () => {
    for (let n = 1; n <= 10; n++) expect(voiceIdOf(script.fruitHintEnd(n))).toBeTruthy();
    for (let n = 1; n <= 6; n++) {
      expect(voiceIdOf(script.pondPrompt(n))).toBeTruthy();
      expect(voiceIdOf(script.spotsHintEnd(n))).toBeTruthy();
    }
    for (let k = 2; k <= 8; k++) expect(voiceIdOf(script.pondTooMany(k))).toBeTruthy();
    expect(voiceIdOf(script.fruitPrompt('귤', '이'))).toBe('fruit-q-orange');
  });

  test('스티커·잠금 문장도 들어 있다', () => {
    SAVANNA.animals.forEach((a) => {
      expect(voiceIdOf(script.stickerLine(a.name, true))).toBeTruthy();
      expect(voiceIdOf(script.stickerLine(a.name, false, '숲속 마을'))).toBeTruthy();
      expect(voiceIdOf(a.name)).toBeTruthy();
    });
    MISSIONS.forEach((m) => expect(voiceIdOf(script.lockLine(m))).toBeTruthy());
  });

  test('목록에 없는 문장은 null', () => {
    expect(voiceIdOf('없는 문장')).toBeNull();
  });
});
