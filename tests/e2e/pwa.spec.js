import { test, expect } from './fixtures.js';

// 오프라인 저장(service worker)은 빌드한 완성본에서만 켜진다
test.skip(({ baseURL }) => !baseURL.includes('/elephant-numbers/'), '빌드본(built)에서만 검사');

test('설치 정보(manifest)와 아이콘이 있다', async ({ page, request, baseURL }) => {
  await page.goto('./');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  const res = await request.get(new URL(href, baseURL).href);
  expect(res.ok()).toBe(true);
  const manifest = await res.json();
  expect(manifest).toMatchObject({ name: '코끼리와 숫자친구들 (1단계)', display: 'fullscreen', orientation: 'landscape', start_url: './' });
  for (const icon of manifest.icons) {
    expect((await request.get(new URL(icon.src, baseURL).href)).ok(), icon.src).toBe(true);
  }
});

test('한 번 열면 인터넷이 끊겨도 앱이 열리고 게임까지 할 수 있다', async ({ page, context }) => {
  await page.goto('./');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  // 저장이 끝나 이 페이지를 맡을 때까지 기다린다
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

  await context.setOffline(true);
  await page.reload();
  await page.getByRole('button', { name: '시작' }).click();
  await page.getByRole('button', { name: '사바나 마을', exact: true }).click();
  await page.getByRole('button', { name: '과일 세기' }).click();
  await expect(page.locator('.tray .fruit').first()).toBeVisible();

  // 큰 배경 그림은 저장본에서 읽어 와도 그리는 데 잠깐 걸리므로, 다 뜰 때까지 기다리며 확인한다
  const broken = () =>
    page.locator('img').evaluateAll((imgs) =>
      imgs.filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.getAttribute('src')),
    );
  await expect.poll(broken, { timeout: 5000 }).toEqual([]);
  expect(await page.evaluate(() => document.fonts.check('16px Jua', '코끼리'))).toBe(true);
  await context.setOffline(false);
});

test('녹음은 따로 저장되어, 인터넷이 끊겨도 아이 목소리(녹음)로 나온다', async ({ page, context }) => {
  await page.addInitScript(() => {
    window.__played = [];
    const start = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (...args) {
      window.__played.push(this.buffer.duration);
      return start.apply(this, args);
    };
  });
  await page.goto('./');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  const counts = await page.evaluate(async () => {
    const list = await (await fetch('./audio/voice/manifest.json')).json();
    const saved = await (await caches.open('elephant-voice')).keys();
    return { list: list.length, saved: saved.length };
  });
  expect(counts.list).toBeGreaterThan(0);
  expect(counts.saved).toBe(counts.list);

  await context.setOffline(true);
  await page.reload();
  await page.getByRole('button', { name: '시작' }).click();
  await expect.poll(() => page.evaluate(() => window.__played.length)).toBeGreaterThan(0);
  await context.setOffline(false);
});
