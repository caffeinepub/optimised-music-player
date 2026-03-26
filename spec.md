# Optimised Music Player

## Current State
New project. Empty backend scaffold only.

## Requested Changes (Diff)

### Add
- Full music player SPA with Spotify-inspired dark UI (#121212 bg, #181818 secondary, #1DB954 accent)
- Audio playback: play/pause, next/prev, seek ±10s, real-time progress bar, volume control
- Shuffle mode and repeat modes (off / repeat-all / repeat-one)
- Advanced queue: now-playing + up-next, add to queue, play next (priority insert), remove/reorder
- File upload via file picker and drag-and-drop (MP3, WAV, FLAC, OGG, M4A, AAC)
- IndexedDB persistence: store audio blobs and metadata; load on startup
- Duplicate prevention by filename+size hash
- Searchable music library (filter by title/artist)
- Playlist management: create, rename, delete, add/remove songs
- Favorites system with dedicated section (heart icon per track)
- Sleep timer: stop playback after selected duration (15/30/45/60 min or custom)
- Media Session API: notification controls, lock screen, hardware buttons
- Voice assistant (Web Speech API, English only): play, pause, next, previous commands
- localStorage persistence: queue state, playlists, favorites, settings (volume, shuffle, repeat)
- Generated placeholder album art: colored background + music note SVG, color derived from song title hash
- Responsive layout: sidebar + main content + sticky bottom player bar
- Mobile: collapsible sidebar, touch-friendly controls
- Smooth animations, hover effects, active track highlighting, glassmorphism accents

### Modify
- Nothing (new project)

### Remove
- Nothing

## Implementation Plan
1. Minimal Motoko backend (no real backend logic needed; app is fully client-side)
2. React frontend with these modules:
   - `db.ts` – IndexedDB wrapper (tracks store, audio blob store)
   - `store.ts` – Zustand-like state (or useReducer) for player, queue, playlists, favorites
   - `AudioEngine.ts` – HTMLAudioElement wrapper with Media Session API integration
   - `VoiceAssistant.ts` – Web Speech API wrapper, English commands
   - `SleepTimer.ts` – countdown timer utility
   - `PlaceholderArt.tsx` – SVG canvas-based colored placeholder from title hash
   - Layout: `Sidebar`, `MainContent`, `PlayerBar` components
   - Views: `LibraryView`, `FavoritesView`, `PlaylistView`, `QueueView`, `SearchView`
3. Tailwind custom theme with Spotify colors
4. localStorage sync for queue, playlists, favorites, settings
