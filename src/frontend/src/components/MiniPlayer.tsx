import { Pause, Play, SkipForward, X } from "lucide-react";
import PlaceholderArt from "../lib/placeholderArt";
import { useMusicStore } from "../lib/store";

export default function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    showMiniPlayer,
    togglePlayPause,
    nextTrack,
    toggleMiniPlayer,
  } = useMusicStore();

  if (!showMiniPlayer || !currentTrack) return null;

  return (
    <div
      className="fixed flex items-center gap-3 rounded-2xl px-3 py-2 shadow-2xl z-50"
      style={{
        bottom: 80,
        right: 16,
        background: "rgba(16,12,32,0.95)",
        border: "1px solid rgba(139,92,246,0.4)",
        backdropFilter: "blur(20px)",
        minWidth: 240,
        maxWidth: 300,
        boxShadow:
          "0 8px 32px rgba(139,92,246,0.3), 0 0 0 1px rgba(236,72,153,0.1)",
      }}
      data-ocid="mini_player.panel"
    >
      <PlaceholderArt
        title={currentTrack.title}
        size={44}
        className="rounded-xl flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold truncate"
          style={{
            background: "linear-gradient(90deg, #fff, #d8b4fe)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {currentTrack.title}
        </p>
        <p
          className="text-xs truncate"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          {currentTrack.artist}
        </p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          type="button"
          className="w-9 h-9 flex items-center justify-center rounded-full transition-all hover:scale-110 active:scale-90"
          style={{
            background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
            color: "white",
          }}
          onClick={togglePlayPause}
          data-ocid="mini_player.primary_button"
        >
          {isPlaying ? <Pause size={15} /> : <Play size={15} />}
        </button>
        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          style={{ color: "rgba(255,255,255,0.5)" }}
          onClick={nextTrack}
          data-ocid="mini_player.secondary_button"
        >
          <SkipForward size={15} />
        </button>
        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          style={{ color: "rgba(255,255,255,0.4)" }}
          onClick={toggleMiniPlayer}
          data-ocid="mini_player.close_button"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
