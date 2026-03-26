export interface Chapter {
  id: string;
  title: string;
  time: number; // seconds
}

const PREFIX = "omp-chapters-";

export function getChapters(trackId: string): Chapter[] {
  try {
    const raw = localStorage.getItem(PREFIX + trackId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveChapters(trackId: string, chapters: Chapter[]): void {
  localStorage.setItem(PREFIX + trackId, JSON.stringify(chapters));
}

export function addChapter(trackId: string, title: string, time: number): void {
  const chapters = getChapters(trackId);
  chapters.push({ id: crypto.randomUUID(), title, time });
  chapters.sort((a, b) => a.time - b.time);
  saveChapters(trackId, chapters);
}

export function removeChapter(trackId: string, chapterId: string): void {
  const chapters = getChapters(trackId).filter((c) => c.id !== chapterId);
  saveChapters(trackId, chapters);
}
