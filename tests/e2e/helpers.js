// 브라우저 검사 공통 도우미
import { expect } from '@playwright/test';

/**
 * 오늘 날짜로 진행 기록을 넣고 앱을 연 뒤 ▶를 누른다.
 * 앱이 뜨기 전에 넣어야 한다: 열린 앱을 새로고침하면 앱이 화면을 떠나며 자기 기록을 다시 저장하기 때문.
 */
export async function startWith(page, saved, { pressStart = true } = {}) {
  await page.addInitScript((data) => {
    if (sessionStorage.getItem('seeded')) return; // 첫 로드에만
    sessionStorage.setItem('seeded', '1');
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const day = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    localStorage.setItem('elephant-numbers', JSON.stringify({ ...data, day }));
  }, saved);
  await page.goto('./');
  if (pressStart) await page.getByRole('button', { name: '시작' }).click();
}

/** 버튼을 ms 동안 꾹 누른다 */
export async function hold(page, locator, ms = 3300) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(ms);
  await page.mouse.up();
}

/**
 * 선 긋기: 개발·검사용 빌드가 게임판에 적어 둔 길 좌표(data-path)를 따라 마우스로 긋는다.
 * from~upTo(0~1)는 길의 어느 부분을 그을지. 기본은 처음부터 끝까지.
 */
export async function traceLine(page, { from = 0, upTo = 1 } = {}) {
  const board = page.locator('.play svg.lineq');
  await expect(board).toBeVisible();
  const screen = await board.evaluate((svg) => {
    const m = svg.getScreenCTM();
    return JSON.parse(svg.dataset.path).map(([x, y]) => {
      const p = new DOMPoint(x, y).matrixTransform(m);
      return [p.x, p.y];
    });
  });
  // 6px 간격으로 잘게 나눠, 손가락처럼 길을 따라 조금씩 움직인다
  const dense = [screen[0]];
  for (let i = 1; i < screen.length; i += 1) {
    const [ax, ay] = screen[i - 1];
    const [bx, by] = screen[i];
    const steps = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / 6));
    for (let k = 1; k <= steps; k += 1) dense.push([ax + ((bx - ax) * k) / steps, ay + ((by - ay) * k) / steps]);
  }
  const part = dense.slice(Math.floor(from * (dense.length - 1)), Math.ceil(upTo * (dense.length - 1)) + 1);
  await page.mouse.move(...part[0]);
  await page.mouse.down();
  for (const p of part.slice(1)) await page.mouse.move(...p);
  await page.mouse.up();
}
