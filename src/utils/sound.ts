// Audio Engine for FNF Title Screen with freakyMenu.ogg BGM
let bgmAudio: HTMLAudioElement | null = null;
let isMuted = false;
let globalVolume = 0.8;
let beatTimer: number | null = null;
let beatListeners: Array<() => void> = [];

export function initBgm() {
  if (typeof window === 'undefined') return;
  if (!bgmAudio) {
    bgmAudio = new Audio('/assets/aistudio/freakyMenu_30d02bcb.ogg');
    bgmAudio.loop = true;
    bgmAudio.volume = globalVolume;
  }
}

export function startBGM() {
  initBgm();
  if (bgmAudio && !isMuted) {
    bgmAudio.volume = globalVolume;
    bgmAudio.play().catch(() => {
      // Audio autoplay policy fallback
    });
  }

  // 102 BPM Beat Ticker (~588ms)
  if (beatTimer === null) {
    beatTimer = window.setInterval(() => {
      beatListeners.forEach((cb) => cb());
    }, 588);
  }
}

export function stopBGM() {
  if (bgmAudio) {
    bgmAudio.pause();
  }
  if (beatTimer !== null) {
    clearInterval(beatTimer);
    beatTimer = null;
  }
}

export function setSoundMuted(muted: boolean) {
  isMuted = muted;
  if (bgmAudio) {
    if (muted) {
      bgmAudio.pause();
    } else {
      bgmAudio.volume = globalVolume;
      bgmAudio.play().catch(() => {});
    }
  }
}

export function setSoundVolume(vol: number) {
  globalVolume = Math.max(0, Math.min(1, vol));
  if (bgmAudio) {
    bgmAudio.volume = globalVolume;
  }
}

export function subscribeBeat(callback: () => void): () => void {
  beatListeners.push(callback);
  return () => {
    beatListeners = beatListeners.filter((cb) => cb !== callback);
  };
}

// Sound effects using Web Audio API
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playScrollSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);

  gain.gain.setValueAtTime(0.2 * globalVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.05);
}

export function playClickSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(520, now);
  osc.frequency.exponentialRampToValueAtTime(1040, now + 0.06);

  gain.gain.setValueAtTime(0.25 * globalVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.06);
}

export function playConfirmSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.setValueAtTime(880, now + 0.08);

  gain.gain.setValueAtTime(0.3 * globalVolume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.35);
}

export function playMsnSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [1396.91, 1760.00];
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.12);

    gain.gain.setValueAtTime(0, now + idx * 0.12);
    gain.gain.linearRampToValueAtTime(0.35 * globalVolume, now + idx * 0.12 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.12);
    osc.stop(now + idx * 0.12 + 0.35);
  });
}

export function playEasterEggSound() {
  playMsnSound();
}
