// 앱 아이콘 만들기: 코끼리 그림을 둥근 하늘색 바탕에 올려 PNG로 저장한다. (npm run icons)
// 코끼리 그림(public/images/characters/elephant.webp)을 바꾸면 다시 실행한다.
import { chromium } from '@playwright/test';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const elephant = readFileSync(root('public/images/characters/elephant.webp')).toString('base64');
mkdirSync(root('public/icons'), { recursive: true });

// maskable: 안드로이드가 모양을 잘라도 코끼리가 남도록 가운데 80% 안에만 그린다
const page = (size, maskable) => `<!doctype html><html><body style="margin:0">
<div style="width:${size}px;height:${size}px;display:grid;place-items:center;
  background:${maskable ? '#BEE6F7' : 'transparent'};">
  <div style="width:${maskable ? 80 : 100}%;height:${maskable ? 80 : 100}%;border-radius:${maskable ? 0 : 22}%;
    background:#BEE6F7;display:grid;place-items:center;overflow:hidden">
    <img src="data:image/webp;base64,${elephant}" style="height:82%">
  </div>
</div></body></html>`;

const browser = await chromium.launch();
const tab = await browser.newPage();
for (const [size, maskable, name] of [[192, false, 'icon-192'], [512, false, 'icon-512'], [512, true, 'icon-maskable-512'], [180, true, 'apple-touch-icon']]) {
  await tab.setViewportSize({ width: size, height: size });
  await tab.setContent(page(size, maskable));
  await tab.waitForFunction(() => document.images[0].complete);
  await tab.screenshot({ path: root(`public/icons/${name}.png`), omitBackground: !maskable });
}
await browser.close();
console.log('[icons] public/icons 에 아이콘 4개를 만들었어요.');
