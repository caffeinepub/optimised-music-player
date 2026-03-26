export interface Track {
  id: string;
  title: string;
  artist: string;
  filename: string;
  duration?: number;
  blobUrl?: string;
}

const DB_NAME = "MusicPlayerDB";
const DB_VERSION = 1;
const STORE_NAME = "tracks";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveTrack(file: File): Promise<Track> {
  const db = await openDB();
  const id = `track_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const nameParts = file.name.replace(/\.[^/.]+$/, "").split(" - ");
  const track: Track = {
    id,
    title: nameParts.length > 1 ? nameParts.slice(1).join(" - ") : nameParts[0],
    artist: nameParts.length > 1 ? nameParts[0] : "Unknown Artist",
    filename: file.name,
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.add({ ...track, blob: file });
    req.onsuccess = () => resolve(track);
    req.onerror = () => reject(req.error);
  });
}

export async function loadAllTracks(): Promise<Track[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => {
      const results = req.result as (Track & { blob: Blob })[];
      resolve(
        results.map(({ blob, ...meta }) => ({
          ...meta,
          blobUrl: URL.createObjectURL(blob),
        })),
      );
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteTrack(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
