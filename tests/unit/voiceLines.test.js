import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { VOICE_LINES, voiceIdOf } from '../../src/audio/voiceLines.js';
import { GAME_KEYS, LEVELS, hintFor, makeQuestion } from '../../src/games/questions.js';
import { PRAISE } from '../../src/games/logic.js';
import { RETRY_TEXT, IDLE_TEXT } from '../../src/games/engine.js';
import { ANIMAL_NAMES, VILLAGES } from '../../src/games/villages.js';
import { MISSIONS } from '../../src/app/playtime.js';
import * as S from '../../src/audio/script.js';

const VOICE_DIR = new URL('../../public/audio/voice/', import.meta.url);

describe('음성 목록', () => {
  it('파일 이름과 문장이 겹치지 않는다', () => {
    expect(new Set(VOICE_LINES.map((l) => l.id)).size).toBe(VOICE_LINES.length);
    expect(new Set(VOICE_LINES.map((l) => l.text)).size).toBe(VOICE_LINES.length);
  });

  it('게임 9개의 문제와 힌트가 모두 목록에 있다', () => {
    for (const key of GAME_KEYS) {
      expect(voiceIdOf(hintFor(key))).not.toBeNull();
      for (const range of LEVELS) {
        for (let i = 0; i < 200; i++) expect(voiceIdOf(makeQuestion(key, { range }).prompt), key).not.toBeNull();
      }
    }
  });

  it('게임 밖 대사(인사, 지도, 칭찬, 스티커, 스티커북, 마을, 시간·잠금)도 모두 목록에 있다', () => {
    const names = Object.values(ANIMAL_NAMES);
    const texts = [
      S.GREETING, S.MAP_WORD, S.MAP_GUIDE, S.WARN_TEXT, S.UNLOCK_TEXT, S.NOT_MET, RETRY_TEXT, IDLE_TEXT, ...PRAISE,
      ...VILLAGES.flatMap((v) => [v.intro, S.villageComplete(v.name)]),
      ...names.flatMap((n) => [n, S.stickerLine(n, true), S.stickerLine(n, false)]),
      ...Array.from({ length: 10 }, (_, n) => S.bookCount(n)),
      ...MISSIONS.map(S.lockLine),
    ];
    for (const t of texts) expect(voiceIdOf(t), t).not.toBeNull();
  });

  it('4세 앱에서 복사한 녹음이 있다 (지도, 잠금, 스티커, 스티커북 등)', () => {
    const animals = ['chick', 'rabbit', 'pig', 'squirrel', 'panda', 'owl', 'crab', 'turtle'];
    const copied = [
      'idle', 'praise-2', 'praise-5', 'map', 'unlock', 'not-met',
      ...Array.from({ length: 10 }, (_, i) => `count-${i + 1}`),
      ...Array.from({ length: 10 }, (_, i) => `book-${i}`),
      ...MISSIONS.map((_, i) => `lock-${i + 1}`),
      ...animals.flatMap((a) => [`name-${a}`, `sticker-${a}`, `sticker-again-${a}`]),
    ];
    for (const id of copied) expect(existsSync(new URL(`${id}.mp3`, VOICE_DIR)), id).toBe(true);
  });
});
