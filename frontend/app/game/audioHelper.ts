let homeLobbyAudio: HTMLAudioElement | null = null;

export function playHomeLobbyMusic() {
  if (typeof window === 'undefined') return;
  if (!homeLobbyAudio) {
    homeLobbyAudio = new Audio('/backsound_home_sampai_lobby.mp3');
    homeLobbyAudio.loop = true;
    homeLobbyAudio.volume = 0.12; // "jangan kekerasan" (soft volume)
  }
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
  if (typeof window === 'undefined') return;
  const audio = new Audio('/click.wav');
  audio.volume = 0.4;
  audio.play().catch(() => {});
}
