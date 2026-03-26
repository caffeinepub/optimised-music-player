import { getAudioBlob } from "./db";

export type AudioCallbacks = {
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onEnded: () => void;
};

let audioEl: HTMLAudioElement | null = null;
let currentObjectUrl: string | null = null;
let callbacks: AudioCallbacks | null = null;

function getAudio(): HTMLAudioElement {
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.addEventListener("timeupdate", () => {
      callbacks?.onTimeUpdate(audioEl!.currentTime);
    });
    audioEl.addEventListener("durationchange", () => {
      if (audioEl && Number.isFinite(audioEl.duration)) {
        callbacks?.onDurationChange(audioEl.duration);
      }
    });
    audioEl.addEventListener("ended", () => {
      callbacks?.onEnded();
    });
  }
  return audioEl;
}

export function initAudioEngine(cb: AudioCallbacks): void {
  callbacks = cb;
  getAudio();
}

export async function play(
  trackId: string,
  title: string,
  artist: string,
): Promise<void> {
  const audio = getAudio();
  const arrayBuffer = await getAudioBlob(trackId);
  if (!arrayBuffer) throw new Error(`Audio blob not found for: ${trackId}`);

  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }

  const blob = new Blob([arrayBuffer]);
  currentObjectUrl = URL.createObjectURL(blob);
  audio.src = currentObjectUrl;
  await audio.play();

  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      album: "",
      artwork: [
        {
          src: "/assets/generated/music-player-icon-transparent.dim_200x200.png",
          sizes: "200x200",
          type: "image/png",
        },
      ],
    });
    navigator.mediaSession.playbackState = "playing";
  }
}

export function pause(): void {
  getAudio().pause();
  if ("mediaSession" in navigator) {
    navigator.mediaSession.playbackState = "paused";
  }
}

export function resume(): void {
  getAudio().play();
  if ("mediaSession" in navigator) {
    navigator.mediaSession.playbackState = "playing";
  }
}

export function seek(seconds: number): void {
  const audio = getAudio();
  audio.currentTime = Math.max(0, Math.min(seconds, audio.duration || 0));
}

export function seekForward(secs = 10): void {
  seek(getAudio().currentTime + secs);
}

export function seekBackward(secs = 10): void {
  seek(getAudio().currentTime - secs);
}

export function setVolume(v: number): void {
  getAudio().volume = Math.max(0, Math.min(1, v));
}

export function getCurrentTime(): number {
  return audioEl?.currentTime ?? 0;
}

export function getDuration(): number {
  return audioEl?.duration ?? 0;
}

export function setupMediaSessionHandlers(handlers: {
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
}): void {
  if (!("mediaSession" in navigator)) return;
  navigator.mediaSession.setActionHandler("play", handlers.onPlay);
  navigator.mediaSession.setActionHandler("pause", handlers.onPause);
  navigator.mediaSession.setActionHandler("nexttrack", handlers.onNext);
  navigator.mediaSession.setActionHandler("previoustrack", handlers.onPrev);
  navigator.mediaSession.setActionHandler("seekforward", () => seekForward());
  navigator.mediaSession.setActionHandler("seekbackward", () => seekBackward());
}
