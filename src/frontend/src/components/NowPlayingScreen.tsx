import {
  ChevronDown,
  Heart,
  Minimize2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Timer,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatDuration, formatTimer } from "../lib/helpers";
import PlaceholderArt from "../lib/placeholderArt";
import { useMusicStore } from "../lib/store";
import ChaptersPanel from "./ChaptersPanel";
import LyricsPanel from "./LyricsPanel";

const WAVE_BARS = [
  { id: "a", height: "60%", delay: "0s" },
  { id: "b", height: "100%", delay: "0.2s" },
  { id: "c", height: "40%", delay: "0.4s" },
  { id: "d", height: "80%", delay: "0.1s" },
  { id: "e", height: "55%", delay: "0.3s" },
  { id: "f", height: "70%", delay: "0.15s" },
  { id: "g", height: "45%", delay: "0.35s" },
];

const WAVE_COLORS = [
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#8B5CF6",
];

type Tab = "controls" | "lyrics" | "chapters";

export default function NowPlayingScreen() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    shuffle,
    repeat,
    favorites,
    sleepTimer,
    showNowPlaying,
    setShowNowPlaying,
    togglePlayPause,
    nextTrack,
    prevTrack,
    seekTo,
    toggleShuffle,
    cycleRepeat,
    toggleFavorite,
    toggleMiniPlayer,
    startSleepTimer,
    clearSleepTimer,
  } = useMusicStore();

  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("controls");
  const [showTimerPopover, setShowTimerPopover] = useState(false);
  const [customMin, setCustomMin] = useState("");
  const touchStartY = useRef<number | null>(null);
  const touchCurrentY = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (showNowPlaying) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [showNowPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !showNowPlaying) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let t = 0;
    const colors = [
      [139, 92, 246],
      [236, 72, 153],
      [6, 182, 212],
    ];

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      colors.forEach(([r, g, b], i) => {
        const pulse = isPlaying ? Math.sin(t * 0.02 + i * 2) * 0.2 + 0.8 : 0.5;
        const x = w * (0.2 + Math.sin(t * 0.006 + i * 1.2) * 0.3);
        const y = h * (0.3 + Math.cos(t * 0.008 + i * 0.8) * 0.3);
        const rad = Math.min(w, h) * pulse * 0.6;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, rad);
        grad.addColorStop(0, `rgba(${r},${g},${b},0.35)`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      });

      if (isPlaying) t += 1;
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [showNowPlaying, isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const dismiss = () => {
    setVisible(false);
    setTimeout(() => setShowNowPlaying(false), 300);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isFav = currentTrack ? favorites.includes(currentTrack.id) : false;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchCurrentY.current = e.touches[0].clientY;
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    touchCurrentY.current = e.touches[0].clientY;
    if (delta > 0) setDragOffset(delta);
  };

  const handleTouchEnd = () => {
    if (touchStartY.current !== null && touchCurrentY.current !== null) {
      const delta = touchCurrentY.current - touchStartY.current;
      if (delta > 80) dismiss();
    }
    touchStartY.current = null;
    touchCurrentY.current = null;
    setDragOffset(0);
  };

  if (!showNowPlaying) return null;

  const iconBtn = (active = false) =>
    `flex items-center justify-center w-12 h-12 rounded-full transition-all ${
      active
        ? "text-purple-400"
        : "text-white/50 hover:text-white hover:bg-white/10"
    }`;

  const tabs: { key: Tab; label: string }[] = [
    { key: "controls", label: "Controls" },
    { key: "lyrics", label: "Lyrics" },
    { key: "chapters", label: "Chapters" },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col overflow-hidden"
      style={{
        background: "#08080f",
        transform: visible ? `translateY(${dragOffset}px)` : "translateY(100%)",
        transition:
          dragOffset > 0
            ? "none"
            : "transform 0.35s cubic-bezier(0.32,0.72,0,1)",
        opacity: visible ? Math.max(0, 1 - dragOffset / 400) : 1,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      data-ocid="now_playing.panel"
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          opacity: 0.6,
          pointerEvents: "none",
        }}
      />

      <div className="relative z-[1] flex flex-col h-full">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: "rgba(255,255,255,0.2)" }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center px-4 py-2 relative">
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            style={{ color: "rgba(255,255,255,0.6)" }}
            onClick={dismiss}
            data-ocid="now_playing.close_button"
          >
            <ChevronDown size={24} />
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <p
              className="text-xs font-bold tracking-widest uppercase"
              style={{
                background: "linear-gradient(90deg, #8B5CF6, #EC4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Now Playing
            </p>
          </div>
        </div>

        {/* Album Art + Track Info */}
        <div className="flex flex-col items-center px-8 pt-4 pb-2 gap-3">
          <div
            style={{
              filter: isPlaying
                ? "drop-shadow(0 8px 40px rgba(139,92,246,0.6))"
                : "drop-shadow(0 8px 24px rgba(0,0,0,0.7))",
              transform: isPlaying ? "scale(1.04)" : "scale(0.97)",
              transition: "transform 0.4s ease, filter 0.4s ease",
              borderRadius: 20,
              overflow: "hidden",
            }}
          >
            {currentTrack ? (
              <PlaceholderArt
                title={currentTrack.title}
                size={220}
                className="rounded-2xl"
              />
            ) : (
              <div
                className="rounded-2xl"
                style={{
                  width: 220,
                  height: 220,
                  background:
                    "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.3))",
                }}
              />
            )}
          </div>

          <div className="w-full flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p
                className="text-xl font-bold truncate"
                style={{
                  background: "linear-gradient(90deg, #fff, #d8b4fe)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {currentTrack?.title ?? "No track selected"}
              </p>
              <p
                className="text-sm truncate mt-0.5"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                {currentTrack?.artist ?? ""}
              </p>
            </div>
            {currentTrack && (
              <button
                type="button"
                className="w-11 h-11 flex items-center justify-center rounded-full ml-3 flex-shrink-0 transition-all active:scale-90 hover:scale-110"
                style={{ color: isFav ? "#EC4899" : "rgba(255,255,255,0.4)" }}
                onClick={() => toggleFavorite(currentTrack.id)}
                data-ocid="now_playing.toggle"
              >
                <Heart size={22} fill={isFav ? "currentColor" : "none"} />
              </button>
            )}
          </div>

          {/* Colorful waveform */}
          <div className="flex items-end gap-1 h-7 justify-center">
            {WAVE_BARS.map((bar, i) => (
              <div
                key={bar.id}
                style={{
                  width: 3,
                  height: bar.height,
                  background: isPlaying
                    ? WAVE_COLORS[i]
                    : "rgba(255,255,255,0.2)",
                  borderRadius: 2,
                  animationName: isPlaying ? "waveBar" : "none",
                  animationDuration: "0.8s",
                  animationDelay: bar.delay,
                  animationTimingFunction: "ease-in-out",
                  animationIterationCount: "infinite",
                  animationDirection: "alternate",
                  boxShadow: isPlaying ? `0 0 6px ${WAVE_COLORS[i]}` : "none",
                }}
              />
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div
          className="flex border-b px-8"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className="flex-1 py-2.5 text-sm font-semibold transition-all"
              style={{
                color:
                  activeTab === tab.key ? "#EC4899" : "rgba(255,255,255,0.4)",
                borderBottom:
                  activeTab === tab.key
                    ? "2px solid #EC4899"
                    : "2px solid transparent",
              }}
              onClick={() => setActiveTab(tab.key)}
              data-ocid={`now_playing.${tab.key}.tab`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {activeTab === "controls" && (
            <div className="flex flex-col items-center px-6 py-4 gap-5 h-full justify-center">
              {/* Seek bar */}
              <div className="w-full">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={progress}
                  onChange={(e) =>
                    seekTo((Number.parseFloat(e.target.value) / 100) * duration)
                  }
                  className="progress-range w-full h-1 rounded-full outline-none"
                  style={
                    { "--progress": `${progress}%` } as React.CSSProperties
                  }
                  data-ocid="now_playing.input"
                />
                <div className="flex justify-between mt-1.5">
                  <span
                    className="text-xs tabular-nums"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    {formatDuration(currentTime)}
                  </span>
                  <span
                    className="text-xs tabular-nums"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    {formatDuration(duration)}
                  </span>
                </div>
              </div>

              {/* Main controls */}
              <div className="flex items-center gap-5 w-full justify-center">
                <button
                  type="button"
                  className="flex items-center justify-center w-14 h-14 rounded-full transition-all hover:bg-white/10 active:scale-90"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                  onClick={prevTrack}
                  data-ocid="now_playing.secondary_button"
                >
                  <SkipBack size={28} />
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center w-20 h-20 rounded-full transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
                    boxShadow:
                      "0 0 32px rgba(139,92,246,0.6), 0 0 60px rgba(236,72,153,0.3)",
                    color: "white",
                  }}
                  onClick={togglePlayPause}
                  data-ocid="now_playing.primary_button"
                >
                  {isPlaying ? <Pause size={32} /> : <Play size={32} />}
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center w-14 h-14 rounded-full transition-all hover:bg-white/10 active:scale-90"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                  onClick={nextTrack}
                  data-ocid="now_playing.secondary_button"
                >
                  <SkipForward size={28} />
                </button>
              </div>

              {/* Secondary controls */}
              <div className="flex items-center justify-center gap-6">
                <button
                  type="button"
                  className={iconBtn(shuffle)}
                  onClick={toggleShuffle}
                  title="Shuffle"
                  data-ocid="now_playing.toggle"
                >
                  <Shuffle size={20} />
                </button>
                <button
                  type="button"
                  className={iconBtn(repeat !== "off")}
                  onClick={cycleRepeat}
                  title="Repeat"
                  data-ocid="now_playing.toggle"
                >
                  {repeat === "one" ? (
                    <Repeat1 size={20} />
                  ) : (
                    <Repeat size={20} />
                  )}
                </button>
                <div className="relative">
                  <button
                    type="button"
                    className={iconBtn(sleepTimer.active)}
                    title={
                      sleepTimer.active ? "Sleep timer active" : "Sleep timer"
                    }
                    onClick={() =>
                      sleepTimer.active
                        ? clearSleepTimer()
                        : setShowTimerPopover(!showTimerPopover)
                    }
                    data-ocid="now_playing.toggle"
                  >
                    <Timer size={20} />
                  </button>
                  {showTimerPopover && (
                    <div
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 rounded-xl shadow-2xl p-4 w-52 z-50"
                      style={{
                        background: "rgba(20,15,40,0.97)",
                        border: "1px solid rgba(139,92,246,0.4)",
                        backdropFilter: "blur(20px)",
                      }}
                    >
                      <p className="text-white text-sm font-semibold mb-3">
                        Sleep Timer
                      </p>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {[15, 30, 45, 60].map((min) => (
                          <button
                            type="button"
                            key={min}
                            className="py-1.5 text-sm rounded-lg font-medium transition-all hover:scale-105"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.3))",
                              border: "1px solid rgba(139,92,246,0.4)",
                              color: "#fff",
                            }}
                            onClick={() => {
                              startSleepTimer(min);
                              setShowTimerPopover(false);
                            }}
                          >
                            {min} min
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Custom"
                          value={customMin}
                          onChange={(e) => setCustomMin(e.target.value)}
                          className="flex-1 px-2 py-1 text-sm rounded-lg text-white outline-none"
                          style={{
                            background: "rgba(255,255,255,0.1)",
                            border: "1px solid rgba(139,92,246,0.3)",
                          }}
                        />
                        <button
                          type="button"
                          className="px-3 py-1 text-sm rounded-lg font-medium"
                          style={{
                            background:
                              "linear-gradient(135deg, #8B5CF6, #EC4899)",
                            color: "#fff",
                          }}
                          onClick={() => {
                            const m = Number.parseInt(customMin);
                            if (m > 0) {
                              startSleepTimer(m);
                              setShowTimerPopover(false);
                              setCustomMin("");
                            }
                          }}
                        >
                          Set
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {activeTab === "lyrics" && (
            <div className="h-full overflow-hidden">
              <LyricsPanel />
            </div>
          )}
          {activeTab === "chapters" && (
            <div className="h-full overflow-hidden">
              <ChaptersPanel />
            </div>
          )}
        </div>

        {/* Mini player toggle */}
        <button
          type="button"
          className="absolute bottom-6 right-6 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          style={{ color: "rgba(255,255,255,0.5)" }}
          onClick={toggleMiniPlayer}
          title="Toggle mini player"
          data-ocid="now_playing.open_modal_button"
        >
          <Minimize2 size={20} />
        </button>
      </div>
    </div>
  );
}
