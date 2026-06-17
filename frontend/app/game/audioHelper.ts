let isGlobalMuted = false;

let homeLobbyAudio: HTMLAudioElement | null = typeof window !== 'undefined' ? new Audio('/backsound_home_sampai_lobby.mp3') : null;
if (homeLobbyAudio) {
  homeLobbyAudio.loop = true;
  homeLobbyAudio.volume = 0.12; // "jangan kekerasan" (soft volume)
  homeLobbyAudio.preload = 'auto';
}

let clickAudio: HTMLAudioElement | null = typeof window !== 'undefined' ? new Audio('/click.wav') : null;
if (clickAudio) {
  clickAudio.volume = 0.4;
  clickAudio.preload = 'auto';
  clickAudio.load();
}

// === NEW SFX AUDIO ELEMENTS ===
let popUpAudio: HTMLAudioElement | null = typeof window !== 'undefined' ? new Audio('/sound/SFX_Pop Up Pertanyaan.mp3') : null;
let correctAudio: HTMLAudioElement | null = typeof window !== 'undefined' ? new Audio('/sound/SFX_JawabanBenar.mp3') : null;
let wrongAudio: HTMLAudioElement | null = typeof window !== 'undefined' ? new Audio('/sound/SFX_JawabanSalah.mp3') : null;
let majuAudio: HTMLAudioElement | null = typeof window !== 'undefined' ? new Audio('/sound/SFX_Maju.mp3') : null;
let mundurAudio: HTMLAudioElement | null = typeof window !== 'undefined' ? new Audio('/sound/SFX_Mundur.mp3') : null;
let winAudio: HTMLAudioElement | null = typeof window !== 'undefined' ? new Audio('/sound/SFX_Win.mp3') : null;

// Preload SFX
const sfxList = [popUpAudio, correctAudio, wrongAudio, majuAudio, mundurAudio, winAudio];
sfxList.forEach(audio => {
  if (audio) {
    audio.preload = 'auto';
    audio.load();
  }
});

export function setGlobalMuteState(muted: boolean) {
  isGlobalMuted = muted;
  if (homeLobbyAudio) {
    homeLobbyAudio.muted = muted;
  }
}

export function playHomeLobbyMusic() {
  if (!homeLobbyAudio) return;
  if (homeLobbyAudio.paused) {
    homeLobbyAudio.play().catch((err) => console.log("Lobby audio play failed:", err));
  }
}

export function stopHomeLobbyMusic() {
  if (homeLobbyAudio) {
    homeLobbyAudio.pause();
    homeLobbyAudio.currentTime = 0;
  }
}

export function setHomeLobbyMusicMute(muted: boolean) {
  if (homeLobbyAudio) {
    homeLobbyAudio.muted = muted;
  }
}

const DEFAULT_LOBBY_VOLUME = 0.12;

export function setHomeLobbyMusicVolume(volumeMultiplier: number) {
  if (homeLobbyAudio) {
    homeLobbyAudio.volume = DEFAULT_LOBBY_VOLUME * Math.max(0, Math.min(1, volumeMultiplier));
  }
}

// Helper for playing preloaded SFX with cloning to support rapid overlap
function playPreloadedSFX(audioElement: HTMLAudioElement | null, defaultVolume: number) {
  if (!audioElement || isGlobalMuted) return;
  try {
    const clone = audioElement.cloneNode(true) as HTMLAudioElement;
    clone.volume = defaultVolume;
    clone.play().catch((err) => console.log("SFX play failed:", err));
  } catch (err) {
    // Fallback if cloning fails
    audioElement.volume = defaultVolume;
    audioElement.currentTime = 0;
    audioElement.play().catch(() => {});
  }
}

export function playClickSound() {
  playPreloadedSFX(clickAudio, 0.4);
}

export function playPopUpSound() {
  playPreloadedSFX(popUpAudio, 0.5);
}

export function playCorrectSound() {
  playPreloadedSFX(correctAudio, 0.5);
}

export function playWrongSound() {
  playPreloadedSFX(wrongAudio, 0.5);
}

// Maju/Mundur: play once per walking phase, no cloning/overlap
export function playMajuSound() {
  if (!majuAudio || isGlobalMuted) return;
  majuAudio.volume = 0.5;
  majuAudio.currentTime = 0;
  majuAudio.play().catch(() => {});
}

export function stopMajuSound() {
  if (majuAudio) {
    try {
      majuAudio.pause();
      majuAudio.currentTime = 0;
    } catch (e) {}
  }
}

export function playMundurSound() {
  if (!mundurAudio || isGlobalMuted) return;
  mundurAudio.volume = 0.5;
  mundurAudio.currentTime = 0;
  mundurAudio.play().catch(() => {});
}

export function stopMundurSound() {
  if (mundurAudio) {
    try {
      mundurAudio.pause();
      mundurAudio.currentTime = 0;
    } catch (e) {}
  }
}

export function playWinSound() {
  playPreloadedSFX(winAudio, 0.7);
}

