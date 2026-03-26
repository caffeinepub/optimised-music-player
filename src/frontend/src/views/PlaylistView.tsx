import { ListMusic, Pencil, Trash2 } from "lucide-react";
import TrackRow from "../components/TrackRow";
import { useMusicStore } from "../lib/store";

export default function PlaylistView({ playlistId }: { playlistId: string }) {
  const { tracks, playlists, renamePlaylist, deletePlaylist, setCurrentView } =
    useMusicStore();
  const playlist = playlists.find((p) => p.id === playlistId);

  if (!playlist)
    return (
      <div className="p-6 text-center" style={{ color: "#b3b3b3" }}>
        Playlist not found
      </div>
    );

  const playlistTracks = playlist.trackIds
    .map((id) => tracks.find((t) => t.id === id))
    .filter(Boolean) as typeof tracks;

  return (
    <div className="p-6" data-ocid="playlist.section">
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "#282828" }}
        >
          <ListMusic size={28} style={{ color: "#1DB954" }} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white truncate">
            {playlist.name}
          </h1>
          <p className="text-sm" style={{ color: "#b3b3b3" }}>
            {playlistTracks.length} song{playlistTracks.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 rounded-full hover:text-white transition-colors"
            style={{ color: "#b3b3b3" }}
            onClick={() => {
              const n = prompt("New name:", playlist.name);
              if (n?.trim()) renamePlaylist(playlistId, n.trim());
            }}
            data-ocid="playlist.edit_button"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            className="p-2 rounded-full hover:text-red-400 transition-colors"
            style={{ color: "#b3b3b3" }}
            onClick={() => {
              if (confirm(`Delete "${playlist.name}"?`)) {
                deletePlaylist(playlistId);
                setCurrentView("library");
              }
            }}
            data-ocid="playlist.delete_button"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      {playlistTracks.length === 0 ? (
        <p
          className="text-center py-12"
          style={{ color: "#b3b3b3" }}
          data-ocid="playlist.empty_state"
        >
          No songs yet. Add songs from the Library.
        </p>
      ) : (
        <div className="flex flex-col">
          {playlistTracks.map((t, i) => (
            <TrackRow key={t.id} track={t} index={i} playlistId={playlistId} />
          ))}
        </div>
      )}
    </div>
  );
}
