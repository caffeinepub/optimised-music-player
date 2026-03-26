const PREFIX = "omp-lyrics-";

export function getLyrics(trackId: string): string {
  return localStorage.getItem(PREFIX + trackId) ?? "";
}

export function setLyrics(trackId: string, text: string): void {
  if (text.trim()) {
    localStorage.setItem(PREFIX + trackId, text);
  } else {
    localStorage.removeItem(PREFIX + trackId);
  }
}
