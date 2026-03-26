import { create } from "zustand";
import { persist } from "zustand/middleware";
import { audioEngine } from "./audioEngine";
import type { Track } from "./db";
import { deleteTrack, loadAllTracks, saveTrack } from "./db";

export type RepeatMode = "off" | "all" | "one";
export type ViewType =
  | "library"
  | "search"
  | "queue"
  | "favorites"
  | "recently-played"
  | "stats"
  | "smart-recently-added"
  | "smart-most-played"
  | "smart-top-50"
  | { type: "playlist"; id: string };

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
  createdAt: number;
}

interface SleepTimerState {
  active: boolean;
  remaining: number;
  intervalId?: ReturnType<typeof setInterval>;
}

export interface EQSettings {
  bass: number;
  mid: number;
  treble: number;
}

const EQ_PRESETS: Record<string, EQSettings> = {
  Normal: { bass: 0, mid: 0, treble: 0 },
  "Bass Boost": { bass: 6, mid: -2, treble: 0 },
  "Treble Boost": { bass: 0, mid: 0, treble: 6 },
  Pop: { bass: -1, mid: 3, treble: -1 },
  Rock: { bass: 4, mid: 0, treble: 3 },
  Classical: { bass: 0, mid: -2, treble: 4 },
};

export { EQ_PRESETS };

interface MusicState {
  tracks: Track[];
  queue: Track[];
  currentTrack: Track | null;
  queueIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
  favorites: string[];
  playlists: Playlist[];
  recentlyPlayed: string[];
  sleepTimer: SleepTimerState;
  voiceActive: boolean;
  currentView: ViewType;
  showNowPlaying: boolean;
  playCounts: Record<string, number>;
  eqSettings: EQSettings;
  eqPreset: string;
  crossfade: number;
  showMiniPlayer: boolean;

  loadTracks: () => Promise<void>;
  addFiles: (files: FileList) => Promise<void>;
  deleteTrackById: (id: string) => Promise<void>;
  playTrack: (track: Track) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seekTo: (t: number) => void;
  seekForward: () => void;
  seekBackward: () => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  toggleFavorite: (id: string) => void;
  createPlaylist: (name: string) => void;
  renamePlaylist: (id: string, name: string) => void;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (playlistId: string, trackId: string) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
  startSleepTimer: (minutes: number) => void;
  clearSleepTimer: () => void;
  toggleVoice: () => void;
  setCurrentView: (view: ViewType) => void;
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  handleTrackEnded: () => void;
  setShowNowPlaying: (v: boolean) => void;
  setEQBand: (band: "bass" | "mid" | "treble", gain: number) => void;
  setEQPreset: (preset: string) => void;
  setCrossfade: (s: number) => void;
  toggleMiniPlayer: () => void;
  incrementPlayCount: (id: string) => void;
}

