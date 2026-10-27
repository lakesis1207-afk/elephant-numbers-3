// 풍선·많다적다·선 긋기 게임이 하는 말. (과일 세기·물웅덩이·반짝 무늬와 공통 문장은 script.js)
// 문장을 바꾸면 음성 목록도 같이 바뀐다 (npm run voice:list 로 목록 다시 만들기).
import { nativeAdj, sinoWord } from '@공통/games/numbers.js';

// 사바나: 풍선 터뜨리기
export const balloonPrompt = (n) => `숫자 ${sinoWord(n)} 풍선을 터뜨려 줘!`;
export const BALLOON_HINT = '반짝이는 풍선을 잘 봐!';
export const balloonHintEnd = (n) => `이게 숫자 ${sinoWord(n)} 풍선이야! 눌러 봐.`;

// 숲속: 풍선 불기 (1~10). 누를 때 세는 말(하나, 둘 …)은 수 세기 묶음에 이미 있다.
export const blowPrompt = (n) => `숫자 ${sinoWord(n)}! 풍선을 ${nativeAdj(n)} 번 눌러서 키워 봐!`;
export const BLOW_HINT = '풍선을 콕콕 눌러 봐!';

// 바닷가: 많다/적다 (하나씩 짝 짓기)
export const SEA_MORE = '물고기랑 조개 중에 누가 더 많을까? 더 많은 쪽을 눌러 줘!';
export const SEA_FEWER = '물고기랑 조개 중에 누가 더 적을까? 더 적은 쪽을 눌러 줘!';
export const PAIR_HINT = '하나씩 짝을 지어 보자!';
export const PAIR_HINT_MORE = '짝이 없이 남은 쪽이 더 많아!';
export const PAIR_HINT_FEWER = '남는 게 없는 쪽이 더 적어!';

// 선 긋기 (사바나·숲속·바닷가)
export const LINE_ROAD_PROMPT = '초록 점에서 시작해서, 코끼리가 물웅덩이까지 가게 선을 그어 줘!';
export const LINE_CURVY_PROMPT = '초록 점에서 시작해서, 다람쥐가 도토리까지 가게 꼬불꼬불 길을 따라가 봐!';
export const LINE_ZIGZAG_PROMPT = '초록 점에서 시작해서, 게가 조개까지 가게 지그재그 길을 따라가 봐!';
export const LINE_START_HINT = '초록 점을 누르고 시작해 봐!';
export const LINE_IDLE_HINT = '초록 점에서 시작해서 끝까지 따라가 봐!';
