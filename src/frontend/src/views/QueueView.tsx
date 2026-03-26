import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GripVertical, List, X } from "lucide-react";
import { useState } from "react";
import { formatDuration } from "../lib/helpers";
import { PlaceholderArt } from "../lib/placeholderArt";
import { usePlayerStore } from "../lib/store";

export default function QueueView() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const queue = usePlayerStore((s) => s.queue);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);
  const reorderQueue = usePlayerStore((s) => s.reorderQueue);
  const clearQueue = usePlayerStore((s) => s.clearQueue);

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (i: number) => setDragIndex(i);
  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    setDragOverIndex(i);
  };
  const handleDrop = (toIndex: number) => {
    if (dragIndex !== null && dragIndex !== toIndex) {
      reorderQueue(dragIndex, toIndex);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };
  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <List className="h-6 w-6" />
          Queue
        </h1>
        {queue.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearQueue}
            data-ocid="queue.clear.button"
            className="text-muted-foreground hover:text-foreground"
          >
            Clear Queue
          </Button>
        )}
      </div>

      {/* Now Playing */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Now Playing
        </h2>
        {currentTrack ? (
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-md bg-accent border-l-2 border-primary"
            data-ocid="queue.now_playing.panel"
          >
            <PlaceholderArt title={currentTrack.title} size={44} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary truncate">
                {currentTrack.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {currentTrack.artist}
              </p>
            </div>
            {isPlaying && (
              <div className="flex items-end gap-[2px] h-4">
                <div className="eq-bar h-full" />
                <div className="eq-bar h-full" />
                <div className="eq-bar h-full" />
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground px-3">Nothing playing</p>
        )}
      </div>

      {/* Up Next */}
      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Up Next
        </h2>
        {queue.length === 0 ? (
          <div
            className="flex flex-col items-center py-12 text-center"
            data-ocid="queue.empty_state"
          >
            <List className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Queue is empty</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add songs via the track menu
            </p>
          </div>
        ) : (
          <div className="space-y-0.5" data-ocid="queue.list">
            {queue.map((track, i) => (
              <div
                key={`${track.id}-${i}`}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDrop={() => handleDrop(i)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "flex items-center gap-3 px-2 py-2 rounded-md cursor-grab active:cursor-grabbing transition-colors",
                  dragOverIndex === i ? "bg-primary/20" : "hover:bg-accent/60",
                  dragIndex === i ? "opacity-50" : "",
                )}
                data-ocid={`queue.item.${i + 1}`}
              >
                <div
                  className="text-muted-foreground hover:text-foreground flex-shrink-0"
                  data-ocid={`queue.drag_handle.${i + 1}`}
                >
                  <GripVertical className="h-4 w-4" />
                </div>
                <PlaceholderArt title={track.title} size={36} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{track.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {track.artist}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0 hidden sm:block">
                  {formatDuration(track.duration)}
                </span>
                <button
                  type="button"
                  data-ocid={`queue.remove.button.${i + 1}`}
                  onClick={() => removeFromQueue(i)}
                  className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
