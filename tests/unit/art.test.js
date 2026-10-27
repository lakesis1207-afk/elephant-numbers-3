import { describe, test, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { allArtUrls } from '../../src/art/registry.js';
import { VILLAGES } from '../../src/villages/index.js';

const PUBLIC = fileURLToPath(new URL('../../public/', import.meta.url));
const fileOf = (url) => PUBLIC + url.replace(/^\//, '');

describe('그림 파일', () => {
  test('그림 목록의 파일이 모두 있다', () => {
    const missing = allArtUrls().filter((url) => !existsSync(fileOf(url)));
    expect(missing).toEqual([]);
  });

  test('잠금 화면 밤 배경은 webp 그림이다', () => {
    expect(allArtUrls().some((u) => u.endsWith('/backgrounds/night-base.webp'))).toBe(true);
  });

  test('마을 동물·게임 카드 그림이 모두 목록에 있다', () => {
    const urls = allArtUrls();
    VILLAGES.forEach((v) => {
      v.detail.animals.forEach((a) => expect(urls.some((u) => u.includes(`/characters/${a.key}.`)), a.key).toBe(true));
      v.detail.games.forEach((g) => g.scene.forEach((s) => expect(urls.some((u) => u.includes(`/${s.name}.`)), s.name).toBe(true)));
    });
  });
});
