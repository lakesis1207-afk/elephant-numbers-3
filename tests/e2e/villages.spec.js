import { test, expect } from './fixtures.js';
import { startWith, traceLine } from './helpers.js';

// 고르기 게임 3개(풍선 터뜨리기, 누가 더 많아?, 반짝 무늬 보기): 첫 문제는 두 번 틀려 힌트를 보고, 5문제를 맞혀 별을 받는다.
// 게임판(.play)의 data-answer가 정답이고, 고르는 버튼은 .pick[data-value].
test.setTimeout(90_000);

const GAMES = [
  ['사바나 마을', '풍선 터뜨리기', 'balloon'],
  ['바닷가 마을', '누가 더 많아?', 'compare'],
  ['바닷가 마을', '반짝 무늬 보기', 'spots'],
];

const answerOf = (page) => page.locator('.play').getAttribute('data-answer');

async function pickRight(page) {
  const answer = await answerOf(page);
  if (await page.locator('.play svg.lineq').count()) return traceLine(page); // 선 긋기: 길을 따라 긋는다
  const blow = page.locator('.play .balloon.blow'); // 풍선 불기: 정답 수만큼 풍선을 누른다
  if (await blow.count()) {
    for (let k = 0; k < Number(answer); k++) await blow.click({ force: true });
    return;
  }
  await page.locator(`.play .pick[data-value="${answer}"]`).click({ force: true }); // 풍선은 계속 떠다녀서 멈추기를 기다리지 않는다
}

for (const [village, name, key] of GAMES) {
  test(`${village} · ${name}: 두 번 틀리면 힌트, 5문제를 맞히면 별`, async ({ page }) => {
    await startWith(page, { allOpen: true });
    await page.getByRole('button', { name: village, exact: true }).click();
    await expect(page.locator('.gcard')).toHaveCount(3);
    await page.getByRole('button', { name, exact: true }).click();
    await expect(page.locator('.qdots i')).toHaveCount(5);

    // 첫 문제: 두 번 틀린다 → 힌트가 끝나면 정답을 누를 수 있다
    const answer = await answerOf(page);
    const wrong = page.locator(`.play .pick:not([data-value="${answer}"])`).first();
    await wrong.click({ force: true });
    await expect(page.locator('.bubble')).toContainText('다시 세어 볼까?');
    await page.waitForTimeout(800); // 첫 오답 뒤 잠깐 누르기를 막는다
    await wrong.click({ force: true });
    await expect(async () => {
      await pickRight(page);
      await expect(page.locator('.qdots i.on')).toHaveCount(1, { timeout: 600 });
    }).toPass({ timeout: 20_000 });

    for (let q = 2; q <= 5; q++) {
      await expect(page.locator('.play .right')).toHaveCount(0, { timeout: 5000 }); // 다음 문제가 뜰 때까지
      await pickRight(page);
      await expect(page.locator('.qdots i.on')).toHaveCount(q);
    }

    await expect(page.locator('.reward .sticker')).toBeVisible();
    await page.getByRole('button', { name: '다음' }).click();
    await expect(page.locator(`.gcard[data-game="${key}"] .star`)).toBeVisible();
  });
}

test('숲속 마을 · 풍선 불기: 누를 때마다 커지고, 수만큼 누르면 터지고, 가만있으면 안내가 나온다', async ({ page }) => {
  await startWith(page, { allOpen: true });
  await page.getByRole('button', { name: '숲속 마을', exact: true }).click();
  await page.getByRole('button', { name: '풍선 불기', exact: true }).click();
  const balloon = page.locator('.play .balloon.blow');
  const scaleOf = () => balloon.evaluate((el) => Number(el.style.getPropertyValue('--s')));
  const answer = Number(await answerOf(page));
  expect(answer).toBeGreaterThanOrEqual(1);
  expect(answer).toBeLessThanOrEqual(4); // 첫 난이도는 1~4
  expect(await scaleOf()).toBe(1);
  await expect(page.locator('.play .bslot')).toHaveCount(answer);

  // 가만있으면 풍선이 반짝이며 눌러 보라고 알려 준다
  await expect(balloon).toHaveClass(/hl/, { timeout: 8000 });

  // 누를 때마다 커지고 칸이 하나씩 찬다. 마지막에는 처음의 2.5배
  let before = 1;
  for (let k = 1; k <= answer; k++) {
    await balloon.click({ force: true });
    const now = await scaleOf();
    expect(now).toBeGreaterThan(before);
    before = now;
    await expect(page.locator('.play .bslot.on')).toHaveCount(k);
  }
  expect(before).toBeCloseTo(2.5, 5);
  await expect(balloon).toHaveClass(/right/);
  await expect(page.locator('.play .bpop')).toHaveCount(1); // 펑!

  // 터진 뒤 더 눌러도 아무 일도 없다
  await balloon.click({ force: true });
  await expect(page.locator('.qdots i.on')).toHaveCount(1);

  for (let q = 2; q <= 5; q++) {
    await expect(page.locator('.play .right')).toHaveCount(0, { timeout: 5000 });
    await pickRight(page);
    await expect(page.locator('.qdots i.on')).toHaveCount(q);
  }
  await expect(page.locator('.reward .sticker')).toBeVisible();
});

