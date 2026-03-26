import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as audioEngine from "./audioEngine";
import { deleteTrack as dbDeleteTrack, getAllTracks } from "./db";
import type { Track } from "./db";
import {
  clearSleepTimer as clearSleepTimerUtil,
  startSleepTimer,
} from "./sleepTimer";

export type { Track };

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
  createdAt: number;
}

export type RepeatMode = "off" | "all" | "one";
export type ActiveView =
  | "library"
  | "favorites"
  | "queue"
  | "search"
  | `playlist-${string}`;

interface SleepTimerState {
  active: boolean;
  remaining: number;
}

export interface PlayerStore {
  // State
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
  queue: Track[];
  playlists: Playlist[];
  favorites: string[];
  activeView: ActiveView;
  searchQuery: string;
  sidebarOpen: boolean;
  sleepTimer: SleepTimerState | null;
  voiceActive: boolean;

  // Actions
  loadTracks: () => Promise<void>;
  playTrack: (track: Track) => Promise<void>;
  togglePlayPause: () => void;
  pause: () => void;
  resume: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  handleTrackEnded: () => void;
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  seekForward: () => void;
  seekBackward: () => void;
  seekTo: (seconds: number) => void;
  addToQueue: (track: Track) => void;
  playNext: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
  toggleFavorite: (trackId: string) => void;
  createPlaylist: (name: string) => void;
  renamePlaylist: (id: string, name: string) => void;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, trackId: string) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  deleteTrack: (id: string) => Promise<void>;
  setActiveView: (view: ActiveView) => void;
  setSearchQuery: (q: string) => void;
  setSidebarOpen: (open: boolean) => void;
  startSleepTimerAction: (minutes: number) => void;
  clearSleepTimerAction: () => void;
  toggleVoice: () => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      // Initial state
      tracks: [],
      currentTrack: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      shuffle: false,
      repeat: "off",
      queue: [],
      playlists: [],
      favorites: [],
      activeView: "library",
      searchQuery: "",
      sidebarOpen: false,
      sleepTimer: null,
      voiceActive: false,

      loadTracks: async () => {
        const tracks = await getAllTracks();
        const sorted = [...tracks].sort((a, b) => b.addedAt - a.addedAt);
        const trackIds = new Set(sorted.map((t) => t.id));
        const { currentTrack, queue, favorites, playlists } = get();

        // Clean up stale refs
        const cleanQueue = queue.filter((t) => trackIds.has(t.id));
        const cleanFavs = favorites.filter((id) => trackIds.has(id));
        const cleanPlaylists = playlists.map((p) => ({
          ...p,
          trackIds: p.trackIds.filter((id) => trackIds.has(id)),
        }));

        set({
          tracks: sorted,
          queue: cleanQueue,
          favorites: cleanFavs,
          playlists: cleanPlaylists,
        });

        if (currentTrack && !trackIds.has(currentTrack.id)) {
          audioEngine.pause();
          set({ currentTrack: null, isPlaying: false });
        }
      },

      playTrack: async (track: Track) => {
        set({
          currentTrack: track,
          currentTime: 0,
          duration: 0,
          isPlaying: false,
        });
        try {
          await audioEngine.play(track.id, track.title, track.artist);
          audioEngine.setVolume(get().volume);
          set({ isPlaying: true });
        } catch (err) {
          console.error(err);
          set({ isPlaying: false });
          toast.error(`Cannot play "${track.title}"`);
        }
      },

      togglePlayPause: () => {
        const { isPlaying, currentTrack, tracks } = get();
        if (!currentTrack) {
          if (tracks.length > 0) get().playTrack(tracks[0]);
          return;
        }
        if (isPlaying) {
          audioEngine.pause();
          set({ isPlaying: false });
        } else {
          audioEngine.resume();
          set({ isPlaying: true });
        }
      },

      pause: () => {
        audioEngine.pause();
        set({ isPlaying: false });
      },

      resume: () => {
        const { currentTrack, tracks } = get();
        if (!currentTrack && tracks.length > 0) {
          get().playTrack(tracks[0]);
          return;
        }
        audioEngine.resume();
        set({ isPlaying: true });
      },

      nextTrack: () => {
        const { queue, tracks, currentTrack, shuffle, repeat } = get();
        if (repeat === "one" && currentTrack) {
          get().playTrack(currentTrack);
          return;
        }
        if (queue.length > 0) {
          const [next, ...rest] = queue;
          set({ queue: rest });
          get().playTrack(next);
          return;
        }
        if (tracks.length === 0) return;
        if (shuffle) {
          const idx = Math.floor(Math.random() * tracks.length);
          get().playTrack(tracks[idx]);
          return;
        }
        const idx = currentTrack
          ? tracks.findIndex((t) => t.id === currentTrack.id)
          : -1;
        const next = idx + 1;
        if (next >= tracks.length) {
          if (repeat === "all") get().playTrack(tracks[0]);
          else set({ isPlaying: false });
        } else {
          get().playTrack(tracks[next]);
        }
      },

      prevTrack: () => {
        const { tracks, currentTrack, currentTime, repeat } = get();
        if (currentTime > 3) {
          audioEngine.seek(0);
          return;
        }
        if (!currentTrack || tracks.length === 0) return;
        const idx = tracks.findIndex((t) => t.id === currentTrack.id);
        const prev = idx - 1;
        if (prev < 0) {
          if (repeat === "all") get().playTrack(tracks[tracks.length - 1]);
          else audioEngine.seek(0);
        } else {
          get().playTrack(tracks[prev]);
        }
      },

      handleTrackEnded: () => {
        get().nextTrack();
      },

      setCurrentTime: (t) => set({ currentTime: t }),
      setDuration: (d) => set({ duration: d }),

      setVolume: (v) => {
        audioEngine.setVolume(v);
        set({ volume: v });
      },

      toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),

      cycleRepeat: () => {
        const order: RepeatMode[] = ["off", "all", "one"];
        const cur = get().repeat;
        const next = order[(order.indexOf(cur) + 1) % order.length];
        set({ repeat: next });
      },

      seekForward: () => audioEngine.seekForward(),
      seekBackward: () => audioEngine.seekBackward(),
      seekTo: (s) => audioEngine.seek(s),

      addToQueue: (track) => {
        set((state) => ({ queue: [...state.queue, track] }));
        toast.success(`Added "${track.title}" to queue`);
      },

      playNext: (track) => {
        set((state) => ({ queue: [track, ...state.queue] }));
        toast.success(`"${track.title}" plays next`);
      },

      removeFromQueue: (index) => {
        set((state) => ({ queue: state.queue.filter((_, i) => i !== index) }));
      },

      reorderQueue: (fromIndex, toIndex) => {
        set((state) => {
          const q = [...state.queue];
          const [item] = q.splice(fromIndex, 1);
          q.splice(toIndex, 0, item);
          return { queue: q };
        });
      },

      clearQueue: () => set({ queue: [] }),

      toggleFavorite: (trackId) => {
        set((state) => ({
          favorites: state.favorites.includes(trackId)
            ? state.favorites.filter((id) => id !== trackId)
            : [...state.favorites, trackId],
        }));
      },

      createPlaylist: (name) => {
        const playlist: Playlist = {
          id: crypto.randomUUID(),
          name,
          trackIds: [],
          createdAt: Date.now(),
        };
        set((state) => ({ playlists: [...state.playlists, playlist] }));
      },

      renamePlaylist: (id, name) => {
        set((state) => ({
          playlists: state.playlists.map((p) =>
            p.id === id ? { ...p, name } : p,
          ),
        }));
      },

      deletePlaylist: (id) => {
        set((state) => ({
          playlists: state.playlists.filter((p) => p.id !== id),
        }));
        const { activeView } = get();
        if (activeView === `playlist-${id}`) set({ activeView: "library" });
      },

      addTrackToPlaylist: (playlistId, trackId) => {
        set((state) => ({
          playlists: state.playlists.map((p) =>
            p.id === playlistId && !p.trackIds.includes(trackId)
              ? { ...p, trackIds: [...p.trackIds, trackId] }
              : p,
          ),
        }));
      },

      removeTrackFromPlaylist: (playlistId, trackId) => {
        set((state) => ({
          playlists: state.playlists.map((p) =>
            p.id === playlistId
              ? { ...p, trackIds: p.trackIds.filter((id) => id !== trackId) }
              : p,
          ),
        }));
      },

      deleteTrack: async (id) => {
        const { currentTrack } = get();
        if (currentTrack?.id === id) {
          audioEngine.pause();
          set({ currentTrack: null, isPlaying: false, currentTime: 0 });
        }
        await dbDeleteTrack(id);
        set((state) => ({
          tracks: state.tracks.filter((t) => t.id !== id),
          queue: state.queue.filter((t) => t.id !== id),
          favorites: state.favorites.filter((f) => f !== id),
          playlists: state.playlists.map((p) => ({
            ...p,
            trackIds: p.trackIds.filter((tid) => tid !== id),
          })),
        }));
        toast.success("Track removed");
      },

      setActiveView: (view) => set({ activeView: view }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      startSleepTimerAction: (minutes) => {
        startSleepTimer(
          minutes,
          () => {
            get().pause();
            set({ sleepTimer: null });
            toast.info("Sleep timer ended — playback stopped");
          },
          (remaining) => {
            set({ sleepTimer: { active: true, remaining } });
          },
        );
        toast.success(`Sleep timer set for ${minutes} minutes`);
      },

      clearSleepTimerAction: () => {
        clearSleepTimerUtil();
        set({ sleepTimer: null });
      },

      toggleVoice: () => {
        set((state) => ({ voiceActive: !state.voiceActive }));
      },
    }),
    {
      name: "omp-state",
      partialize: (state) => ({
        volume: state.volume,
        shuffle: state.shuffle,
        repeat: state.repeat,
        queue: state.queue,
        playlists: state.playlists,
        favorites: state.favorites,
      }),
    },
  ),
);