export const useMusicStore = create<MusicState>()(
  persist(
    (set, get) => ({
      tracks: [],
      queue: [],
      currentTrack: null,
      queueIndex: -1,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      shuffle: false,
      repeat: "off",
      favorites: [],
      playlists: [],
      recentlyPlayed: [],
      sleepTimer: { active: false, remaining: 0 },
      voiceActive: false,
      currentView: "library",
      showNowPlaying: false,
      playCounts: {},
      eqSettings: { bass: 0, mid: 0, treble: 0 },
      eqPreset: "Normal",
      crossfade: 0,
      showMiniPlayer: false,

      loadTracks: async () => {
        const tracks = await loadAllTracks();
        set({ tracks });
        audioEngine.setVolume(get().volume);
      },

      addFiles: async (files) => {
        const existing = get().tracks;
        const newTracks: Track[] = [];
        for (const file of Array.from(files)) {
          if (!file.type.startsWith("audio/")) continue;
          if (existing.some((t) => t.filename === file.name)) continue;
          try {
            const track = await saveTrack(file);
            newTracks.push({ ...track, blobUrl: URL.createObjectURL(file) });
          } catch (e) {
            console.error(e);
          }
        }
        if (newTracks.length > 0)
          set((s) => ({ tracks: [...s.tracks, ...newTracks] }));
      },

      deleteTrackById: async (id) => {
        await deleteTrack(id);
        set((s) => ({
          tracks: s.tracks.filter((t) => t.id !== id),
          queue: s.queue.filter((t) => t.id !== id),
          favorites: s.favorites.filter((f) => f !== id),
          currentTrack: s.currentTrack?.id === id ? null : s.currentTrack,
        }));
      },

      incrementPlayCount: (id) =>
        set((s) => ({
          playCounts: { ...s.playCounts, [id]: (s.playCounts[id] ?? 0) + 1 },
        })),

      playTrack: (track) => {
        const { queue } = get();
        let idx = queue.findIndex((t) => t.id === track.id);
        if (idx === -1) {
          const tracks = get().tracks;
          const ti = tracks.findIndex((t) => t.id === track.id);
          const newQueue = [...tracks.slice(ti), ...tracks.slice(0, ti)];
          set({ queue: newQueue, queueIndex: 0 });
          idx = 0;
        } else {
          set({ queueIndex: idx });
        }
        if (track.blobUrl) {
          audioEngine.loadTrack(track.blobUrl);
          audioEngine.play().catch(console.error);
        }
        get().incrementPlayCount(track.id);
        set((s) => ({
          currentTrack: track,
          isPlaying: true,
          recentlyPlayed: [
            track.id,
            ...s.recentlyPlayed.filter((id) => id !== track.id),
          ].slice(0, 50),
        }));
      },

      togglePlayPause: () => {
        const { isPlaying } = get();
        if (isPlaying) {
          audioEngine.pause();
          set({ isPlaying: false });
        } else {
          audioEngine.play().catch(console.error);
          set({ isPlaying: true });
        }
      },

      nextTrack: () => {
        const { queue, queueIndex, shuffle, repeat } = get();
        if (!queue.length) return;
        let next: number;
        if (repeat === "one") next = queueIndex;
        else if (shuffle) next = Math.floor(Math.random() * queue.length);
        else {
          next = queueIndex + 1;
          if (next >= queue.length) {
            if (repeat === "all") next = 0;
            else return;
          }
        }
        const track = queue[next];
        if (track?.blobUrl) {
          audioEngine.loadTrack(track.blobUrl);
          audioEngine.play().catch(console.error);
        }
        get().incrementPlayCount(track.id);
        set((s) => ({
          currentTrack: track,
          queueIndex: next,
          isPlaying: true,
          recentlyPlayed: [
            track.id,
            ...s.recentlyPlayed.filter((id) => id !== track.id),
          ].slice(0, 50),
        }));
      },

      prevTrack: () => {
        const { queue, queueIndex, currentTime } = get();
        if (currentTime > 3) {
          audioEngine.seekTo(0);
          return;
        }
        if (!queue.length) return;
        const prev = Math.max(0, queueIndex - 1);
        const track = queue[prev];
        if (track?.blobUrl) {
          audioEngine.loadTrack(track.blobUrl);
          audioEngine.play().catch(console.error);
        }
        set({ currentTrack: track, queueIndex: prev, isPlaying: true });
      },

      seekTo: (t) => {
        audioEngine.seekTo(t);
        set({ currentTime: t });
      },
      seekForward: () => audioEngine.seekForward(10),
      seekBackward: () => audioEngine.seekBackward(10),
      setVolume: (v) => {
        audioEngine.setVolume(v);
        set({ volume: v });
      },
      toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
      cycleRepeat: () =>
        set((s) => ({
          repeat:
            s.repeat === "off" ? "all" : s.repeat === "all" ? "one" : "off",
        })),
      addToQueue: (track) => set((s) => ({ queue: [...s.queue, track] })),
      removeFromQueue: (index) =>
        set((s) => ({
          queue: s.queue.filter((_, i) => i !== index),
          queueIndex:
            index < s.queueIndex
              ? s.queueIndex - 1
              : index === s.queueIndex
                ? Math.min(s.queueIndex, s.queue.length - 2)
                : s.queueIndex,
        })),
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),
      createPlaylist: (name) =>
        set((s) => ({
          playlists: [
            ...s.playlists,
            {
              id: `pl_${Date.now()}`,
              name,
              trackIds: [],
              createdAt: Date.now(),
            },
          ],
        })),
      renamePlaylist: (id, name) =>
        set((s) => ({
          playlists: s.playlists.map((p) => (p.id === id ? { ...p, name } : p)),
        })),
      deletePlaylist: (id) =>
        set((s) => ({ playlists: s.playlists.filter((p) => p.id !== id) })),
      addToPlaylist: (plId, tId) =>
        set((s) => ({
          playlists: s.playlists.map((p) =>
            p.id === plId && !p.trackIds.includes(tId)
              ? { ...p, trackIds: [...p.trackIds, tId] }
              : p,
          ),
        })),
      removeFromPlaylist: (plId, tId) =>
        set((s) => ({
          playlists: s.playlists.map((p) =>
            p.id === plId
              ? { ...p, trackIds: p.trackIds.filter((id) => id !== tId) }
              : p,
          ),
        })),

      startSleepTimer: (minutes) => {
        const { sleepTimer } = get();
        if (sleepTimer.intervalId) clearInterval(sleepTimer.intervalId);
        const intervalId = setInterval(() => {
          const { sleepTimer: st } = get();
          if (st.remaining <= 1) {
            audioEngine.pause();
            set({
              isPlaying: false,
              sleepTimer: { active: false, remaining: 0 },
            });
            clearInterval(intervalId);
          } else {
            set((s) => ({
              sleepTimer: {
                ...s.sleepTimer,
                remaining: s.sleepTimer.remaining - 1,
              },
            }));
          }
        }, 1000);
        set({
          sleepTimer: { active: true, remaining: minutes * 60, intervalId },
        });
      },

      clearSleepTimer: () => {
        const { sleepTimer } = get();
        if (sleepTimer.intervalId) clearInterval(sleepTimer.intervalId);
        set({ sleepTimer: { active: false, remaining: 0 } });
      },

      toggleVoice: () => set((s) => ({ voiceActive: !s.voiceActive })),
      setCurrentView: (view) => set({ currentView: view }),
      setCurrentTime: (t) => set({ currentTime: t }),
      setDuration: (d) => set({ duration: d }),
      handleTrackEnded: () => {
        if (get().repeat === "one") {
          audioEngine.seekTo(0);
          audioEngine.play().catch(console.error);
        } else get().nextTrack();
      },
      setShowNowPlaying: (v) => set({ showNowPlaying: v }),

      setEQBand: (band, gain) => {
        audioEngine.setEQBand(band, gain);
        set((s) => ({
          eqSettings: { ...s.eqSettings, [band]: gain },
          eqPreset: "Custom",
        }));
      },

      setEQPreset: (preset) => {
        const settings = EQ_PRESETS[preset];
        if (!settings) return;
        audioEngine.setEQBand("bass", settings.bass);
        audioEngine.setEQBand("mid", settings.mid);
        audioEngine.setEQBand("treble", settings.treble);
        set({ eqSettings: settings, eqPreset: preset });
      },

      setCrossfade: (s) => {
        audioEngine.setCrossfade(s);
        set({ crossfade: s });
      },

      toggleMiniPlayer: () =>
        set((s) => ({ showMiniPlayer: !s.showMiniPlayer })),
    }),
    {
      name: "music-player-storage",
      partialize: (state) => ({
        volume: state.volume,
        shuffle: state.shuffle,
        repeat: state.repeat,
        favorites: state.favorites,
        playlists: state.playlists,
        recentlyPlayed: state.recentlyPlayed,
        voiceActive: state.voiceActive,
        playCounts: state.playCounts,
        eqSettings: state.eqSettings,
        eqPreset: state.eqPreset,
        crossfade: state.crossfade,
        showMiniPlayer: state.showMiniPlayer,
      }),
    },
  ),
);
