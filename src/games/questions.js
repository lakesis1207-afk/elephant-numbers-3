// 문제 만들기 (화면과 상관없음). 그림 이름(art.js)과 수만 돌려주고, 그리는 일은 screens/views.js가 한다.
// 문제 모양: { n, prompt, choices: [{ right, label, art, ... }], 게임별 추가 값 }
// 세어 주기는 보기 없이 과일을 바구니에 담는다 (fruit, pile).
import { ADJ, pickNumber, pickOne, randInt, shuffle } from './logic.js';

/** 난이도 단계별 수 범위: 1~3 → 1~5 → 1~10 */
export const LEVELS = Object.freeze([[1, 3], [1, 5], [1, 10]]);

export const FRUITS = Object.freeze(['사과', '바나나', '딸기']);
export const SHAPES = Object.freeze(['동그라미', '네모', '세모']);
export const POSITIONS = Object.freeze(['위', '아래', '안', '밖']);
const FRUIT_ART = Object.freeze({ 사과: 'fruit-apple', 바나나: 'fruit-banana', 딸기: 'fruit-strawberry' });
const SHAPE_ART = Object.freeze({ 동그라미: 'shape-circle', 네모: 'shape-square', 세모: 'shape-triangle' });
const POSITION_KEY = Object.freeze({ 위: 'up', 아래: 'down', 안: 'in', 밖: 'out' });
const BEADS = Object.freeze([['bead-a', '빨간 구슬'], ['bead-b', '파란 구슬']]);
const BIG_ANIMALS = Object.freeze(['hippo', 'rhino', 'giraffe', 'polarbear']);
const SMALL_ANIMALS = Object.freeze(['squirrel', 'chick', 'hedgehog', 'rabbit']);
const MAX_PILE = 10;
const PILE_EXTRA = 3; // 세어 주기: 필요한 수보다 몇 개 더 놓는다 (전부 담기만 하면 되지 않게)
const SUBITIZE_MAX = 3;
const SAMECOUNT_MAX = 5;

/** 문제 안내 대사. 음성 목록(audio/voiceLines.js)도 여기서 만든다. */
export const PROMPTS = Object.freeze({
  count: (fruit, n) => `${fruit} ${ADJ[n]} 개 줄래?`,
  more: '어느 쪽이 더 많을까?',
  fewer: '어느 쪽이 더 적을까?',
  shape: (shape) => `${shape}를 찾아 줘`,
  big: '큰 동물을 찾아 줘',
  small: '작은 동물을 찾아 줘',
  match: '같은 그림을 찾아 줘',
  subitize: '점이 몇 개였지?',
  pattern: '다음에 올 구슬은 뭘까?',
  position: (where) => `상자 ${where}에 거북이가 있는 곳을 눌러 줘`,
  samecount: '조개가 똑같이 있는 걸 찾아 줘',
});

/** 정답 하나와 오답 하나를 섞은 보기 2개 */
const two = (right, wrong, rnd) => shuffle([{ ...right, right: true }, { ...wrong, right: false }], rnd);

/** exclude가 아닌 lo~hi 수 하나 (범위에 수가 하나뿐이면 그대로) */
function otherThan(exclude, lo, hi, rnd) {
  if (hi <= lo) return lo;
  let v = randInt(lo, hi - 1, rnd);
  if (v >= exclude) v += 1;
  return v;
}

/** 같은 그림 여러 개 묶음 보기 */
const group = (art, count) => ({ label: `${count}개`, art, count });

