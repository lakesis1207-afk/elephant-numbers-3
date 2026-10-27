import { test, expect } from './fixtures.js';
import { startWith } from './helpers.js';

test.describe('시작 → 지도 → 사바나 마을', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
  });

  test('시작 화면에는 코끼리와 시작 버튼이 있고 위쪽 막대는 없다', async ({ page }) => {
    await expect(page.getByRole('img', { name: '코끼리' })).toBeVisible();
    await expect(page.getByRole('button', { name: '시작' })).toBeVisible();
    await expect(page.locator('#bar')).toBeHidden();
  });

  test('시작을 누르면 지도에 마을 3개가 나오고 사바나만 열려 있다', async ({ page }) => {
    await page.getByRole('button', { name: '시작' }).click();

    await expect(page.locator('.vcard')).toHaveCount(3);
    await expect(page.locator('.vcard:not(.locked)')).toHaveCount(1);
    await expect(page.getByRole('button', { name: '사바나 마을', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '숲속 마을, 잠김' })).toBeVisible();
    await expect(page.locator('#bar')).toBeVisible();
  });

  test('잠긴 마을을 누르면 지도에 그대로 남는다', async ({ page }) => {
    await page.getByRole('button', { name: '시작' }).click();
    await page.getByRole('button', { name: '바닷가 마을, 잠김' }).click();

    await expect(page.locator('.vcard')).toHaveCount(3);
  });

  test('사바나 마을에 들어가면 이야기와 게임 카드 3개가 나온다', async ({ page }) => {
    await page.getByRole('button', { name: '시작' }).click();
    await page.getByRole('button', { name: '사바나 마을', exact: true }).click();

    await expect(page.getByRole('button', { name: '이야기 다시 듣기' })).toBeVisible();
    await expect(page.locator('.gcard')).toHaveCount(3);
    for (const name of ['과일 세기', '풍선 터뜨리기', '길 따라가기']) {
      await expect(page.getByRole('button', { name })).toBeVisible();
    }
  });

  test('브라우저 뒤로 가기를 눌러도 앱 밖으로 나가지 않는다', async ({ page, baseURL }) => {
    await page.getByRole('button', { name: '시작' }).click();
    await page.getByRole('button', { name: '사바나 마을', exact: true }).click();

    await page.goBack();

    expect(page.url().startsWith(baseURL)).toBe(true);
    await expect(page.locator('.gcard')).toHaveCount(3);
  });

  test('그림·배경·글꼴이 모두 실제로 불러와진다 (하위 주소에서도)', async ({ page }) => {
    await page.getByRole('button', { name: '시작' }).click();
    await page.getByRole('button', { name: '사바나 마을', exact: true }).click();
    await page.waitForLoadState('networkidle');

    const broken = await page.locator('img').evaluateAll((imgs) =>
      imgs.filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.getAttribute('src')),
    );
    expect(broken).toEqual([]);
    expect(await page.locator('img').count()).toBeGreaterThan(8);
    expect(await page.evaluate(() => document.fonts.check('16px Jua', '코끼리'))).toBe(true);
  });

  test('모든 마을을 열면 세 마을 모두 게임 카드 3개가 있고, 그림이 다 보인다', async ({ page }) => {
    await startWith(page, { allOpen: true });
    for (const name of ['숲속 마을', '바닷가 마을']) {
      await page.getByRole('button', { name, exact: true }).click();
      await expect(page.locator('.gcard')).toHaveCount(3);
      await expect(page.locator('.screen.village .story')).toBeVisible();
      // 그림이 다 불러와질 때까지 잠깐 기다린다
      await expect.poll(() => page.locator('img').evaluateAll((imgs) =>
        imgs.filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.getAttribute('src'))), { message: name }).toEqual([]);
      await page.getByRole('button', { name: '지도로 가기' }).click();
      await expect(page.locator('.vcard')).toHaveCount(3);
    }
  });
});

test('세로 화면에서는 가로로 돌려 달라는 안내가 나온다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');

  await expect(page.getByText('휴대폰을 가로로 돌려 주세요')).toBeVisible();
  await expect(page.getByRole('button', { name: '시작' })).toBeHidden();
});
