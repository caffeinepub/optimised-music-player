import { useEffect, useState } from "react";
import { getLyrics, setLyrics } from "../lib/lyrics";
import { useMusicStore } from "../lib/store";

export default function LyricsPanel() {
  const { currentTrack } = useMusicStore();
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const trackId = currentTrack?.id;

  useEffect(() => {
    if (trackId) {
      setText(getLyrics(trackId));
    } else {
      setText("");
    }
    setSaved(false);
  }, [trackId]);

  const handleSave = () => {
    if (!currentTrack) return;
    setLyrics(currentTrack.id, text);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full p-4 gap-3" data-ocid="lyrics.panel">
      <div
        className="flex-1 overflow-y-auto rounded-lg p-3 min-h-0"
        style={{ background: "rgba(0,0,0,0.3)" }}
      >
        {text ? (
          <pre className="text-white text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {text}
          </pre>
        ) : (
          <p className="text-[#535353] text-sm italic">
            No lyrics yet — paste them below
          </p>
        )}
      </div>
      {currentTrack && (
        <div className="flex flex-col gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste lyrics here..."
            rows={4}
            className="w-full rounded-lg p-3 text-sm text-white resize-none outline-none"
            style={{
              background: "#404040",
              border: "1px solid #535353",
            }}
            data-ocid="lyrics.textarea"
          />
          <button
            type="button"
            onClick={handleSave}
            className="py-2 px-4 rounded-lg text-sm font-medium transition-colors self-end"
            style={{ background: saved ? "#158a3e" : "#1DB954", color: "#000" }}
            data-ocid="lyrics.save_button"
          >
            {saved ? "Saved!" : "Save Lyrics"}
          </button>
        </div>
      )}
    </div>
  );
}
