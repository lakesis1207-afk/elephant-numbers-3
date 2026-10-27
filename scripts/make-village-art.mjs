// 숲속·바다·극지·공룡·농장 마을 그림 만들기 (npm run art:villages)
//  - 소품(풍선, 도토리, 물고기 …): 지금 그림체(굵은 외곽선, 둥근 모양)에 맞춘 SVG
//  - 마을 배경은 그린 그림(webp)을 쓰므로 여기서 만들지 않는다
//  - 아직 그림이 없는 동물: 자리 표시용 그림(동그라미 + 그림 문자 + 이름). 진짜 그림이 오면 webp로 바꾼다.
// 이미 있는 파일도 다시 쓴다. 직접 그린 그림으로 바꾼 파일은 아래 목록에서 빼 주세요.
import { writeFileSync, mkdirSync } from 'node:fs';
import { PROPS } from './art/props.mjs';
import { PLACEHOLDERS, placeholderSvg } from './art/placeholders.mjs';

const dir = (name) => {
  const url = new URL(`../public/images/${name}/`, import.meta.url);
  mkdirSync(url, { recursive: true });
  return url;
};

const write = (folder, files) => {
  const base = dir(folder);
  Object.entries(files).forEach(([name, svg]) => writeFileSync(new URL(`${name}.svg`, base), `${svg.trim()}\n`));
  return Object.keys(files).length;
};

const props = write('props', PROPS);
const characters = write('characters', Object.fromEntries(Object.entries(PLACEHOLDERS).map(([k, v]) => [k, placeholderSvg(v)])));
console.log(`[art] 소품 ${props}개, 자리 표시 동물 ${characters}개를 만들었어요.`);
