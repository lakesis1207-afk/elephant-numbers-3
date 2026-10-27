// 효과음과 녹음 목소리가 함께 쓰는 소리 장치(Web Audio). 하나만 만들어 같이 쓴다.
// 브라우저는 아이가 화면을 누르기 전에는 소리를 막아 두므로(suspended), 쓸 때마다 깨운다.
// 아이패드는 전화·화면 잠금 뒤에 'interrupted'가 되므로, 'running'이 아니면 언제나 깨운다.
let context = null;

/** 아이패드 무음 스위치를 켜도 소리가 나게 (사파리 17 이상. 다른 브라우저는 그냥 넘어감) */
function playEvenOnSilentSwitch() {
  try {
    if (globalThis.navigator?.audioSession) globalThis.navigator.audioSession.type = 'playback';
  } catch (error) {
    console.warn('[audio] 무음 스위치 설정을 바꿀 수 없습니다.', error);
  }
}

export function audioContext() {
  if (!context) {
    const Ctx = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!Ctx) return null;
    playEvenOnSilentSwitch();
    context = new Ctx();
  }
  if (context.state !== 'running') context.resume().catch(() => {});
  return context;
}

/** 소리 장치가 켜질 때까지 잠깐(ms) 기다린다. 켜졌으면 true */
export async function waitUntilRunning(ctx, ms) {
  if (ctx.state === 'running') return true;
  await Promise.race([ctx.resume().catch(() => {}), new Promise((r) => setTimeout(r, ms))]);
  return ctx.state === 'running';
}
