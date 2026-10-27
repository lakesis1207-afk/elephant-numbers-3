// 아직 준비 중인 마을: 대표 동물 + 지도로 돌아가기
import { art, roundButton } from '@공통/widgets/dom.js';
import { findVillage } from '../villages/index.js';
import { MAP_WORD } from '../audio/script.js';

export const soonScreen = {
  render(root, app, { village }) {
    const v = findVillage(village);
    const back = () => {
      app.sfx.pop();
      app.go('map');
      app.say(MAP_WORD);
    };
    root.append(
      art('character', v.character, { class: v.round ? 'round' : '', alt: v.name }),
      roundButton('map', '지도로 가기', back),
    );
  },
};
