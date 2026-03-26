const DB_NAME = "optimised-music-player";
const DB_VERSION = 1;
const TRACKS_STORE = "tracks";
const BLOBS_STORE = "audioBlobs";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  size: number;
  mimeType: string;
  addedAt: number;
}

let dbInstance: IDBDatabase | null = null;

export function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(TRACKS_STORE)) {
        db.createObjectStore(TRACKS_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(BLOBS_STORE)) {
        db.createObjectStore(BLOBS_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = (e) => {
      dbInstance = (e.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };
    req.onerror = (e) => reject((e.target as IDBOpenDBRequest).error);
  });
}

export async function addTrack(meta: Track, blob: ArrayBuffer): Promise<void> {
  const db = await initDB();
  // Duplicate check
  const existing = await getAllTracks();
  if (existing.some((t) => t.title === meta.title && t.size === meta.size)) {
    throw new Error(`DUPLICATE:${meta.title}`);
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction([TRACKS_STORE, BLOBS_STORE], "readwrite");
    tx.objectStore(TRACKS_STORE).put(meta);
    tx.objectStore(BLOBS_STORE).put({ id: meta.id, data: blob });
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject((e.target as IDBTransaction).error);
  });
}

export async function getAllTracks(): Promise<Track[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TRACKS_STORE, "readonly");
    const req = tx.objectStore(TRACKS_STORE).getAll();
    req.onsuccess = () => resolve((req.result as Track[]) || []);
    req.onerror = (e) => reject((e.target as IDBRequest).error);
  });
}

export async function getAudioBlob(id: string): Promise<ArrayBuffer | null> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BLOBS_STORE, "readonly");
    const req = tx.objectStore(BLOBS_STORE).get(id);
    req.onsuccess = () => resolve(req.result?.data ?? null);
    req.onerror = (e) => reject((e.target as IDBRequest).error);
  });
}

export async function deleteTrack(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([TRACKS_STORE, BLOBS_STORE], "readwrite");
    tx.objectStore(TRACKS_STORE).delete(id);
    tx.objectStore(BLOBS_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject((e.target as IDBTransaction).error);
  });
}

export async function clearAll(): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([TRACKS_STORE, BLOBS_STORE], "readwrite");
    tx.objectStore(TRACKS_STORE).clear();
    tx.objectStore(BLOBS_STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject((e.target as IDBTransaction).error);
  });
}