// 선 긋기 3종: 길을 끝까지 따라 그어 5문제를 끝내면 별
const LINE_GAMES = [
  ['사바나 마을', '길 따라가기', 'road'],
  ['숲속 마을', '꼬불꼬불 길', 'curvy'],
  ['바닷가 마을', '지그재그 길', 'zigzag'],
];
for (const [village, name, key] of LINE_GAMES) {
  test(`${village} · ${name}: 길을 따라 그어 5문제를 끝내면 별`, async ({ page }) => {
    await startWith(page, { allOpen: true });
    await page.getByRole('button', { name: village, exact: true }).click();
    await page.getByRole('button', { name, exact: true }).click();
    for (let q = 1; q <= 5; q++) {
      await expect(page.locator('.play .right')).toHaveCount(0, { timeout: 5000 });
      await traceLine(page);
      await expect(page.locator('.qdots i.on')).toHaveCount(q);
    }
    await expect(page.locator('.reward .sticker')).toBeVisible();
    await page.getByRole('button', { name: '다음' }).click();
    await expect(page.locator(`.gcard[data-game="${key}"] .star`)).toBeVisible();
  });
}

test('선 긋기: 엉뚱한 곳은 안내만, 중간에 떼도 이어 긋고, 가만있으면 길을 보여 준다', async ({ page }) => {
  await startWith(page, { allOpen: true });
  await page.getByRole('button', { name: '사바나 마을', exact: true }).click();
  await page.getByRole('button', { name: '길 따라가기', exact: true }).click();
  const fill = page.locator('.play .lfill');
  const offset = () => fill.evaluate((el) => Number(el.getAttribute('stroke-dashoffset')) / Number(el.getAttribute('pathLength')));

  // 길 끝(시작점에서 먼 곳)을 누르면 선이 생기지 않고 초록 점을 누르라고 한다
  const end = await page.locator('.play svg.lineq').evaluate((svg) => {
    const pts = JSON.parse(svg.dataset.path);
    const p = new DOMPoint(...pts.at(-1)).matrixTransform(svg.getScreenCTM());
    return [p.x, p.y];
  });
  await page.mouse.click(...end);
  await expect(page.locator('.bubble')).toContainText('초록 점을 누르고');
  expect(await offset()).toBeCloseTo(1, 2);

  // 반쯤 긋고 손을 떼도 남아 있고, 그 끝에서 이어 그으면 끝난다
  await traceLine(page, { upTo: 0.5 });
  const half = await offset();
  expect(half).toBeLessThan(0.6);
  expect(half).toBeGreaterThan(0.4);
  await expect(page.locator('.qdots i.on')).toHaveCount(0);
  await traceLine(page, { from: 0.5 });
  await expect(page.locator('.qdots i.on')).toHaveCount(1);

  // 다음 문제에서 가만있으면 노란 점이 길을 따라가며 보여 준다
  await expect(page.locator('.play .right')).toHaveCount(0, { timeout: 5000 });
  await expect(page.locator('.play .lhint.on')).toBeVisible({ timeout: 8000 });
  await expect(page.locator('.bubble')).toContainText('끝까지 따라가 봐');
});

test('숲속 마을 게임 3개를 다 끝내면 바닷가 마을이 열린다', async ({ page }) => {
  await startWith(page, { forestOpen: true, done: { pond: true, curvy: true } });
  await page.getByRole('button', { name: '바닷가 마을, 잠김' }).waitFor();
  await page.getByRole('button', { name: '숲속 마을', exact: true }).click();
  await page.getByRole('button', { name: '풍선 불기', exact: true }).click();
  for (let q = 1; q <= 5; q++) {
    await expect(page.locator('.play .right')).toHaveCount(0, { timeout: 5000 });
    await pickRight(page);
    await expect(page.locator('.qdots i.on')).toHaveCount(q);
  }
  await expect(page.locator('.reward .open')).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('elephant-numbers')));
  expect(saved.seaOpen).toBe(true);
});

test('스티커북: 마을 버튼으로 쪽을 넘기고, 마을에서 열면 그 마을 쪽이 먼저 보인다', async ({ page }) => {
  await startWith(page, { allOpen: true, stickers: ['rabbit', 'penguin', 'crab'] });
  await page.getByRole('button', { name: '숲속 마을', exact: true }).click();
  await page.getByRole('button', { name: '스티커북' }).click();
  await expect(page.locator('.slot')).toHaveCount(6);
  await expect(page.locator('.slot.has')).toHaveCount(1);

  await page.getByRole('button', { name: '바닷가 마을 스티커' }).click();
  await expect(page.locator('.slot')).toHaveCount(10);
  await expect(page.locator('.slot.has')).toHaveCount(2);

  await page.getByRole('button', { name: '스티커북 닫기' }).click();
  await expect(page.locator('.gcard')).toHaveCount(3);
});
