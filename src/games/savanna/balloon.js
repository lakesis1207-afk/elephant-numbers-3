// 풍선 터뜨리기 (사바나, 1~10 숫자 알아보기): "숫자 칠 풍선을 터뜨려 줘!" → 숫자 풍선 3개 중 골라 누른다.
// 힌트: 정답 풍선이 반짝이고 "이게 숫자 칠 풍선이야!"
import { h, art } from '@공통/widgets/dom.js';
import { pickNumber, wait } from '@공통/games/logic.js';
import { pickHandler } from '@공통/games/widgets.js';
import { pickDistinct } from '@공통/games/questions.js';
import { balloonPrompt, BALLOON_HINT, balloonHintEnd } from '../../audio/villageScript.js';
import { BALLOON_COLORS as COLORS, PIECE_COLORS, popBalloon } from '../balloonFx.js';

export const BALLOON_CHOICES = 3; // 만 3세가 고르기 쉽게 풍선은 3개
const HINT_MS = 1600;

export const balloonGame = {
  key: 'balloon',
  background: 'savanna-base',
  levels: [
    [1, 4],
    [1, 7],
    [1, 10],
  ],

  ask(play, { run, bubble, sfx }, { range, last }) {
    const n = pickNumber(range[0], range[1], last);
    const onPick = pickHandler(run, n, () => popBalloon(buttons.find((b) => Number(b.dataset.value) === n), run, sfx));
    const buttons = pickDistinct(n, range[0], range[1], BALLOON_CHOICES).map((v, i) => {
      const color = PIECE_COLORS[i % PIECE_COLORS.length];
      const btn = h(
        'button',
        { class: 'balloon pick', 'data-value': v, 'aria-label': String(v), style: `--i:${i};--c:${color}` },
        // 누르는 자리(버튼)는 그대로 두고 안의 그림만 둥실거린다 (움직이는 걸 누르기 어렵지 않게)
        h('span', { class: 'bfloat' }, art('prop', COLORS[i % COLORS.length]), h('b', {}, String(v))),
      );
      btn.addEventListener('click', () => onPick(v, btn));
      return btn;
    });
    play.replaceChildren(h('div', { class: 'balloonq' }, buttons));

    async function hint() {
      const target = buttons.find((b) => Number(b.dataset.value) === n);
      bubble(BALLOON_HINT, true);
      target.classList.add('hl');
      await wait(HINT_MS);
      if (run.state.stopped) return;
      bubble(balloonHintEnd(n), true);
    }

    return { n, prompt: balloonPrompt(n), hint };
  },
};
