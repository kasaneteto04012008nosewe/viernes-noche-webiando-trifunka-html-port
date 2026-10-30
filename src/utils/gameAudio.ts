// Audio engine for gameplay with synthesized 100 BPM rhythm track & vocal notes
let audioCtx: AudioContext | null = null;
let musicTimer: number | null = null;
let isPlayingMusic = false;

function getAudioCtx(): AudioContext | null {
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

// Direction pitch maps (C4, E4, G4, C5)
const DIR_PITCHES = [261.63, 329.63, 392.00, 523.25];

export function playNotePitch(dir: 0 | 1 | 2 | 3, isPlayer: boolean, volume: number = 0.8) {
  const ctx = getAudioCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Distinct wave types for BF vs Opponent
  osc.type = isPlayer ? 'sawtooth' : 'triangle';

  const freq = DIR_PITCHES[dir] * (isPlayer ? 1 : 0.75); // Opponent slightly lower pitch
  osc.frequency.setValueAtTime(freq, now);

  // Pitch bend for FNF style vocal glide
  osc.frequency.exponentialRampToValueAtTime(freq * 1.05, now + 0.15);

  gain.gain.setValueAtTime(0.25 * volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.25);
}

export function playMissSound(volume: number = 0.8) {
  const ctx = getAudioCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.linearRampToValueAtTime(40, now + 0.15);

  gain.gain.setValueAtTime(0.3 * volume, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.15);
}

export function playCountdownSound(count: number, volume: number = 0.8) {
  const ctx = getAudioCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  const freqs = [350, 440, 523.25, 880]; // 3, 2, 1, GO!
  const freq = freqs[count] || 440;

  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.3 * volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.2);
}

// Background backing beat (100 BPM Funk synth groove)
export function startTutorialMusic(volume: number = 0.8) {
  stopTutorialMusic();
  const ctx = getAudioCtx();
  if (!ctx) return;

  isPlayingMusic = true;
  let beatCount = 0;
  const beatIntervalMs = 600; // 100 BPM = 600ms per beat

  musicTimer = window.setInterval(() => {
    if (!isPlayingMusic) return;
    const now = ctx.currentTime;

    // Kick on beat 0 & 2
    if (beatCount % 2 === 0) {
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(130, now);
      kickOsc.frequency.exponentialRampToValueAtTime(30, now + 0.1);
      kickGain.gain.setValueAtTime(0.35 * volume, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      kickOsc.connect(kickGain);
      kickGain.connect(ctx.destination);
      kickOsc.start(now);
      kickOsc.stop(now + 0.1);
    }

    // Snare on beat 1 & 3
    if (beatCount % 2 === 1) {
      const snareOsc = ctx.createOscillator();
      const snareGain = ctx.createGain();
      snareOsc.type = 'triangle';
      snareOsc.frequency.setValueAtTime(220, now);
      snareGain.gain.setValueAtTime(0.2 * volume, now);
      snareGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      snareOsc.connect(snareGain);
      snareGain.connect(ctx.destination);
      snareOsc.start(now);
      snareOsc.stop(now + 0.12);
    }

    // Bass Synth groove
    const bassNotes = [110, 110, 130.81, 146.83, 110, 98, 110, 164.81];
    const bassFreq = bassNotes[beatCount % bassNotes.length];
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = 'sawtooth';
    bassOsc.frequency.setValueAtTime(bassFreq, now);
    bassGain.gain.setValueAtTime(0.12 * volume, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    bassOsc.connect(bassGain);
    bassGain.connect(ctx.destination);
    bassOsc.start(now);
    bassOsc.stop(now + 0.25);

    beatCount++;
  }, beatIntervalMs);
}

export function stopTutorialMusic() {
  isPlayingMusic = false;
  if (musicTimer !== null) {
    clearInterval(musicTimer);
    musicTimer = null;
  }
}
