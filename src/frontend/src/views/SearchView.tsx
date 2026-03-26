import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useRef } from "react";
import { TrackRow } from "../components/TrackRow";
import { usePlayerStore } from "../lib/store";

export default function SearchView() {
  const tracks = usePlayerStore((s) => s.tracks);
  const playlists = usePlayerStore((s) => s.playlists);
  const searchQuery = usePlayerStore((s) => s.searchQuery);
  const setSearchQuery = usePlayerStore((s) => s.setSearchQuery);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const q = searchQuery.toLowerCase();
  const results = q
    ? tracks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.album.toLowerCase().includes(q),
      )
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5">Search</h1>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          placeholder="Search tracks, artists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-accent border-border"
          data-ocid="search.query.input"
        />
      </div>

      {!q ? (
        <div
          className="flex flex-col items-center py-16 text-center"
          data-ocid="search.empty_state"
        >
          <Search className="h-14 w-14 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Start typing to search your library
          </p>
        </div>
      ) : results.length === 0 ? (
        <div
          className="flex flex-col items-center py-16 text-center"
          data-ocid="search.no_results.empty_state"
        >
          <p className="text-muted-foreground">
            No results for &ldquo;{searchQuery}&rdquo;
          </p>
        </div>
      ) : (
        <div className="space-y-0.5" data-ocid="search.results.list">
          <p className="text-xs text-muted-foreground mb-2">
            {results.length} result{results.length !== 1 ? "s" : ""}
          </p>
          {results.map((track, i) => (
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
