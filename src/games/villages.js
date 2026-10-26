// 마을 3개 × 게임 3개 = 9개. 그림 이름은 art.js 목록에 있는 것을 쓴다.
// icon: 마을 화면의 게임 버튼 그림, sticker: 게임을 끝까지 하면 받는 동물 스티커

export const VILLAGES = Object.freeze([
  {
    key: 'farm',
    name: '농장 마을',
    background: 'bg-farm',
    intro: '농장 마을이야! 친구들의 부탁을 들어줄래?',
    animals: ['chick', 'rabbit', 'pig'],
    games: [
      { key: 'count', name: '세어 주기', icon: 'fruit-apple', sticker: 'chick' },
      { key: 'more', name: '많다 적다', icon: 'basket', sticker: 'rabbit' },
      { key: 'shape', name: '모양 찾기', icon: 'shape-triangle', sticker: 'pig' },
    ],
  },
  {
    key: 'forest',
    name: '숲속 마을',
    background: 'bg-forest',
    intro: '숲속 마을이야! 큰 동물과 작은 동물을 찾아볼까?',
    animals: ['squirrel', 'panda', 'owl'],
    games: [
      { key: 'size', name: '크다 작다', icon: 'hippo', sticker: 'squirrel' },
      { key: 'match', name: '짝 맞추기', icon: 'fruit-strawberry', sticker: 'panda' },
      { key: 'subitize', name: '한눈에 알기', icon: 'dot', sticker: 'owl' },
    ],
  },
  {
    key: 'sea',
    name: '바닷가 마을',
    background: 'bg-beach',
    intro: '바닷가 마을이야! 조개와 물고기가 기다려!',
    animals: ['fish', 'crab', 'turtle'],
    games: [
      { key: 'pattern', name: '패턴 이어가기', icon: 'bead-a', sticker: 'fish' },
      { key: 'position', name: '위 아래 안 밖', icon: 'box-open', sticker: 'crab' },
      { key: 'samecount', name: '같은 수 찾기', icon: 'shell', sticker: 'turtle' },
    ],
  },
]);

/** 동물 이름 (스티커 대사, 스티커북) */
export const ANIMAL_NAMES = Object.freeze({
  chick: '병아리', rabbit: '토끼', pig: '돼지', squirrel: '다람쥐', panda: '판다', owl: '부엉이', fish: '물고기', crab: '게', turtle: '거북이',
});

export const ALL_GAMES = Object.freeze(VILLAGES.flatMap((v) => v.games.map((g) => ({ ...g, village: v.key }))));
export const villageOf = (key) => VILLAGES.find((v) => v.key === key);
export const gameOf = (key) => ALL_GAMES.find((g) => g.key === key);
export const villageDone = (village, done) => village.games.every((g) => done[g.key]);
