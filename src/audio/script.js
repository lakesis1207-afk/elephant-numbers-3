// 앱이 하는 말(대사) 모음. 화면은 여기 있는 문장만 쓰고, 음성 목록(voiceLines.js)도 여기서 만든다.
// 문장을 바꾸면 음성 목록과 녹음 파일도 같이 바꿔야 한다 (npm run voice:list 로 목록 다시 만들기).
import { ADJ } from '@공통/games/logic.js';
import { withTopic, withSubject, withObject } from '@공통/app/korean.js';
import { nativeAdj } from '@공통/games/numbers.js';

// 시작·지도·마을
export const GREETING = '안녕! 나는 코끼리야. 내 친구들을 도와줄래? 사바나 마을을 눌러 봐!';
export const MAP_WORD = '지도';
/** 잠긴 마을: 바로 앞 마을을 먼저 끝내라고 알려 준다 */
export const lockedVillage = (name, prevName = '사바나 마을') =>
  `${withTopic(name)} 아직 잠겨 있어. ${withObject(prevName)} 먼저 끝내면 열려!`;
export const soonVillage = (name) => `${withTopic(name)} 곧 만나요!`;

// 과일 세기
export const fruitPrompt = (name, particle) => `파티에 쓸 ${name}${particle} 몇 개일까? 하나씩 눌러서 세어 봐!`;
export const FRUIT_HINT_START = '코끼리랑 같이 세어 보자!';
export const fruitHintEnd = (n) => `모두 ${ADJ[n]} 개야! 숫자를 골라 봐.`;

// 물웅덩이 채우기
export const pondPrompt = (n) => `하마 ${ADJ[n]} 마리를 물웅덩이에 넣어 줘! 다 넣으면 초록 동그라미를 눌러!`;
export const pondHintStart = (n) => `하마 ${ADJ[n]} 마리! 물웅덩이 속 하마를 같이 세어 보자.`;
export const POND_EMPTY = '물웅덩이가 비었어! 하마를 넣어 줘.';
export const pondTooFew = (k) => `${ADJ[k]} 마리야. 하마가 더 필요해!`;
export const pondTooMany = (k) => `${ADJ[k]} 마리야. 하마가 너무 많아!`;

// 반짝 무늬 보기
export const SPOTS_LOOK = '잘 봐!';
export const SPOTS_PROMPT = '기린 무늬가 몇 개였을까? 다시 보고 싶으면 덤불을 눌러!';
export const SPOTS_HINT_START = '무늬를 같이 세어 보자!';
export const spotsHintEnd = (n) => `무늬는 ${ADJ[n]} 개! 숫자를 골라 봐.`;

// 보상·스티커북
export function stickerLine(name, isNew, openedVillageName = null) {
  const got = isNew ? `${name} 스티커를 받았어!` : `${name} 스티커를 또 받았어!`;
  return openedVillageName ? `${got} ${withSubject(openedVillageName)} 열렸어!` : got;
}
export const specialLine = (villageName, friendName) => `${villageName} 친구들을 다 모았어! 특별 친구 ${withSubject(friendName)} 왔어!`;
export const bookCount = (n) => (n === 0 ? '아직 스티커가 없어. 게임을 하면 받을 수 있어!' : `스티커를 ${nativeAdj(n)} 개 모았어!`);
export const NOT_MET = '아직 못 만난 친구야!';

// 놀이 시간·잠금
export const WARN_TEXT = '1분 남았어! 이번 놀이까지만 하자.';
export const LOCK_TEXT = '코끼리가 졸려요. 내일 또 놀자!';
export const lockLine = (mission) => `${LOCK_TEXT} ${mission}`;
export const UNLOCK_TEXT = '다시 놀자!';
