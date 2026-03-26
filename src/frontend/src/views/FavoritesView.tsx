import { Heart } from "lucide-react";
import TrackRow from "../components/TrackRow";
import { useMusicStore } from "../lib/store";

export default function FavoritesView() {
  const { tracks, favorites } = useMusicStore();
  const favTracks = tracks.filter((t) => favorites.includes(t.id));

  return (
    <div className="p-6" data-ocid="favorites.section">
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-14 h-14 rounded-lg flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #450af5, #c4efd9)" }}
        >
          <Heart size={28} fill="white" className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Liked Songs</h1>
          <p className="text-sm" style={{ color: "#b3b3b3" }}>
            {favTracks.length} song{favTracks.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      {favTracks.length === 0 ? (
        <div className="text-center py-16" data-ocid="favorites.empty_state">
          <Heart
            size={48}
            className="mx-auto mb-4"
            style={{ color: "#535353" }}
          />
          <p className="text-white font-semibold">
            Songs you like will appear here
          </p>
          <p className="text-sm mt-2" style={{ color: "#b3b3b3" }}>
            Save songs by tapping the heart icon
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          {favTracks.map((t, i) => (
            <TrackRow key={t.id} track={t} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
