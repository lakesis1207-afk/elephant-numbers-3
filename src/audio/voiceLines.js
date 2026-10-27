// 음성 목록: 앱이 할 수 있는 모든 말 → 녹음 파일 이름.
// 녹음 파일은 public/audio/voice/<id>.mp3 로 넣는다. 파일이 없으면 브라우저 기본 음성으로 읽는다.
// 사람이 보는 목록: docs/음성 목록.md (npm run voice:list 로 다시 만든다)
import * as S from './script.js';
import { NATIVE, PRAISE } from '@공통/games/logic.js';
import { RETRY_TEXT, IDLE_TEXT } from '@공통/games/engine.js';
import { MISSIONS } from '../app/playtime.js';
import { SAVANNA } from '../villages/savanna.js';
import { VILLAGES } from '../villages/index.js';
import { villageVoiceLines } from './villageVoiceLines.js';

const MAX_COUNT = 10; // 과일 최대 10개, 하마 최대 8마리
const MAX_POND = 6; // 하마 목표 최대
const MAX_SPOTS = 6;
const MAX_HIPPOS = 8;
const FRUITS = [
  ['apple', '사과', '가'], ['strawberry', '딸기', '가'], ['orange', '귤', '이'],
  ['banana', '바나나', '가'], ['grape', '포도', '가'], ['peach', '복숭아', '가'],
];
const SPECIAL = SAVANNA.special;
// 특별 친구가 다른 마을 동물이면 이름 음성은 그 마을 묶음에서 이미 만든다 (중복 방지)
const SPECIAL_IS_VILLAGE_ANIMAL = VILLAGES.some((v) => v.detail.animals.some((a) => a.key === SPECIAL.key));
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const line = (group, id, text) => ({ group, id, text });

function build() {
  const others = VILLAGES.filter((v) => v.key !== 'savanna');
  return [
    // 시작·지도·마을
    line('시작·지도', 'greeting', S.GREETING),
    line('시작·지도', 'map', S.MAP_WORD),
    ...others.map((v) => line('시작·지도', `locked-${v.key}`, S.lockedVillage(v.name))),
    ...others.map((v) => line('시작·지도', `soon-${v.key}`, S.soonVillage(v.name))),
    line('시작·지도', 'savanna-enter', SAVANNA.story.enterVoice),
    line('시작·지도', 'savanna-story', SAVANNA.story.storyVoice),

    // 수 세기 (고유어)
    ...range(1, MAX_COUNT).map((n) => line('수 세기', `count-${n}`, NATIVE[n])),

    // 칭찬·격려·힌트
    ...PRAISE.map((p, i) => line('칭찬·격려', `praise-${i + 1}`, p)),
    line('칭찬·격려', 'retry', RETRY_TEXT),
    line('칭찬·격려', 'idle', IDLE_TEXT),

    // 과일 세기
    ...FRUITS.map(([key, name, particle]) => line('과일 세기', `fruit-q-${key}`, S.fruitPrompt(name, particle))),
    line('과일 세기', 'fruit-hint', S.FRUIT_HINT_START),
    ...range(1, MAX_COUNT).map((n) => line('과일 세기', `fruit-hint-${n}`, S.fruitHintEnd(n))),

    // 물웅덩이 채우기
    ...range(1, MAX_POND).map((n) => line('물웅덩이', `pond-q-${n}`, S.pondPrompt(n))),
    ...range(1, MAX_POND).map((n) => line('물웅덩이', `pond-hint-${n}`, S.pondHintStart(n))),
    line('물웅덩이', 'pond-empty', S.POND_EMPTY),
    ...range(1, MAX_POND - 1).map((k) => line('물웅덩이', `pond-few-${k}`, S.pondTooFew(k))),
    ...range(2, MAX_HIPPOS).map((k) => line('물웅덩이', `pond-many-${k}`, S.pondTooMany(k))),

    // 반짝 무늬 보기
    line('반짝 무늬', 'spots-look', S.SPOTS_LOOK),
    line('반짝 무늬', 'spots-q', S.SPOTS_PROMPT),
    line('반짝 무늬', 'spots-hint', S.SPOTS_HINT_START),
    ...range(1, MAX_SPOTS).map((n) => line('반짝 무늬', `spots-hint-${n}`, S.spotsHintEnd(n))),

    // 동물 이름·스티커
    ...[...SAVANNA.animals, ...(SPECIAL_IS_VILLAGE_ANIMAL ? [] : [SPECIAL])].map((a) => line('동물·스티커', `name-${a.key}`, a.name)),
    ...SAVANNA.animals.flatMap((a) => [
      line('동물·스티커', `sticker-${a.key}`, S.stickerLine(a.name, true)),
      line('동물·스티커', `sticker-again-${a.key}`, S.stickerLine(a.name, false)),
      line('동물·스티커', `sticker-${a.key}-open-forest`, S.stickerLine(a.name, true, '숲속 마을')),
      line('동물·스티커', `sticker-again-${a.key}-open-forest`, S.stickerLine(a.name, false, '숲속 마을')),
    ]),
    // 파일 이름에 친구 key를 넣어, 친구가 바뀌면 예전 녹음이 재생되지 않게 한다
    line('동물·스티커', `special-savanna-${SPECIAL.key}`, S.specialLine(SAVANNA.special.from, SPECIAL.name)),
    ...range(0, SAVANNA.animals.length + 1).map((n) => line('동물·스티커', `book-${n}`, S.bookCount(n))),
    line('동물·스티커', 'not-met', S.NOT_MET),

    // 시간·잠금
    line('시간·잠금', 'warn-1min', S.WARN_TEXT),
    ...MISSIONS.map((m, i) => line('시간·잠금', `lock-${i + 1}`, S.lockLine(m))),
    line('시간·잠금', 'unlock', S.UNLOCK_TEXT),

    // 숲속·바닷가·공룡·농장 마을 (새 묶음)
    ...villageVoiceLines(),
  ];
}

export const VOICE_LINES = Object.freeze(build().map(Object.freeze));
const ID_BY_TEXT = new Map(VOICE_LINES.map((l) => [l.text, l.id]));

/** 문장 → 녹음 파일 이름 (목록에 없으면 null) */
export const voiceIdOf = (text) => ID_BY_TEXT.get(text) ?? null;
