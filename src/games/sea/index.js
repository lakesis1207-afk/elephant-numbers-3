// 바닷가 마을 게임 3종: 많다·적다, 반짝 무늬 보기, 선 긋기(지그재그) (key는 villages/sea.js의 games[].key와 같다)
import { spotsGame } from './spots.js';
import { zigzagGame } from '../line/index.js';
import { makeCompareGame } from '@공통/games/shared/compare.js';
import { SEA_MORE, SEA_FEWER, PAIR_HINT, PAIR_HINT_MORE, PAIR_HINT_FEWER } from '../../audio/villageScript.js';

// 누가 더 많아?: 물고기 줄과 조개 줄 비교. 4번째 문제부터는 "더 적은 쪽"을 묻는다
export const compareGame = makeCompareGame({
  key: 'compare',
  background: 'sea-base',
  levels: [
    [1, 3, 1],
    [1, 4, 1],
    [1, 5, 1],
  ],
  rows: [
    { label: '물고기', item: { kind: 'prop', name: 'fish' } },
    { label: '조개', item: { kind: 'prop', name: 'shell' } },
  ],
  prompts: { more: SEA_MORE, fewer: SEA_FEWER },
  hints: { pair: PAIR_HINT, more: PAIR_HINT_MORE, fewer: PAIR_HINT_FEWER },
});

export const SEA_GAMES = Object.freeze({ compare: compareGame, spots: spotsGame, zigzag: zigzagGame });
