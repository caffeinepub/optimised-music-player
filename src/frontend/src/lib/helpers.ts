export function formatDuration(seconds: number): string {
  if (!seconds || Number.isNaN(seconds) || !Number.isFinite(seconds))
    return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function parseFilename(filename: string): {
  title: string;
  artist: string;
} {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  if (nameWithoutExt.includes(" - ")) {
    const idx = nameWithoutExt.indexOf(" - ");
    const artist = nameWithoutExt.slice(0, idx).trim();
    const title = nameWithoutExt.slice(idx + 3).trim();
    return { title, artist };
  }
  return { title: nameWithoutExt, artist: "Unknown Artist" };
}

export function getDurationFromFile(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.addEventListener("loadedmetadata", () => {
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(audio.duration) ? audio.duration : 0);
    });
    audio.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      resolve(0);
    });
    audio.src = url;
  });
}
