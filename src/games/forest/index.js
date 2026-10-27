// 숲속 마을 게임 3종: 짝짓기(물웅덩이 채우기), 풍선 불기, 선 긋기(곡선) (key는 villages/forest.js의 games[].key와 같다)
import { pondGame } from './pond.js';
import { blowGame } from './blow.js';
import { curvyGame } from '../line/index.js';

export const FOREST_GAMES = Object.freeze({ pond: pondGame, blow: blowGame, curvy: curvyGame });
