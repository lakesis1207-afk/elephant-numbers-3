// 그림 목록: 이름 → 파일 위치 (public/images/<종류>/<이름>.webp).
// 배경·과일·소품·도형·버튼은 이미지-완성 폴더, 캐릭터는 4세 앱 그림을 복사해 쓴다.

export const ART = Object.freeze({
  backgrounds: ['bg-savanna', 'bg-farm', 'bg-forest', 'bg-beach', 'bg-night'],
  characters: [
    'elephant', 'chick', 'rabbit', 'pig', 'squirrel', 'panda', 'owl', 'crab', 'turtle', 'fish',
    'hippo', 'rhino', 'giraffe', 'polarbear', 'hedgehog',
  ],
  props: [
    'fruit-apple', 'fruit-banana', 'fruit-strawberry', 'basket', 'acorn', 'tree', 'shell', 'egg',
    'shape-circle', 'shape-square', 'shape-triangle', 'bead-a', 'bead-b', 'dot', 'box-open',
  ],
  ui: ['play', 'check', 'close', 'home', 'lock', 'map', 'settings', 'speaker', 'star'],
});

const BASE = `${import.meta.env?.BASE_URL ?? './'}images/`;
const KIND_OF = new Map(Object.entries(ART).flatMap(([kind, names]) => names.map((n) => [n, kind])));

/** 그림 파일 주소. 목록에 없는 이름이면 바로 오류를 내서 오타를 빨리 찾는다. */
export function artUrl(name) {
  const kind = KIND_OF.get(name);
  if (!kind) throw new Error(`[art] 없는 그림입니다: ${name}`);
  return `${BASE}${kind}/${name}.webp`;
}

export const allArtPaths = () => [...KIND_OF].map(([name, kind]) => `${kind}/${name}.webp`);
