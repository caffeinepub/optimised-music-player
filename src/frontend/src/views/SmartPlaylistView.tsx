import TrackRow from "../components/TrackRow";
import { useMusicStore } from "../lib/store";

interface SmartPlaylistViewProps {
  mode: "recently-added" | "most-played" | "top-50";
}

export default function SmartPlaylistView({ mode }: SmartPlaylistViewProps) {
  const { tracks, playCounts } = useMusicStore();

  const sortedTracks = (() => {
    switch (mode) {
      case "recently-added":
        return [...tracks].reverse();
      case "most-played":
        return [...tracks].sort(
          (a, b) => (playCounts[b.id] ?? 0) - (playCounts[a.id] ?? 0),
        );
      case "top-50":
        return [...tracks]
          .sort((a, b) => (playCounts[b.id] ?? 0) - (playCounts[a.id] ?? 0))
          .slice(0, 50);
      default:
        return tracks;
    }
  })();

  const titles: Record<SmartPlaylistViewProps["mode"], string> = {
    "recently-added": "Recently Added",
    "most-played": "Most Played",
    "top-50": "Top 50",
  };

  return (
    <div className="p-4" data-ocid="smart_playlist.section">
      <h1 className="text-white text-2xl font-black mb-4 px-2">
        {titles[mode]}
      </h1>
      {sortedTracks.length === 0 ? (
        <p
          className="text-[#535353] px-2"
          data-ocid="smart_playlist.empty_state"
        >
          No tracks yet — upload some music!
        </p>
      ) : (
        <div className="flex flex-col">
          {sortedTracks.map((track, i) => (
            <TrackRow key={track.id} track={track} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
