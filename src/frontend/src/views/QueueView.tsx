import { GripVertical, X } from "lucide-react";
import { formatDuration } from "../lib/helpers";
import PlaceholderArt from "../lib/placeholderArt";
import { useMusicStore } from "../lib/store";

export default function QueueView() {
  const { queue, queueIndex, currentTrack, removeFromQueue, playTrack } =
    useMusicStore();
  const upNext = queue.slice(queueIndex + 1);

  return (
    <div className="p-6" data-ocid="queue.section">
      <h1 className="text-2xl font-bold text-white mb-6">Queue</h1>
      {currentTrack && (
        <div className="mb-6">
          <h2
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: "#1DB954" }}
          >
            Now Playing
          </h2>
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-md"
            style={{ background: "#1a1a1a" }}
          >
            <PlaceholderArt
              title={currentTrack.title}
              size={44}
              className="rounded"
            />
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-semibold truncate"
                style={{ color: "#1DB954" }}
              >
                {currentTrack.title}
              </p>
              <p className="text-xs" style={{ color: "#b3b3b3" }}>
                {currentTrack.artist}
              </p>
            </div>
            <span className="text-xs" style={{ color: "#b3b3b3" }}>
              {formatDuration(currentTrack.duration ?? 0)}
            </span>
          </div>
        </div>
      )}
      <div>
        <h2
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: "#b3b3b3" }}
        >
          Up Next ({upNext.length})
        </h2>
        {upNext.length === 0 ? (
          <p
            className="text-sm py-8 text-center"
            style={{ color: "#535353" }}
            data-ocid="queue.empty_state"
          >
            Queue is empty
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {upNext.map((track, i) => (
              <QueueItem
                key={`${track.id}-${i}`}
                track={track}
                index={i}
                onPlay={() => playTrack(track)}
                onRemove={() => removeFromQueue(queueIndex + 1 + i)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QueueItem({
  track,
  index,
  onPlay,
  onRemove,
}: {
  track: { id: string; title: string; artist: string; duration?: number };
  index: number;
  onPlay: () => void;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      className="group flex items-center gap-3 px-4 py-2 rounded-md cursor-pointer transition-colors hover:bg-[#1a1a1a] w-full text-left"
      onClick={onPlay}
      data-ocid={`queue.item.${index + 1}`}
    >
      <GripVertical
        size={14}
        style={{ color: "#535353" }}
        className="flex-shrink-0"
      />
      <PlaceholderArt title={track.title} size={36} className="rounded" />
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate text-white">{track.title}</p>
        <p className="text-xs truncate" style={{ color: "#b3b3b3" }}>
          {track.artist}
        </p>
      </div>
      <span className="text-xs" style={{ color: "#b3b3b3" }}>
        {formatDuration(track.duration ?? 0)}
      </span>
      <button
        type="button"
        className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-full transition-all"
        style={{ color: "#b3b3b3" }}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        data-ocid={`queue.delete_button.${index + 1}`}
      >
        <X size={14} />
      </button>
    </button>
  );
}
