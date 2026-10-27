// 게임을 끝냈을 때 보상 계산 (화면과 상관없음): 별 표시, 스티커, 다음 마을 열기, 특별 친구
import { freezeProgress } from '../storage/progress.js';
import { pickOne } from '@공통/games/logic.js';
import { nextVillage } from '../villages/index.js';

/**
 * @param village 마을 정보 (villages/savanna.js 같은 detail)
 * @returns { progress, sticker: {key,name}, isNew, opened: 마을 key | null, special: 특별 친구 등장 장면을 보여 줄지 }
 * 등장 장면을 본 기록(specialSeen)은 보상 화면이 실제로 보여 준 뒤 저장한다.
 */
export function finishGame(progress, village, gameKey, rnd = Math.random) {
  if (!village.games.some((g) => g.key === gameKey)) throw new Error(`[rewards] 없는 게임입니다: ${gameKey}`);

  const done = { ...progress.done, [gameKey]: true };

  // 이 마을 동물 중 아직 없는 동물부터. 다 모았으면 아무 동물이나 "또" 준다.
  const missing = village.animals.filter((a) => !progress.stickers.includes(a.key));
  const { key, name } = pickOne(missing.length ? missing : village.animals, rnd);
  const isNew = missing.length > 0;
  const stickers = isNew ? [...progress.stickers, key] : progress.stickers;

  const next = nextVillage(village.key);
  const allDone = village.games.every((g) => done[g.key]);
  const opened = next && allDone && !progress[next.openFlag] ? next.key : null;

  // 특별 친구는 그 마을에 있을 때만 (지금은 사바나의 부엉이)
  const gotAll = Boolean(village.special) && village.animals.every((a) => stickers.includes(a.key));
  const special = gotAll && !progress.specialSeen;

  return {
    progress: freezeProgress({
      ...progress,
      done,
      stickers,
      ...(opened ? { [next.openFlag]: true } : {}),
      special: progress.special || gotAll,
    }),
    sticker: { key, name },
    isNew,
    opened,
    special,
  };
}