const MAKERS = {
  count({ range: [lo, hi], last, rnd }) {
    const n = pickNumber(lo, hi, last, rnd);
    const fruit = pickOne(FRUITS, rnd);
    return { n, prompt: PROMPTS.count(fruit, n), fruit: FRUIT_ART[fruit], pile: Math.min(MAX_PILE, n + PILE_EXTRA), choices: [] };
  },
  more({ range: [lo, hi], last, rnd }) {
    const a = pickNumber(Math.max(lo, 1), Math.max(hi, 2), last, rnd);
    const b = otherThan(a, 1, Math.max(hi, 2), rnd);
    const wantMore = rnd() < 0.5;
    const art = FRUIT_ART[pickOne(FRUITS, rnd)];
    const [right, wrong] = wantMore ? [Math.max(a, b), Math.min(a, b)] : [Math.min(a, b), Math.max(a, b)];
    return { n: a, prompt: wantMore ? PROMPTS.more : PROMPTS.fewer, choices: two(group(art, right), group(art, wrong), rnd) };
  },
  shape({ rnd }) {
    const right = pickOne(SHAPES, rnd);
    const wrong = pickOne(SHAPES.filter((s) => s !== right), rnd);
    const choice = (s) => ({ label: s, art: SHAPE_ART[s] });
    return { n: SHAPES.indexOf(right) + 1, prompt: PROMPTS.shape(right), target: SHAPE_ART[right], choices: two(choice(right), choice(wrong), rnd) };
  },
  size({ rnd }) {
    const wantBig = rnd() < 0.5;
    const big = { label: '큰 동물', art: pickOne(BIG_ANIMALS, rnd), big: true };
    const small = { label: '작은 동물', art: pickOne(SMALL_ANIMALS, rnd), big: false };
    return { n: wantBig ? 1 : 2, prompt: wantBig ? PROMPTS.big : PROMPTS.small, choices: wantBig ? two(big, small, rnd) : two(small, big, rnd) };
  },
  match({ rnd }) {
    const target = pickOne(FRUITS, rnd);
    const wrong = pickOne(FRUITS.filter((f) => f !== target), rnd);
    const choice = (f) => ({ label: f, art: FRUIT_ART[f] });
    return { n: FRUITS.indexOf(target) + 1, prompt: PROMPTS.match, target: FRUIT_ART[target], choices: two(choice(target), choice(wrong), rnd) };
  },
  subitize({ range: [, hi], last, rnd }) {
    const n = pickNumber(1, Math.min(hi, SUBITIZE_MAX), last, rnd);
    return { n, prompt: PROMPTS.subitize, count: n, choices: two(group('dot', n), group('dot', otherThan(n, 1, SUBITIZE_MAX, rnd)), rnd) };
  },
  pattern({ rnd }) {
    const [a, b] = rnd() < 0.5 ? BEADS : [BEADS[1], BEADS[0]];
    const bead = ([art, label]) => ({ art, label });
    return { n: a === BEADS[0] ? 1 : 2, prompt: PROMPTS.pattern, sequence: [a, b, a, b, a].map(([art]) => art), choices: two(bead(b), bead(a), rnd) };
  },
  position({ rnd }) {
    const pairs = [POSITIONS.slice(0, 2), POSITIONS.slice(2)];
    const [right, wrong] = shuffle(pickOne(pairs, rnd), rnd);
    const choice = (w) => ({ label: w, art: 'box-open', where: POSITION_KEY[w] });
    return { n: POSITIONS.indexOf(right) + 1, prompt: PROMPTS.position(right), choices: two(choice(right), choice(wrong), rnd) };
  },
  samecount({ range: [lo, hi], last, rnd }) {
    const n = pickNumber(lo, Math.min(hi, SAMECOUNT_MAX), last, rnd);
    return { n, prompt: PROMPTS.samecount, count: n, choices: two(group('shell', n), group('shell', otherThan(n, 1, SAMECOUNT_MAX, rnd)), rnd) };
  },
};

export const HINTS = Object.freeze({ count: '같이 하나씩 세어 보자', subitize: '점을 다시 잘 보자!', look: '여기를 잘 보자!' });
const HINT_LINES = { count: HINTS.count, samecount: HINTS.count, subitize: HINTS.subitize };

/** 힌트 대사: 세는 게임만 "세어 보자", 나머지는 "잘 봐 봐" (한눈에 알기는 세지 않는 게임) */
export const hintFor = (gameKey) => HINT_LINES[gameKey] ?? HINTS.look;

export const GAME_KEYS = Object.freeze(Object.keys(MAKERS));

/** 게임 하나의 문제 만들기. range는 난이도 단계의 수 범위, last는 바로 앞 문제의 n */
export function makeQuestion(gameKey, { range = LEVELS[0], last = 0, rnd = Math.random } = {}) {
  const make = MAKERS[gameKey];
  if (!make) throw new Error(`[questions] 모르는 게임입니다: ${gameKey}`);
  return make({ range, last, rnd });
}
