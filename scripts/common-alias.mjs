// node 로 직접 돌리는 스크립트(음성 목록·녹음)에서도 '@공통/...' 을 찾게 한다.
// vite.config.js 의 별칭(alias)과 같은 폴더: 어린이 앱 개발/공통
// 사용: node --import ./scripts/common-alias.mjs scripts/voice-list.mjs
import { registerHooks } from 'node:module';

const PREFIX = '@공통/';
const COMMON_URL = new URL('../../공통/', import.meta.url);

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (!specifier.startsWith(PREFIX)) return nextResolve(specifier, context);
    return nextResolve(new URL(specifier.slice(PREFIX.length), COMMON_URL).href, context);
  },
});
