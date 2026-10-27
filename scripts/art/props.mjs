// 게임 소품 그림 (SVG 글자). 그림체: 굵은 갈색 외곽선(#3A2A1C), 둥근 모양, 일부는 얼굴.
const INK = '#3A2A1C';
const W = 'stroke-width';

// 귀여운 얼굴 (가운데 0,0 기준)
const face = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
<ellipse cx="-8" cy="0" rx="3.6" ry="4.6" fill="${INK}"/><ellipse cx="8" cy="0" rx="3.6" ry="4.6" fill="${INK}"/>
<circle cx="-6.8" cy="-1.6" r="1.4" fill="#fff"/><circle cx="9.2" cy="-1.6" r="1.4" fill="#fff"/>
<ellipse cx="-14" cy="6" rx="4" ry="2.4" fill="#FF8FA3" opacity=".8"/><ellipse cx="14" cy="6" rx="4" ry="2.4" fill="#FF8FA3" opacity=".8"/>
<path d="M-4 5 Q0 9 4 5" fill="none" stroke="${INK}" ${W}="2.2" stroke-linecap="round"/></g>`;

const balloon = (fill) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140">
<path d="M50 104 Q46 120 54 138" fill="none" stroke="${INK}" ${W}="2.5" stroke-linecap="round"/>
<path d="M50 6 C76 6 92 28 90 52 C88 78 68 100 50 102 C32 100 12 78 10 52 C8 28 24 6 50 6Z" fill="${fill}" stroke="${INK}" ${W}="4.5" stroke-linejoin="round"/>
<path d="M44 101 L50 110 L56 101Z" fill="${fill}" stroke="${INK}" ${W}="3.5" stroke-linejoin="round"/>
<ellipse cx="30" cy="34" rx="7" ry="13" fill="#fff" opacity=".5" transform="rotate(25 30 34)"/></svg>`;

