// 사바나 마을 게임 3종: 세기, 풍선 터뜨리기, 선 긋기(직선) (key는 villages/savanna.js의 games[].key와 같다)
import { fruitGame } from './fruit.js';
import { balloonGame } from './balloon.js';
import { roadGame } from '../line/index.js';

export const SAVANNA_GAMES = Object.freeze({ fruit: fruitGame, balloon: balloonGame, road: roadGame });
