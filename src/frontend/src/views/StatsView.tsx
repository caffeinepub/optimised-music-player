import { useMusicStore } from "../lib/store";

export default function StatsView() {
  const { tracks, playCounts, favorites, recentlyPlayed } = useMusicStore();

  const totalTracks = tracks.length;
  const uniqueArtists = new Set(tracks.map((t) => t.artist).filter(Boolean))
    .size;

  const mostPlayedTrack = tracks.reduce<{
    track: (typeof tracks)[0] | null;
    count: number;
  }>(
    (acc, t) => {
      const c = playCounts[t.id] ?? 0;
      return c > acc.count ? { track: t, count: c } : acc;
    },
    { track: null, count: 0 },
  );

  const artistCounts: Record<string, number> = {};
  for (const t of tracks) {
    if (!t.artist) continue;
    artistCounts[t.artist] =
      (artistCounts[t.artist] ?? 0) + (playCounts[t.id] ?? 0);
  }
  const topArtists = Object.entries(artistCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const likedCount = favorites.length;
  const recentCount = recentlyPlayed.length;

  const StatCard = ({
    label,
    value,
    sub,
    accent = false,
  }: {
    label: string;
    value: string | number;
    sub?: string;
    accent?: boolean;
  }) => (
    <div
      className="rounded-2xl p-5 flex flex-col gap-1"
      style={{
        background: accent
          ? "linear-gradient(135deg, #1DB954 0%, #158a3e 100%)"
          : "#1a1a1a",
        border: accent ? "none" : "1px solid #282828",
      }}
    >
      <p
        className="text-xs uppercase tracking-widest font-semibold"
        style={{ color: accent ? "rgba(0,0,0,0.6)" : "#b3b3b3" }}
      >
        {label}
      </p>
      <p
        className="text-4xl font-black tabular-nums"
        style={{ color: accent ? "#000" : "white" }}
      >
        {value}
      </p>
      {sub && (
        <p
          className="text-sm truncate"
          style={{ color: accent ? "rgba(0,0,0,0.7)" : "#b3b3b3" }}
        >
          {sub}
        </p>
      )}
    </div>
  );

  return (
    <div className="p-6" data-ocid="stats.section">
      <h1 className="text-white text-2xl font-black mb-6">Your Stats</h1>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Library" value={totalTracks} sub="tracks" accent />
        <StatCard label="Artists" value={uniqueArtists} sub="unique" />
        <StatCard label="Liked Songs" value={likedCount} sub="favorites" />
        <StatCard label="Recently Played" value={recentCount} sub="tracks" />
      </div>

      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest font-semibold text-[#b3b3b3] mb-3">
          Most Played
        </p>
        {mostPlayedTrack.track ? (
          <div
            className="rounded-2xl p-5"
            style={{
              background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
              border: "1px solid #282828",
            }}
          >
            <p className="text-white text-xl font-bold truncate">
              {mostPlayedTrack.track.title}
            </p>
            <p className="text-[#b3b3b3] text-sm">
              {mostPlayedTrack.track.artist}
            </p>
            <p
              className="text-3xl font-black mt-2"
              style={{ color: "#1DB954" }}
            >
              {mostPlayedTrack.count}
              <span className="text-base font-normal text-[#b3b3b3] ml-2">
                plays
              </span>
            </p>
          </div>
        ) : (
          <div
            className="rounded-2xl p-5"
            style={{ background: "#1a1a1a", border: "1px solid #282828" }}
            data-ocid="stats.empty_state"
          >
            <p className="text-[#535353] text-sm">
              Play some tracks to see stats
            </p>
          </div>
        )}
      </div>

      {topArtists.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-[#b3b3b3] mb-3">
            Top Artists
          </p>
          <div className="flex flex-col gap-2">
            {topArtists.map(([artist, count], i) => (
              <div
                key={artist}
                className="flex items-center gap-4 rounded-xl p-3"
                style={{ background: "#1a1a1a", border: "1px solid #282828" }}
                data-ocid={`stats.item.${i + 1}`}
              >
                <span
                  className="text-xl font-black w-8 text-center"
                  style={{ color: i === 0 ? "#1DB954" : "#535353" }}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{artist}</p>
                  <p className="text-xs text-[#b3b3b3]">{count} plays</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
