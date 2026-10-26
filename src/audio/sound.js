// 소리: 녹음 파일(public/audio/voice/<id>.mp3)이 있으면 틀고, 없으면 브라우저 읽기(speechSynthesis)로 대신한다.
// 효과음은 짧은 삑 소리. 대사 목록은 audio/voiceLines.js, 사람이 보는 표는 docs/음성-대사.md.
import { voiceIdOf } from './voiceLines.js';

const VOICE_DIR = `${import.meta.env.BASE_URL}audio/voice/`;
let playing = null;

function speak(text) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ko-KR';
    u.rate = 0.9;
    speechSynthesis.speak(u);
  } catch {
    /* 음성을 못 써도 앱은 계속 된다 */
  }
}

function stopAll() {
  playing?.pause();
  playing = null;
  try {
    speechSynthesis.cancel();
  } catch {
    /* 음성을 못 써도 앱은 계속 된다 */
  }
}

export function say(text) {
  stopAll();
  const id = voiceIdOf(text);
  if (!id) {
    speak(text);
    return;
  }
  const audio = new Audio();
  playing = audio;
  // 파일이 없거나 재생을 못 하면 브라우저 읽기로 (그사이 다른 말이 시작됐으면 그대로 둔다)
  const fallback = () => {
    if (playing === audio) speak(text);
  };
  clipUrl(id)
    .then((url) => {
      if (playing !== audio) return undefined;
      audio.src = url;
      return audio.play();
    })
    .catch(fallback);
}

// 녹음은 파일 전체를 받아 둔다(fetch). <audio>가 직접 받으면 부분 요청(Range)이라 오프라인 저장본으로 답할 수 없다.
const clips = new Map(); // id → Promise<주소>
function clipUrl(id) {
  if (!clips.has(id)) {
    const loading = fetch(`${VOICE_DIR}${id}.mp3`)
      .then((res) => {
        if (!res.ok) throw new Error(`녹음 파일이 없습니다: ${id}`);
        return res.blob();
      })
      .then((blob) => URL.createObjectURL(blob));
    loading.catch(() => clips.delete(id)); // 실패하면 다음에 다시 받아 본다
    clips.set(id, loading);
  }
  return clips.get(id);
}

let ctx = null;
function beep(freq, ms) {
  try {
    ctx ??= new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    gain.gain.value = 0.08;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + ms / 1000);
  } catch {
    /* 소리를 못 써도 앱은 계속 된다 */
  }
}

export const sfx = Object.freeze({
  yes: () => beep(880, 150),
  boing: () => beep(260, 180),
  sticker: () => beep(660, 300),
});

