// 풍선 불기 (숲속, 1~10 세기): 풍선 옆에 숫자를 크게 보여 주고, 그 수만큼 풍선을 누르면 누를 때마다 커지다가 마지막에 펑!
// 틀림이 없다: 정해진 수만큼 누르면 저절로 터진다. 한동안 안 누르면 풍선이 반짝이며 눌러 보라고 알려 준다.
import { h, art } from '@공통/widgets/dom.js';
import { NATIVE, pickNumber } from '@공통/games/logic.js';
import { pickHandler, replayClass } from '@공통/games/widgets.js';
import { blowScale, nextPress, isBlown } from '../blowLogic.js';
import { BALLOON_COLORS, PIECE_COLORS, popBalloon } from '../balloonFx.js';
import { blowPrompt, BLOW_HINT } from '../../audio/villageScript.js';

const IDLE_HINT_MS = 5000; // 이만큼 안 누르면 눌러 보라고 알려 준다

export const blowGame = {
  key: 'blow',
  background: 'forest-base',
  levels: [
    [1, 4],
    [1, 7],
    [1, 10],
  ],

  ask(play, { run, say, bubble, sfx }, { range, last }) {
    const n = pickNumber(range[0], range[1], last);
    const color = n % BALLOON_COLORS.length;
    let pressed = 0;
    let idleTimer = null;

    const slots = Array.from({ length: n }, () => h('i', { class: 'bslot' }));
    const balloon = h(
      'button',
      { class: 'balloon blow', 'data-value': n, 'aria-label': '풍선', style: `--i:0;--c:${PIECE_COLORS[color]};--s:${blowScale(0, n)}` },
      h('span', { class: 'bfloat' }, art('prop', BALLOON_COLORS[color])),
    );
    const onBlown = pickHandler(run, n, () => popBalloon(balloon, run, sfx));

    function armIdle() {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (run.state.stopped || run.state.busy || isBlown(pressed, n)) return;
        balloon.classList.add('hl');
        bubble(BLOW_HINT, true);
      }, IDLE_HINT_MS);
    }

    balloon.addEventListener('click', () => {
      run.poke();
      if (run.state.busy || isBlown(pressed, n)) return;
      clearTimeout(idleTimer);
      balloon.classList.remove('hl');
      pressed = nextPress(pressed, n);
      balloon.style.setProperty('--s', String(blowScale(pressed, n)));
      slots[pressed - 1].classList.add('on');
      replayClass(balloon, 'puff');
      sfx.pop();
      say(NATIVE[pressed]);
      if (isBlown(pressed, n)) onBlown(n, balloon);
      else armIdle();
    });

    play.replaceChildren(
      h(
        'div',
        { class: 'blowq' },
        h('div', { class: 'blowstage' }, h('b', { class: 'blownum' }, String(n)), balloon), // 숫자는 풍선 왼쪽에 크게
        h('div', { class: 'blowpanel' }, h('span', { class: 'bslots' }, slots)),
      ),
    );
    armIdle();

    // 틀리는 일이 없어서 엔진이 힌트를 부르지 않는다. 힌트는 위의 가만있기 안내가 맡는다.
    return { n, prompt: blowPrompt(n), hint: async () => {} };
  },
};
