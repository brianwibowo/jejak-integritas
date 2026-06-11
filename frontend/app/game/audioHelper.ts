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

export function playClickSound() {
  if (!clickAudio) return;
  try {
    const clickClone = clickAudio.cloneNode(true) as HTMLAudioElement;
    clickClone.volume = 0.4;
    clickClone.play().catch(() => {});
  } catch (err) {
    // Fallback if clone fails or isn't supported properly
    clickAudio.currentTime = 0;
    clickAudio.play().catch(() => {});
  }
}
