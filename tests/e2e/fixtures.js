// 모든 브라우저 검사에 붙는 확인: 음성 목록에 없는 말을 하면 검사 실패 (개발 서버에서만 알 수 있음)
import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    const missing = [];
    page.on('console', (msg) => {
      if (msg.text().includes('[voice] 목록에 없는 문장')) missing.push(msg.text());
    });
    await use(page);
    expect(missing, '음성 목록(src/audio/voiceLines.js)에 없는 문장').toEqual([]);
  },
});
export { expect };
