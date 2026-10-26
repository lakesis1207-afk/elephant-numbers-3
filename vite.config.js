import { defineConfig } from 'vite';
import { offlineServiceWorker } from './scripts/sw-plugin.mjs';

export default defineConfig({
  base: './',
  server: { port: 5190, strictPort: true },
  // 빌드할 때 오프라인 저장 파일(sw.js)을 만든다
  plugins: [offlineServiceWorker()],
  test: { include: ['tests/unit/**/*.test.js'] },
});
