// 게임 밖에서 앱이 하는 말 (게임 문제·힌트는 games/questions.js, 칭찬은 games/logic.js)
// 문장을 바꾸면 녹음 파일도 다시 만들어야 한다 (npm run voice:azure 는 파일이 없는 문장만 만든다).
// 4세 앱과 같은 문장(지도, 잠금, 스티커, 스티커북)은 4세 앱 녹음을 복사해 쓴다.
import { ADJ } from '../games/logic.js';

// 시작·지도
export const GREETING = '안녕! 나는 코끼리야! 노란 버튼을 눌러 줘!';
export const MAP_WORD = '지도';
export const MAP_GUIDE = '가고 싶은 마을을 눌러 봐!';

// 보상·스티커북
export function stickerLine(name, isNew) {
  return isNew ? `${name} 스티커를 받았어!` : `${name} 스티커를 또 받았어!`;
}
export const villageComplete = (name) => `${name}이 완성됐어! 정말 멋지다!`;
export const bookCount = (n) => (n === 0 ? '아직 스티커가 없어. 게임을 하면 받을 수 있어!' : `스티커를 ${ADJ[n]} 개 모았어!`);
export const NOT_MET = '아직 못 만난 친구야!';

// 놀이 시간·잠금 (잠금 문장은 4세 앱과 같다)
export const WARN_TEXT = '하암~ 졸려. 조금 있으면 쉬러 가자!';
export const LOCK_TEXT = '코끼리가 졸려요. 내일 또 놀자!';
export const lockLine = (mission) => `${LOCK_TEXT} ${mission}`;
export const UNLOCK_TEXT = '다시 놀자!';
