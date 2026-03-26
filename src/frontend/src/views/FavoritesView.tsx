import { Heart } from "lucide-react";
import { TrackRow } from "../components/TrackRow";
import { usePlayerStore } from "../lib/store";

export default function FavoritesView() {
  const tracks = usePlayerStore((s) => s.tracks);
  const favorites = usePlayerStore((s) => s.favorites);
  const playlists = usePlayerStore((s) => s.playlists);
  const playTrack = usePlayerStore((s) => s.playTrack);

  const favTracks = tracks.filter((t) => favorites.includes(t.id));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary" fill="currentColor" />
          Favorites
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {favTracks.length} track{favTracks.length !== 1 ? "s" : ""}
        </p>
      </div>

      {favTracks.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-24 text-center"
          data-ocid="favorites.empty_state"
        >
          <Heart className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
          <p className="text-muted-foreground">
            Click the heart icon on any track to add it here.
          </p>
        </div>
      ) : (
        <div className="space-y-0.5" data-ocid="favorites.list">
          {favTracks.map((track, i) => (
            <TrackRow
              key={track.id}
              track={track}
              index={i + 1}
              playlists={playlists}
              onPlay={() => playTrack(track)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
