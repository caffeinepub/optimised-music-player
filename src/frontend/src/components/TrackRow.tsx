import { Heart, Play, Plus, Trash2 } from "lucide-react";
import type { Track } from "../lib/db";
import { formatDuration } from "../lib/helpers";
import PlaceholderArt from "../lib/placeholderArt";
import { useMusicStore } from "../lib/store";

interface TrackRowProps {
  track: Track;
  index?: number;
  showDelete?: boolean;
  onDelete?: (id: string) => void;
  playlistId?: string;
}

export default function TrackRow({
  track,
  index = 0,
  showDelete = false,
  onDelete,
  playlistId,
}: TrackRowProps) {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    toggleFavorite,
    favorites,
    addToQueue,
    removeFromPlaylist,
    setShowNowPlaying,
  } = useMusicStore();
  const isCurrentTrack = currentTrack?.id === track.id;
  const isFav = favorites.includes(track.id);

  return (
    <button
      type="button"
      className="group flex items-center gap-3 px-4 py-2 rounded-md cursor-pointer transition-colors hover:bg-[#1a1a1a] w-full text-left"
      style={{ background: isCurrentTrack ? "#282828" : "transparent" }}
      onClick={() => playTrack(track)}
      data-ocid={`track.item.${index + 1}`}
    >
      <div
        className="w-6 flex items-center justify-center flex-shrink-0 text-sm"
        style={{ color: isCurrentTrack ? "#1DB954" : "#b3b3b3" }}
      >
        {isCurrentTrack && isPlaying ? (
          <span style={{ color: "#1DB954" }}>▶</span>
        ) : (
          <span className="group-hover:hidden">{index + 1}</span>
        )}
        <Play
          size={14}
          className="hidden group-hover:block"
          style={{ color: isCurrentTrack ? "#1DB954" : "white" }}
        />
      </div>
      <button
        type="button"
        className="flex-shrink-0 rounded focus:outline-none"
        onClick={(e) => {
          e.stopPropagation();
          playTrack(track);
          setShowNowPlaying(true);
        }}
        data-ocid={`track.open_modal_button.${index + 1}`}
        title="Open Now Playing"
      >
        <PlaceholderArt title={track.title} size={40} className="rounded" />
      </button>
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{ color: isCurrentTrack ? "#1DB954" : "white" }}
        >
          {track.title}
        </p>
        <p className="text-xs truncate" style={{ color: "#b3b3b3" }}>
          {track.artist}
        </p>
      </div>
      <span
        className="text-xs tabular-nums flex-shrink-0"
        style={{ color: "#b3b3b3" }}
      >
        {formatDuration(track.duration ?? 0)}
      </span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          className="w-7 h-7 flex items-center justify-center rounded-full hover:text-white transition-colors"
          style={{ color: isFav ? "#1DB954" : "#b3b3b3" }}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(track.id);
          }}
          data-ocid={`track.toggle.${index + 1}`}
        >
          <Heart size={14} fill={isFav ? "currentColor" : "none"} />
        </button>
        <button
          type="button"
          className="w-7 h-7 flex items-center justify-center rounded-full hover:text-white transition-colors"
          style={{ color: "#b3b3b3" }}
          onClick={(e) => {
            e.stopPropagation();
            addToQueue(track);
          }}
          title="Add to queue"
          data-ocid={`track.secondary_button.${index + 1}`}
        >
          <Plus size={14} />
        </button>
        {showDelete && onDelete && (
          <button
            type="button"
            className="w-7 h-7 flex items-center justify-center rounded-full hover:text-red-400 transition-colors"
            style={{ color: "#b3b3b3" }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(track.id);
            }}
            data-ocid={`track.delete_button.${index + 1}`}
          >
            <Trash2 size={14} />
          </button>
        )}
        {playlistId && (
          <button
            type="button"
            className="w-7 h-7 flex items-center justify-center rounded-full hover:text-red-400 transition-colors"
            style={{ color: "#b3b3b3" }}
            onClick={(e) => {
              e.stopPropagation();
              removeFromPlaylist(playlistId, track.id);
            }}
            data-ocid={`track.delete_button.${index + 1}`}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </button>
  );
}
