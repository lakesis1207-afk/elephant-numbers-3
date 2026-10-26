// 게임 화면: 9개 게임이 함께 쓰는 틀. 코끼리 + 부탁하는 친구 + 말풍선(누르면 다시 듣기) + 그림 문제.
// 틀려도 실패 표시는 없고 "다시 해 볼까?"만 말한다. 그림은 views.js가 그린다.
import { h, pic, button } from '../widgets/dom.js';
import { createGameRun, QUESTIONS_PER_GAME } from '../games/engine.js';
import { LEVELS, hintFor, makeQuestion } from '../games/questions.js';
import { villageOf } from '../games/villages.js';
import { NATIVE, wait } from '../games/logic.js';
import { renderQuestion } from './views.js';

const HINT_MS = 900;
const COUNT_DONE_MS = 700; // 세어 주기: 마지막 수를 말한 뒤 정답 처리까지

export const gameScreen = {
  background: (params) => villageOf(params.village).background,
  render(root, app, { village: villageKey, game: gameKey }) {
    const village = villageOf(villageKey);
    const requester = village.animals[village.games.findIndex((g) => g.key === gameKey)];
    app.bar.setBack(() => app.go('village', { village: villageKey }), village.name);
    app.bar.setDots(0, QUESTIONS_PER_GAME);

    const bubble = button('다시 듣기', 'bubble', () => run.replay());
    bubble.append(pic('speaker'));
    const show = h('div', 'show');
    const choices = h('div', `choices ${gameKey}`);
    root.append(pic('elephant', 'guide'), pic(requester, 'requester'), bubble, show, choices);

    let doneTimer = null;
    const fx = {
      say: app.say,
      sfx: app.sfx,
      cheer: () => root.classList.add('cheer'),
      bubble: (text, speak) => {
        bubble.setAttribute('aria-label', text);
        bubble.classList.remove('talk');
        void bubble.offsetWidth; // 말할 때마다 말풍선이 다시 통통 튀게
        bubble.classList.add('talk');
        if (speak) app.say(text);
      },
    };

    const run = createGameRun({
      levels: LEVELS,
      fx,
      ask({ range, last }) {
        root.classList.remove('cheer');
        const q = makeQuestion(gameKey, { range, last });
        const { hintTarget } = renderQuestion(gameKey, q, {
          show,
          choices,
          choose: (c) => run.answer(c.right),
          // 세어 주기: 하나 담을 때마다 같이 센다 ("하나, 둘, 셋…")
          fill: (count) => {
            app.say(NATIVE[count]);
            if (count === q.n) doneTimer = setTimeout(() => run.answer(true), COUNT_DONE_MS);
          },
        });
        const hint = async () => {
          hintTarget.classList.add('hint');
          app.say(hintFor(gameKey));
          await wait(HINT_MS);
        };
        return { n: q.n, prompt: q.prompt, hint };
      },
      onProgress: (done, total) => app.bar.setDots(done, total),
      onFinish: () => app.finishGame(villageKey, gameKey),
      shouldPause: app.isTimeOver,
      onPause: () => app.lock(),
    });

    root.addEventListener('pointerdown', run.poke);
    this.stop = () => {
      clearTimeout(doneTimer);
      run.stop();
    };
    run.start();
  },
  leave() {
    this.stop?.();
  },
};
