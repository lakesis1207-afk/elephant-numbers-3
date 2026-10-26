// 음성 목록: 앱이 할 수 있는 모든 말 → 녹음 파일 이름 (public/audio/voice/<id>.mp3).
// 문장은 대사를 정의한 곳에서 가져오므로, 대사를 고치면 목록도 같이 바뀐다.
// 4세 앱과 같은 문장이면 같은 파일 이름을 써서 그 녹음을 복사해 쓴다
// (idle, praise-2·5, count-n, name-*, sticker-*, map, lock-n, unlock, book-n, not-met).
// 문장을 바꿨으면 예전 녹음 파일을 지우고 npm run voice:azure 를 하면 새로 만든다.
import { NATIVE, PRAISE } from '../games/logic.js';
import { RETRY_TEXT, IDLE_TEXT } from '../games/engine.js';
import { FRUITS, HINTS, POSITIONS, PROMPTS, SHAPES } from '../games/questions.js';
import { ANIMAL_NAMES, VILLAGES } from '../games/villages.js';
import { MISSIONS } from '../app/playtime.js';
import * as S from './script.js';

const MAX_COUNT = 10;
const MAX_STICKERS = 9;
const FRUIT_IDS = { 사과: 'apple', 바나나: 'banana', 딸기: 'strawberry' };
const SHAPE_IDS = { 동그라미: 'circle', 네모: 'square', 세모: 'triangle' };
const POSITION_IDS = { 위: 'up', 아래: 'down', 안: 'in', 밖: 'out' };

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const line = (group, id, text) => ({ group, id, text });

function build() {
  const animals = Object.entries(ANIMAL_NAMES);
  return [
    // 시작·지도
    line('시작·지도', 'greeting', S.GREETING),
    line('시작·지도', 'map', S.MAP_WORD),
    line('시작·지도', 'map-guide', S.MAP_GUIDE),
    ...VILLAGES.map((v) => line('시작·지도', `intro-${v.key}`, v.intro)),

    // 칭찬·격려·힌트
    line('칭찬·힌트', 'retry', RETRY_TEXT),
    line('칭찬·힌트', 'idle', IDLE_TEXT),
    line('칭찬·힌트', 'hint-count', HINTS.count),
    line('칭찬·힌트', 'hint-subitize', HINTS.subitize),
    line('칭찬·힌트', 'hint-look', HINTS.look),
    ...PRAISE.map((p, i) => line('칭찬·힌트', `praise-${i + 1}`, p)),
    ...range(1, MAX_COUNT).map((n) => line('칭찬·힌트', `count-${n}`, NATIVE[n])),

    // 게임 문제
    ...FRUITS.flatMap((f) => range(1, MAX_COUNT).map((n) => line('세어 주기', `count-q-${FRUIT_IDS[f]}-${n}`, PROMPTS.count(f, n)))),
    line('많다 적다', 'more-q', PROMPTS.more),
    line('많다 적다', 'fewer-q', PROMPTS.fewer),
    ...SHAPES.map((s) => line('모양 찾기', `shape-q-${SHAPE_IDS[s]}`, PROMPTS.shape(s))),
    line('크다 작다', 'size-big', PROMPTS.big),
    line('크다 작다', 'size-small', PROMPTS.small),
    line('짝 맞추기', 'match-q', PROMPTS.match),
    line('한눈에 알기', 'subitize-q', PROMPTS.subitize),
    line('패턴 이어가기', 'pattern-q', PROMPTS.pattern),
    ...POSITIONS.map((p) => line('위 아래 안 밖', `position-${POSITION_IDS[p]}`, PROMPTS.position(p))),
    line('같은 수 찾기', 'samecount-q', PROMPTS.samecount),

    // 보상·스티커북
    ...animals.map(([key, name]) => line('스티커', `name-${key}`, name)),
    ...animals.flatMap(([key, name]) => [
      line('스티커', `sticker-${key}`, S.stickerLine(name, true)),
      line('스티커', `sticker-again-${key}`, S.stickerLine(name, false)),
    ]),
    ...VILLAGES.map((v) => line('스티커', `complete-${v.key}`, S.villageComplete(v.name))),
    ...range(0, MAX_STICKERS).map((n) => line('스티커', `book-${n}`, S.bookCount(n))),
    line('스티커', 'not-met', S.NOT_MET),

    // 시간·잠금
    line('시간·잠금', 'warn-1min', S.WARN_TEXT),
    ...MISSIONS.map((m, i) => line('시간·잠금', `lock-${i + 1}`, S.lockLine(m))),
    line('시간·잠금', 'unlock', S.UNLOCK_TEXT),
  ];
}

export const VOICE_LINES = Object.freeze(build().map(Object.freeze));
const ID_BY_TEXT = new Map(VOICE_LINES.map((l) => [l.text, l.id]));

/** 문장 → 녹음 파일 이름 (목록에 없으면 null) */
export const voiceIdOf = (text) => ID_BY_TEXT.get(text) ?? null;
