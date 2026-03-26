import {
  Heart,
  Mic,
  MicOff,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  Timer,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useState } from "react";
import { formatDuration, formatTimer } from "../lib/helpers";
import PlaceholderArt from "../lib/placeholderArt";
import { useMusicStore } from "../lib/store";
import EqualizerPanel from "./EqualizerPanel";

export default function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    shuffle,
    repeat,
    favorites,
    sleepTimer,
    voiceActive,
    togglePlayPause,
    nextTrack,
    prevTrack,
    seekTo,
    setVolume,
    toggleShuffle,
    cycleRepeat,
    toggleFavorite,
    startSleepTimer,
    clearSleepTimer,
    toggleVoice,
    setShowNowPlaying,
  } = useMusicStore();

  const [showTimer, setShowTimer] = useState(false);
  const [customMin, setCustomMin] = useState("");
  const [showVol, setShowVol] = useState(false);
  const [showEQ, setShowEQ] = useState(false);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isFav = currentTrack ? favorites.includes(currentTrack.id) : false;

  const iconBtn = (active = false) =>
    `flex items-center justify-center w-11 h-11 rounded-full transition-all ${
      active
        ? "text-purple-400"
        : "text-white/50 hover:text-white hover:bg-white/10"
    }`;

  return (
    <div
      className="relative flex-shrink-0"
      style={{
        background: "rgba(10,10,20,0.97)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(139,92,246,0.3)",
        zIndex: 40,
      }}
    >
      {/* Gradient top border accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background:
            "linear-gradient(90deg, #8B5CF6, #EC4899, #06B6D4, #8B5CF6)",
          backgroundSize: "200% 100%",
        }}
      />

      {showTimer && (
        <div
          className="absolute bottom-full right-4 mb-2 rounded-xl shadow-2xl p-4 w-56 z-50"
          style={{
            background: "rgba(20,15,40,0.97)",
            border: "1px solid rgba(139,92,246,0.4)",
            backdropFilter: "blur(20px)",
          }}
        >
          <p className="text-white text-sm font-semibold mb-3">Sleep Timer</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[15, 30, 45, 60].map((min) => (
              <button
                type="button"
                key={min}
                className="py-2 text-sm rounded-lg font-medium transition-all hover:scale-105 active:scale-95"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.3))",
                  border: "1px solid rgba(139,92,246,0.4)",
                  color: "#fff",
                }}
                onClick={() => {
                  startSleepTimer(min);
                  setShowTimer(false);
                }}
                data-ocid="timer.button"
              >
                {min} min
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Custom min"
              value={customMin}
              onChange={(e) => setCustomMin(e.target.value)}
              className="flex-1 px-2 py-1.5 text-sm rounded-lg text-white outline-none"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(139,92,246,0.3)",
              }}
              data-ocid="timer.input"
            />
            <button
              type="button"
              className="px-3 py-1.5 text-sm rounded-lg font-medium transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
                color: "#fff",
              }}
              onClick={() => {
                const m = Number.parseInt(customMin);
                if (m > 0) {
                  startSleepTimer(m);
                  setShowTimer(false);
                  setCustomMin("");
                }
              }}
              data-ocid="timer.submit_button"
            >
              Set
            </button>
          </div>
        </div>
      )}

      <EqualizerPanel open={showEQ} onClose={() => setShowEQ(false)} />

      {/* Mobile layout: stacked rows */}
      <div className="flex flex-col px-2 pt-2 pb-2 md:hidden">
        {/* Row 1: Track info + heart + utility icons */}
        <div className="flex items-center gap-2 w-full min-w-0 mb-1">
          <button
            type="button"
            className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer rounded-lg hover:bg-white/5 transition-colors px-1 py-1"
            onClick={() => currentTrack && setShowNowPlaying(true)}
            data-ocid="player.open_modal_button"
          >
            {currentTrack ? (
              <PlaceholderArt
                title={currentTrack.title}
                size={36}
                className="rounded-lg flex-shrink-0"
              />
            ) : (
              <div
                className="w-9 h-9 rounded-lg flex-shrink-0"
                style={{ background: "rgba(139,92,246,0.2)" }}
              />
            )}
            <div className="min-w-0 flex-1">
              <p
                className="text-sm font-semibold truncate leading-tight"
                style={{
                  background: currentTrack
                    ? "linear-gradient(90deg, #fff, #d8b4fe)"
                    : "none",
                  WebkitBackgroundClip: currentTrack ? "text" : "none",
                  WebkitTextFillColor: currentTrack ? "transparent" : "#4a4a5a",
                  color: currentTrack ? "white" : "#4a4a5a",
                }}
              >
                {currentTrack?.title ?? "No track selected"}
              </p>
              <p
                className="text-xs truncate"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                {currentTrack?.artist ?? ""}
              </p>
            </div>
          </button>

          {currentTrack && (
            <button
              type="button"
              className="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 transition-all active:scale-90"
              style={{ color: isFav ? "#EC4899" : "rgba(255,255,255,0.4)" }}
              onClick={() => toggleFavorite(currentTrack.id)}
              data-ocid="player.toggle"
            >
              <Heart size={18} fill={isFav ? "currentColor" : "none"} />
            </button>
          )}

          {/* Utility icons on mobile */}
          <button
            type="button"
            className={iconBtn(showEQ)}
            onClick={() => setShowEQ(!showEQ)}
            style={{ width: 40, height: 40, minWidth: 40 }}
            data-ocid="player.toggle"
          >
            <SlidersHorizontal size={16} />
          </button>
          <button
            type="button"
            className={iconBtn(sleepTimer.active)}
            onClick={() =>
              sleepTimer.active ? clearSleepTimer() : setShowTimer(!showTimer)
            }
            style={{ width: 40, height: 40, minWidth: 40 }}
            data-ocid="player.toggle"
          >
            <Timer size={16} />
          </button>
        </div>

        {/* Row 2: Playback controls */}
        <div className="flex items-center justify-center gap-2 w-full mb-1">
          <button
            type="button"
            className={iconBtn(shuffle)}
            style={{ width: 40, height: 40, minWidth: 40 }}
            onClick={toggleShuffle}
            data-ocid="player.toggle"
          >
            <Shuffle size={16} />
          </button>
          <button
            type="button"
            className="flex items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95"
            style={{
              width: 44,
              height: 44,
              minWidth: 44,
              background: "rgba(255,255,255,0.15)",
              color: "white",
            }}
            onClick={prevTrack}
            data-ocid="player.secondary_button"
          >
            <SkipBack size={20} />
          </button>
          <button
            type="button"
            className="flex items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95"
            style={{
              width: 52,
              height: 52,
              minWidth: 52,
              background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
              boxShadow: "0 0 20px rgba(139,92,246,0.5)",
              color: "white",
            }}
            onClick={togglePlayPause}
            data-ocid="player.primary_button"
          >
            {isPlaying ? <Pause size={22} /> : <Play size={22} />}
          </button>
          <button
            type="button"
            className="flex items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95"
            style={{
              width: 44,
              height: 44,
              minWidth: 44,
              background: "rgba(255,255,255,0.15)",
              color: "white",
            }}
            onClick={nextTrack}
            data-ocid="player.secondary_button"
          >
            <SkipForward size={20} />
          </button>
          <button
            type="button"
            className={iconBtn(repeat !== "off")}
            style={{ width: 40, height: 40, minWidth: 40 }}
            onClick={cycleRepeat}
            data-ocid="player.toggle"
          >
            {repeat === "one" ? <Repeat1 size={16} /> : <Repeat size={16} />}
          </button>
        </div>

        {/* Row 3: Progress bar full width */}
        <div className="flex items-center gap-2 w-full px-1">
          <span
            className="text-xs tabular-nums flex-shrink-0"
            style={{
              color: "rgba(255,255,255,0.4)",
              minWidth: 30,
              fontSize: 10,
            }}
          >
            {formatDuration(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={(e) =>
              seekTo((Number.parseFloat(e.target.value) / 100) * duration)
            }
            className="progress-range flex-1 h-1 rounded-full outline-none"
            style={{ "--progress": `${progress}%` } as React.CSSProperties}
            data-ocid="player.input"
          />
          <span
            className="text-xs tabular-nums flex-shrink-0"
            style={{
              color: "rgba(255,255,255,0.4)",
              minWidth: 30,
              textAlign: "right",
              fontSize: 10,
            }}
          >
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* Desktop layout: single row */}
      <div className="hidden md:flex items-center gap-3 px-4 py-3">
        {/* Track info */}
        <button
          type="button"
          className="flex items-center gap-3 min-w-0 w-64 text-left cursor-pointer rounded-lg hover:bg-white/5 transition-colors px-2 py-1"
          onClick={() => currentTrack && setShowNowPlaying(true)}
          data-ocid="player.open_modal_button"
        >
          {currentTrack ? (
            <PlaceholderArt
              title={currentTrack.title}
              size={40}
              className="rounded-lg flex-shrink-0"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-lg flex-shrink-0"
              style={{ background: "rgba(139,92,246,0.2)" }}
            />
          )}
          <div className="min-w-0 flex-1">
            <p
              className="text-sm font-semibold truncate"
              style={{ color: currentTrack ? "white" : "#4a4a5a" }}
            >
              {currentTrack?.title ?? "No track selected"}
            </p>
            <p
              className="text-xs truncate"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              {currentTrack?.artist ?? ""}
            </p>
          </div>
        </button>

        {currentTrack && (
          <button
            type="button"
            className="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0 transition-all hover:scale-110"
            style={{ color: isFav ? "#EC4899" : "rgba(255,255,255,0.4)" }}
            onClick={() => toggleFavorite(currentTrack.id)}
            data-ocid="player.toggle"
          >
            <Heart size={16} fill={isFav ? "currentColor" : "none"} />
          </button>
        )}

        {/* Controls + progress */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-xl mx-auto">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={iconBtn(shuffle)}
              onClick={toggleShuffle}
              data-ocid="player.toggle"
            >
              <Shuffle size={16} />
            </button>
            <button
              type="button"
              className="flex items-center justify-center w-10 h-10 rounded-full transition-all hover:scale-105 hover:bg-white/10"
              style={{ color: "white" }}
              onClick={prevTrack}
              data-ocid="player.secondary_button"
            >
              <SkipBack size={20} />
            </button>
            <button
              type="button"
              className="flex items-center justify-center w-11 h-11 rounded-full transition-all hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
                boxShadow: "0 0 16px rgba(139,92,246,0.5)",
                color: "white",
              }}
              onClick={togglePlayPause}
              data-ocid="player.primary_button"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button
              type="button"
              className="flex items-center justify-center w-10 h-10 rounded-full transition-all hover:scale-105 hover:bg-white/10"
              style={{ color: "white" }}
              onClick={nextTrack}
              data-ocid="player.secondary_button"
            >
              <SkipForward size={20} />
            </button>
            <button
              type="button"
              className={iconBtn(repeat !== "off")}
              onClick={cycleRepeat}
              data-ocid="player.toggle"
            >
              {repeat === "one" ? <Repeat1 size={16} /> : <Repeat size={16} />}
            </button>
          </div>
          <div className="flex items-center gap-2 w-full">
            <span
              className="text-xs tabular-nums"
              style={{ color: "rgba(255,255,255,0.4)", minWidth: 32 }}
            >
              {formatDuration(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progress}
              onChange={(e) =>
                seekTo((Number.parseFloat(e.target.value) / 100) * duration)
              }
              className="progress-range flex-1 h-1 rounded-full outline-none"
              style={{ "--progress": `${progress}%` } as React.CSSProperties}
              data-ocid="player.input"
            />
            <span
              className="text-xs tabular-nums"
              style={{
                color: "rgba(255,255,255,0.4)",
                minWidth: 32,
                textAlign: "right",
              }}
            >
              {formatDuration(duration)}
            </span>
          </div>
        </div>

        {/* Utility controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            className={iconBtn(showEQ)}
            onClick={() => setShowEQ(!showEQ)}
            title="Equalizer"
            data-ocid="player.toggle"
          >
            <SlidersHorizontal size={16} />
          </button>
          <button
            type="button"
            className={iconBtn(voiceActive)}
            onClick={toggleVoice}
            title="Voice assistant"
            data-ocid="player.toggle"
          >
            {voiceActive ? <Mic size={16} /> : <MicOff size={16} />}
          </button>
          <button
            type="button"
            className={iconBtn(sleepTimer.active)}
            onClick={() =>
              sleepTimer.active ? clearSleepTimer() : setShowTimer(!showTimer)
            }
            title={
              sleepTimer.active
                ? `Sleep: ${formatTimer(sleepTimer.remaining)}`
                : "Sleep timer"
            }
            data-ocid="player.toggle"
          >
            <Timer size={16} />
          </button>
          {sleepTimer.active && (
            <span className="text-xs tabular-nums" style={{ color: "#8B5CF6" }}>
              {formatTimer(sleepTimer.remaining)}
            </span>
          )}
          <div className="relative">
            <button
              type="button"
              className={iconBtn()}
              onClick={() => setShowVol(!showVol)}
              data-ocid="player.toggle"
            >
              {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            {showVol && (
              <div
                className="absolute bottom-full right-0 mb-2 p-3 rounded-xl"
                style={{
                  background: "rgba(20,15,40,0.97)",
                  border: "1px solid rgba(139,92,246,0.4)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(Number.parseFloat(e.target.value))}
                  className="w-24 h-1 rounded-full"
                  data-ocid="player.input"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