export const PROPS = {
  'balloon-red': balloon('#FF6B5E'),
  'balloon-blue': balloon('#5BB8F0'),
  'balloon-yellow': balloon('#FFD24A'),
  'balloon-green': balloon('#6CC04A'),

  tree: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 130">
<path d="M42 78 L40 124 L60 124 L58 78Z" fill="#A8652A" stroke="${INK}" ${W}="4.5" stroke-linejoin="round"/>
<path d="M50 6 C66 6 74 18 72 26 C88 26 96 44 88 56 C96 68 86 86 70 84 C62 96 38 96 30 84 C14 86 4 68 12 56 C4 44 12 26 28 26 C26 18 34 6 50 6Z" fill="#5DBB63" stroke="${INK}" ${W}="4.5" stroke-linejoin="round"/>
<circle cx="34" cy="42" r="5" fill="#fff" opacity=".35"/><circle cx="62" cy="62" r="4" fill="#3F9A47" opacity=".6"/><circle cx="42" cy="66" r="3.5" fill="#3F9A47" opacity=".6"/></svg>`,

  acorn: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<path d="M22 46 C22 74 36 94 50 94 C64 94 78 74 78 46Z" fill="#D99A5B" stroke="${INK}" ${W}="4.5" stroke-linejoin="round"/>
<path d="M14 44 C14 24 32 16 50 16 C68 16 86 24 86 44 C86 50 80 52 50 52 C20 52 14 50 14 44Z" fill="#8B5A2B" stroke="${INK}" ${W}="4.5" stroke-linejoin="round"/>
<path d="M26 30 L40 44 M40 24 L56 44 M56 22 L72 42 M70 28 L80 38" stroke="#6B421E" ${W}="2.5" stroke-linecap="round"/>
<path d="M50 16 Q52 8 58 4" fill="none" stroke="${INK}" ${W}="4.5" stroke-linecap="round"/>
${face(50, 70, 0.9)}</svg>`,

  fish: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80">
<path d="M88 40 L114 16 L112 64Z" fill="#FFB347" stroke="${INK}" ${W}="4.5" stroke-linejoin="round"/>
<ellipse cx="54" cy="40" rx="44" ry="30" fill="#FF9F43" stroke="${INK}" ${W}="4.5"/>
<path d="M50 12 Q62 2 74 14" fill="#FFB347" stroke="${INK}" ${W}="3.5" stroke-linejoin="round"/>
<path d="M58 30 Q66 40 58 50" fill="none" stroke="#E07B1F" ${W}="3" stroke-linecap="round"/>
<circle cx="30" cy="34" r="6" fill="${INK}"/><circle cx="32" cy="32" r="2" fill="#fff"/>
<ellipse cx="26" cy="48" rx="5" ry="3" fill="#FF8FA3" opacity=".8"/>
<path d="M14 44 Q18 48 22 45" fill="none" stroke="${INK}" ${W}="2.4" stroke-linecap="round"/></svg>`,

  shell: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<path d="M50 90 C30 90 8 70 8 44 C8 22 28 10 50 10 C72 10 92 22 92 44 C92 70 70 90 50 90Z" fill="#FFB3C1" stroke="${INK}" ${W}="4.5" stroke-linejoin="round"/>
<path d="M50 88 L50 14 M50 88 L28 18 M50 88 L72 18 M50 88 L14 34 M50 88 L86 34" stroke="#E88AA0" ${W}="3" stroke-linecap="round"/>
<path d="M36 90 L42 98 L58 98 L64 90Z" fill="#FFB3C1" stroke="${INK}" ${W}="4" stroke-linejoin="round"/>
<ellipse cx="32" cy="32" rx="6" ry="9" fill="#fff" opacity=".5" transform="rotate(30 32 32)"/></svg>`,

  star: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<path d="M50 6 C56 6 58 30 62 34 C66 38 92 34 94 40 C96 46 74 58 72 64 C70 70 84 92 78 96 C72 100 56 80 50 80 C44 80 28 100 22 96 C16 92 30 70 28 64 C26 58 4 46 6 40 C8 34 34 38 38 34 C42 30 44 6 50 6Z" fill="#FFB347" stroke="${INK}" ${W}="4.5" stroke-linejoin="round"/>
<circle cx="50" cy="24" r="2.5" fill="#E07B1F"/><circle cx="78" cy="44" r="2.5" fill="#E07B1F"/><circle cx="22" cy="44" r="2.5" fill="#E07B1F"/>
<circle cx="68" cy="78" r="2.5" fill="#E07B1F"/><circle cx="32" cy="78" r="2.5" fill="#E07B1F"/>
${face(50, 52, 0.85)}</svg>`,

  net: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<defs><clipPath id="c"><circle cx="50" cy="50" r="40"/></clipPath></defs>
<circle cx="50" cy="50" r="40" fill="#E3F6FD"/>
<g clip-path="url(#c)" stroke="#7FB8D4" ${W}="2.5"><path d="M0 10 L90 100 M0 30 L70 100 M0 50 L50 100 M10 0 L100 90 M30 0 L100 70 M50 0 L100 50 M0 70 L30 100 M70 0 L100 30"/>
<path d="M100 10 L10 100 M100 30 L30 100 M100 50 L50 100 M90 0 L0 90 M70 0 L0 70 M50 0 L0 50 M100 70 L70 100 M30 0 L0 30"/></g>
<circle cx="50" cy="50" r="40" fill="none" stroke="${INK}" ${W}="5"/></svg>`,

  board: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<rect x="6" y="6" width="88" height="88" rx="12" fill="#FFFCF4" stroke="${INK}" ${W}="4.5"/>
<path d="M35 8 V92 M65 8 V92 M8 35 H92 M8 65 H92" stroke="#D8C8A8" ${W}="3"/>
<rect x="37" y="37" width="26" height="26" rx="5" fill="#FFD24A"/>
<g font-family="sans-serif" font-size="18" font-weight="700" fill="${INK}" text-anchor="middle">
<text x="21" y="27">1</text><text x="50" y="27">2</text><text x="79" y="27">3</text><text x="21" y="56">4</text><text x="50" y="56">5</text>
<text x="79" y="56">6</text><text x="21" y="85">7</text><text x="50" y="85">8</text><text x="79" y="85">9</text></g></svg>`,

  footprint: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 130">
<path d="M50 54 C72 54 82 76 80 96 C78 118 64 126 50 126 C36 126 22 118 20 96 C18 76 28 54 50 54Z" fill="#6FB66F" stroke="${INK}" ${W}="4.5"/>
<path d="M22 60 C10 46 8 28 16 20 C24 14 34 30 34 50Z" fill="#6FB66F" stroke="${INK}" ${W}="4.5" stroke-linejoin="round"/>
<path d="M78 60 C90 46 92 28 84 20 C76 14 66 30 66 50Z" fill="#6FB66F" stroke="${INK}" ${W}="4.5" stroke-linejoin="round"/>
<path d="M50 50 C40 36 40 10 50 4 C60 10 60 36 50 50Z" fill="#6FB66F" stroke="${INK}" ${W}="4.5" stroke-linejoin="round"/></svg>`,

  egg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 100">
<path d="M40 4 C62 4 76 40 76 62 C76 84 60 96 40 96 C20 96 4 84 4 62 C4 40 18 4 40 4Z" fill="#FFF3D6" stroke="${INK}" ${W}="4.5"/>
<circle cx="28" cy="40" r="5" fill="#8FD18F"/><circle cx="52" cy="30" r="4" fill="#8FD18F"/><circle cx="56" cy="64" r="6" fill="#8FD18F"/><circle cx="24" cy="72" r="4" fill="#8FD18F"/>
<ellipse cx="26" cy="24" rx="5" ry="9" fill="#fff" opacity=".8" transform="rotate(25 26 24)"/></svg>`,

  nest: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 90">
<path d="M8 30 C8 70 40 86 80 86 C120 86 152 70 152 30Z" fill="#B07A43" stroke="${INK}" ${W}="4.5" stroke-linejoin="round"/>
<path d="M14 40 Q80 60 146 40 M20 54 Q80 74 140 54 M34 68 Q80 82 126 68" fill="none" stroke="#7E5229" ${W}="3.5" stroke-linecap="round"/>
<path d="M4 30 Q80 14 156 30" fill="none" stroke="${INK}" ${W}="6" stroke-linecap="round"/>
<path d="M10 28 l-8 -8 M150 28 l8 -8 M40 22 l-4 -10 M120 22 l4 -10" stroke="#7E5229" ${W}="3.5" stroke-linecap="round"/></svg>`,

  basket: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 110">
<path d="M26 46 C26 6 114 6 114 46" fill="none" stroke="${INK}" ${W}="9" stroke-linecap="round"/>
<path d="M26 46 C26 6 114 6 114 46" fill="none" stroke="#D99A5B" ${W}="4" stroke-linecap="round"/>
<path d="M8 44 H132 L118 102 H22Z" fill="#D99A5B" stroke="${INK}" ${W}="4.5" stroke-linejoin="round"/>
<path d="M14 62 H126 M18 80 H122 M40 46 L44 100 M70 46 V100 M100 46 L96 100" stroke="#A8652A" ${W}="3.5" stroke-linecap="round"/>
<rect x="4" y="38" width="132" height="12" rx="6" fill="#C98D4E" stroke="${INK}" ${W}="4"/></svg>`,

  corn: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 110">
<path d="M35 6 C52 6 58 30 58 56 C58 84 48 98 35 98 C22 98 12 84 12 56 C12 30 18 6 35 6Z" fill="#FFD24A" stroke="${INK}" ${W}="4"/>
<g fill="#F2B21B"><circle cx="27" cy="26" r="4"/><circle cx="43" cy="26" r="4"/><circle cx="35" cy="38" r="4"/><circle cx="23" cy="44" r="4"/><circle cx="47" cy="44" r="4"/>
<circle cx="29" cy="56" r="4"/><circle cx="43" cy="58" r="4"/><circle cx="25" cy="70" r="4"/><circle cx="45" cy="72" r="4"/><circle cx="35" cy="82" r="4"/></g>
<path d="M35 104 C20 100 6 80 6 60 C14 70 22 80 33 84Z" fill="#6CC04A" stroke="${INK}" ${W}="3.5" stroke-linejoin="round"/>
<path d="M35 104 C50 100 64 80 64 60 C56 70 48 80 37 84Z" fill="#5DBB63" stroke="${INK}" ${W}="3.5" stroke-linejoin="round"/></svg>`,
};
