// 풍선 불기 계산 (화면을 모르는 순수 함수). 누른 횟수가 정해진 수에 닿으면 풍선이 터진다.
export const BLOW_MAX_SCALE = 2.5; // 터지기 직전 풍선 크기 (처음의 몇 배)

/** 누른 횟수 → 풍선 크기. 정해진 수에서 BLOW_MAX_SCALE, 넘겨 눌러도 더 커지지 않는다 */
export const blowScale = (pressed, n) => 1 + (BLOW_MAX_SCALE - 1) * (Math.min(Math.max(pressed, 0), n) / n);

/** 한 번 더 눌렀을 때의 횟수 (정해진 수에서 멈춘다) */
export const nextPress = (pressed, n) => Math.min(pressed + 1, n);

/** 정해진 수만큼 눌렀는지 (터질 때) */
export const isBlown = (pressed, n) => pressed >= n;
