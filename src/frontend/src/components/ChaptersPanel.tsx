import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  type Chapter,
  addChapter,
  getChapters,
  removeChapter,
} from "../lib/chapters";
import { formatDuration } from "../lib/helpers";
import { useMusicStore } from "../lib/store";

export default function ChaptersPanel() {
  const { currentTrack, currentTime, seekTo } = useMusicStore();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const trackId = currentTrack?.id;

  const reload = useCallback(() => {
    if (trackId) setChapters(getChapters(trackId));
    else setChapters([]);
  }, [trackId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleAdd = () => {
    if (!currentTrack || !newTitle.trim()) return;
    addChapter(currentTrack.id, newTitle.trim(), Math.floor(currentTime));
    setNewTitle("");
    reload();
  };

  const handleRemove = (chapterId: string) => {
    if (!currentTrack) return;
    removeChapter(currentTrack.id, chapterId);
    reload();
  };

  return (
    <div className="flex flex-col h-full p-4 gap-3" data-ocid="chapters.panel">
      <div className="flex-1 overflow-y-auto min-h-0">
        {chapters.length === 0 ? (
          <p className="text-[#535353] text-sm italic">
            No chapters yet — add one below
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {chapters.map((ch, i) => (
              <button
                key={ch.id}
                type="button"
                className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors w-full text-left"
                onClick={() => seekTo(ch.time)}
                data-ocid={`chapters.item.${i + 1}`}
              >
                <span
                  className="text-xs tabular-nums font-mono flex-shrink-0"
                  style={{ color: "#1DB954", minWidth: 40 }}
                >
                  {formatDuration(ch.time)}
                </span>
                <span className="text-sm text-white flex-1 truncate">
                  {ch.title}
                </span>
                <button
                  type="button"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[#b3b3b3] hover:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(ch.id);
                  }}
                  data-ocid={`chapters.delete_button.${i + 1}`}
                >
                  <Trash2 size={14} />
                </button>
              </button>
            ))}
          </div>
        )}
      </div>
      {currentTrack && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder={`Add chapter at ${formatDuration(Math.floor(currentTime))}`}
            className="flex-1 rounded-lg px-3 py-2 text-sm text-white outline-none"
            style={{ background: "#404040", border: "1px solid #535353" }}
            data-ocid="chapters.input"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ background: "#1DB954", color: "#000" }}
            data-ocid="chapters.add_button"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}
