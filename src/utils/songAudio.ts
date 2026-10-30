// Dual-track audio engine for Inst.ogg and Voices.ogg
let instAudio: HTMLAudioElement | null = null;
let voicesAudio: HTMLAudioElement | null = null;
let globalVol = 0.8;
let isMuted = false;

export function initSongAudio(
  instUrl = '/assets/aistudio/Inst_b1c16b8a.ogg',
  voicesUrl = '/assets/aistudio/Voices_dd25548d.ogg'
) {
  if (typeof window === 'undefined') return;

  if (!instAudio) {
    instAudio = new Audio(instUrl);
  } else if (instAudio.src !== window.location.origin + instUrl) {
    instAudio.src = instUrl;
  }

  if (!voicesAudio) {
    voicesAudio = new Audio(voicesUrl);
  } else if (voicesAudio.src !== window.location.origin + voicesUrl) {
    voicesAudio.src = voicesUrl;
  }

  instAudio.volume = isMuted ? 0 : globalVol;
  voicesAudio.volume = isMuted ? 0 : globalVol;
}

export function playSongAudio() {
  initSongAudio();
  if (instAudio && voicesAudio) {
    instAudio.volume = isMuted ? 0 : globalVol;
    voicesAudio.volume = isMuted ? 0 : globalVol;

    // Resync
    voicesAudio.currentTime = instAudio.currentTime;

    const p1 = instAudio.play();
    const p2 = voicesAudio.play();

    Promise.all([p1, p2]).catch((err) => {
      console.warn('Audio play prevented:', err);
    });
  }
}

export function pauseSongAudio() {
  if (instAudio) instAudio.pause();
  if (voicesAudio) voicesAudio.pause();
}

export function stopSongAudio() {
  if (instAudio) {
    instAudio.pause();
    instAudio.currentTime = 0;
  }
  if (voicesAudio) {
    voicesAudio.pause();
    voicesAudio.currentTime = 0;
  }
}

export function seekSongAudio(timeInSeconds: number) {
  if (instAudio) instAudio.currentTime = timeInSeconds;
  if (voicesAudio) voicesAudio.currentTime = timeInSeconds;
}

export function getCurrentSongTimeMs(): number {
  if (instAudio) {
    return instAudio.currentTime * 1000;
  }
  return 0;
}

export function setSongAudioMuted(muted: boolean) {
  isMuted = muted;
  if (instAudio) instAudio.volume = muted ? 0 : globalVol;
  if (voicesAudio) voicesAudio.volume = muted ? 0 : globalVol;
}

export function setSongAudioVolume(vol: number) {
  globalVol = Math.max(0, Math.min(1, vol));
  if (instAudio) instAudio.volume = isMuted ? 0 : globalVol;
  if (voicesAudio) voicesAudio.volume = isMuted ? 0 : globalVol;
}

export function isSongFinished(): boolean {
  if (instAudio) return instAudio.ended;
  return false;
}
