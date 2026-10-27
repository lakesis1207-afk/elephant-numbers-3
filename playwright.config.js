import { defineConfig, devices } from '@playwright/test';

// 같은 검사를 두 곳에서 돌린다.
// dev: 개발 서버 / built: 빌드 완성본을 GitHub Pages처럼 하위 주소(/elephant-numbers/)에서 연다.
const DEV_PORT = 5179; // 평소 개발 서버(5173)와 겹치지 않게
const BUILT_PORT = 5180;
const SUB_PATH = '/elephant-numbers/';

const tablet = { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } };

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: { trace: 'retain-on-failure' },
  projects: [
    { name: 'dev', use: { ...tablet, baseURL: `http://localhost:${DEV_PORT}/` } },
    { name: 'built', use: { ...tablet, baseURL: `http://localhost:${BUILT_PORT}${SUB_PATH}` } },
  ],
  webServer: [
    {
      command: `npx vite --port ${DEV_PORT} --strictPort`,
      url: `http://localhost:${DEV_PORT}/`,
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: `npm run build && npx vite preview --port ${BUILT_PORT} --strictPort --base ${SUB_PATH}`,
      url: `http://localhost:${BUILT_PORT}${SUB_PATH}`,
      env: { VITE_E2E: '1' }, // 검사용 빌드에만 정답 표시(data-answer)를 넣는다
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
