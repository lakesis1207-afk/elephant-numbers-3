// 아직 그림이 없는 동물의 자리 표시용 그림: 마을 색 동그라미 + 그림 문자(이모지) + 이름.
// 진짜 그림(webp)이 오면 public/images/characters/에 넣고 src/art/registry.js의 그려 둔 목록으로 옮긴다.
const INK = '#3A2A1C';
const FOREST = '#CFE8B4';
const SEA = '#B9E3F4';
const DINO = '#F6D9A8';
const FARM = '#FFE7B8';

export const PLACEHOLDERS = {
  squirrel: { emoji: '🐿️', name: '다람쥐', color: FOREST },
  panda: { emoji: '🐼', name: '판다', color: FOREST },
  fox: { emoji: '🦊', name: '여우', color: FOREST },
  owl: { emoji: '🦉', name: '부엉이', color: FOREST },
  hedgehog: { emoji: '🦔', name: '고슴도치', color: FOREST },
  polarbear: { emoji: '🐻‍❄️', name: '북극곰', color: SEA },
  walrus: { emoji: '🦭', name: '바다코끼리', color: SEA },
  whale: { emoji: '🐳', name: '고래', color: SEA },
  turtle: { emoji: '🐢', name: '거북이', color: SEA },
  octopus: { emoji: '🐙', name: '문어', color: SEA },
  dolphin: { emoji: '🐬', name: '돌고래', color: SEA },
  starfish: { emoji: '⭐', name: '불가사리', color: SEA },
  seaotter: { emoji: '🦦', name: '해달', color: SEA },
  crab: { emoji: '🦀', name: '게', color: SEA },
  brachio: { emoji: '🦕', name: '브라키오', color: DINO },
  stego: { emoji: '🦎', name: '스테고', color: DINO },
  ptera: { emoji: '🦅', name: '프테라노돈', color: DINO },
  dog: { emoji: '🐶', name: '강아지', color: FARM },
  cat: { emoji: '🐱', name: '고양이', color: FARM },
  chick: { emoji: '🐤', name: '병아리', color: FARM },
  pig: { emoji: '🐷', name: '돼지', color: FARM },
};

export const placeholderSvg = ({ emoji, name, color }) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
<circle cx="100" cy="96" r="88" fill="${color}" stroke="${INK}" stroke-width="7"/>
<text x="100" y="128" font-size="104" text-anchor="middle" font-family="'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif">${emoji}</text>
<rect x="44" y="160" width="112" height="32" rx="16" fill="#FFFCF4" stroke="${INK}" stroke-width="5"/>
<text x="100" y="184" font-size="20" text-anchor="middle" fill="${INK}" font-family="'Apple SD Gothic Neo','Malgun Gothic',sans-serif">${name}</text>
</svg>`;
