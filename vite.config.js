import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { offlineServiceWorker } from './scripts/sw-plugin.mjs';

// 여러 앱이 함께 쓰는 코드 폴더 (어린이 앱 개발/공통)
const COMMON_DIR = fileURLToPath(new URL('../공통', import.meta.url));

export default defineConfig({
  // GitHub Pages는 https://계정.github.io/저장소이름/ 아래에서 열리므로 상대 경로로 묶는다.
  base: './',
  resolve: { alias: { '@공통': COMMON_DIR } },
  // 개발 서버는 기본으로 프로젝트 밖 파일을 못 읽으므로 공통 폴더를 허용한다
  server: { port: 5173, fs: { allow: ['.', COMMON_DIR] } },
  // 빌드할 때 오프라인 저장 파일(sw.js)을 만든다
  plugins: [offlineServiceWorker()],
  test: {
    include: ['tests/unit/**/*.test.js'],
  },
});
