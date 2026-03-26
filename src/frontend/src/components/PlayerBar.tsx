import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
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
  Timer,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useState } from "react";
import { formatDuration } from "../lib/helpers";
import { PlaceholderArt } from "../lib/placeholderArt";
import { usePlayerStore } from "../lib/store";

const SLEEP_PRESETS = [15, 30, 45, 60];

export default function PlayerBar() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const volume = usePlayerStore((s) => s.volume);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const repeat = usePlayerStore((s) => s.repeat);
  const favorites = usePlayerStore((s) => s.favorites);
  const sleepTimer = usePlayerStore((s) => s.sleepTimer);
  const voiceActive = usePlayerStore((s) => s.voiceActive);

  const togglePlayPause = usePlayerStore((s) => s.togglePlayPause);
  const nextTrack = usePlayerStore((s) => s.nextTrack);
  const prevTrack = usePlayerStore((s) => s.prevTrack);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const seekForward = usePlayerStore((s) => s.seekForward);
  const seekBackward = usePlayerStore((s) => s.seekBackward);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat);
  const toggleFavorite = usePlayerStore((s) => s.toggleFavorite);
  const startSleepTimer = usePlayerStore((s) => s.startSleepTimerAction);
  const clearSleepTimer = usePlayerStore((s) => s.clearSleepTimerAction);
  const toggleVoice = usePlayerStore((s) => s.toggleVoice);

  const [customMinutes, setCustomMinutes] = useState("");
  const [sleepOpen, setSleepOpen] = useState(false);

  const isFavorite = currentTrack ? favorites.includes(currentTrack.id) : false;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bgStyle = {
    background: `linear-gradient(to right, oklch(var(--primary)) ${progress}%, oklch(var(--secondary)) ${progress}%)`,
  };
  const volBgStyle = {
    background: `linear-gradient(to right, oklch(var(--primary)) ${volume * 100}%, oklch(var(--secondary)) ${volume * 100}%)`,
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekTo(Number.parseFloat(e.target.value));
  };

  const handleSleepPreset = (minutes: number) => {
    startSleepTimer(minutes);
    setSleepOpen(false);
  };

  const handleCustomSleep = () => {
    const m = Number.parseFloat(customMinutes);
    if (m > 0) {
      startSleepTimer(m);
      setSleepOpen(false);
      setCustomMinutes("");
    }
  };

  const formatRemaining = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="flex-shrink-0 h-[88px] md:h-[90px] glass border-t border-border flex items-center px-3 md:px-4 gap-3"
      style={{ background: "oklch(var(--card) / 0.97)" }}
      data-ocid="player.panel"
    >
      {/* Left: Track info */}
      <div className="flex items-center gap-3 w-[180px] md:w-[220px] flex-shrink-0 min-w-0">
        {currentTrack ? (
          <>
            <PlaceholderArt
              title={currentTrack.title}
              size={46}
              className="rounded-sm"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">
                {currentTrack.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {currentTrack.artist}
              </p>
            </div>
            <button
              type="button"
              data-ocid="player.favorite.toggle"
              onClick={() => toggleFavorite(currentTrack.id)}
              className={cn(
                "flex-shrink-0 transition-colors",
                isFavorite
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Heart
                className="h-4 w-4"
                fill={isFavorite ? "currentColor" : "none"}
              />
            </button>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">No track selected</p>
        )}
      </div>

      {/* Center: Controls + Progress */}
      <div className="flex flex-col items-center flex-1 min-w-0 gap-1">
        <div className="flex items-center gap-1 md:gap-2">
          <button
            type="button"
            data-ocid="player.shuffle.toggle"
            onClick={toggleShuffle}
            className={cn(
              "p-1.5 rounded-full transition-colors",
              shuffle
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
            title="Shuffle"
          >
            <Shuffle className="h-4 w-4" />
          </button>

          <button
            type="button"
            data-ocid="player.prev.button"
            onClick={prevTrack}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            <SkipBack className="h-4 w-4" fill="currentColor" />
          </button>

          <button
            type="button"
            data-ocid="player.seek_back.button"
            onClick={seekBackward}
            className="hidden md:flex p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors text-[10px] items-center gap-0.5"
            title="Back 10s"
          >
            <SkipBack className="h-3.5 w-3.5" />
            <span className="text-[9px]">10</span>
          </button>

          <button
            type="button"
            data-ocid="player.play_pause.button"
            onClick={togglePlayPause}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 md:h-5 md:w-5" fill="currentColor" />
            ) : (
              <Play className="h-4 w-4 md:h-5 md:w-5" fill="currentColor" />
            )}
          </button>

          <button
            type="button"
            data-ocid="player.seek_fwd.button"
            onClick={seekForward}
            className="hidden md:flex p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors items-center gap-0.5"
            title="Forward 10s"
          >
            <span className="text-[9px]">10</span>
            <SkipForward className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            data-ocid="player.next.button"
            onClick={nextTrack}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            <SkipForward className="h-4 w-4" fill="currentColor" />
          </button>

          <button
            type="button"
            data-ocid="player.repeat.toggle"
            onClick={cycleRepeat}
            className={cn(
              "p-1.5 rounded-full transition-colors",
              repeat !== "off"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
            title={`Repeat: ${repeat}`}
          >
            {repeat === "one" ? (
              <Repeat1 className="h-4 w-4" />
            ) : (
              <Repeat className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 w-full max-w-md">
          <span className="text-[10px] text-muted-foreground w-8 text-right flex-shrink-0">
            {formatDuration(currentTime)}
          </span>
          <div
            className="flex-1 relative h-4 flex items-center"
            data-ocid="player.progress.panel"
          >
            <div className="absolute inset-x-0 h-1 rounded-full overflow-hidden pointer-events-none">
              <div className="h-full rounded-full" style={bgStyle} />
            </div>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.5}
              value={currentTime}
              onChange={handleProgressChange}
              className="omp-range absolute inset-0 w-full"
              data-ocid="player.seek.input"
            />
          </div>
          <span className="text-[10px] text-muted-foreground w-8 flex-shrink-0">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* Right: Volume + extras */}
      <div className="hidden md:flex items-center gap-2 w-[180px] flex-shrink-0 justify-end">
        {sleepTimer?.active && (
          <button
            type="button"
            data-ocid="player.sleep_timer.toggle"
            onClick={clearSleepTimer}
            className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full hover:bg-primary/20 transition-colors"
            title="Click to cancel sleep timer"
          >
            <Timer className="h-3 w-3" />
            {formatRemaining(sleepTimer.remaining)}
          </button>
        )}

        {!sleepTimer?.active && (
          <Popover open={sleepOpen} onOpenChange={setSleepOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                data-ocid="player.sleep_timer.open_modal_button"
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full"
                title="Sleep timer"
              >
                <Timer className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-48 bg-popover border-border p-3"
              side="top"
              data-ocid="player.sleep_timer.popover"
            >
              <p className="text-xs font-medium mb-2">Sleep Timer</p>
              <div className="grid grid-cols-2 gap-1.5 mb-2">
                {SLEEP_PRESETS.map((m) => (
                  <Button
                    key={m}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => handleSleepPreset(m)}
                    data-ocid={`player.sleep_timer.${m}min.button`}
                  >
                    {m} min
                  </Button>
                ))}
              </div>
              <div className="flex gap-1">
                <Input
                  type="number"
                  placeholder="Custom"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  className="h-7 text-xs"
                  min={1}
                  data-ocid="player.sleep_timer_custom.input"
                />
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleCustomSleep}
                  data-ocid="player.sleep_timer_custom.button"
                >
                  Set
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}

        <button
          type="button"
          data-ocid="player.voice.toggle"
          onClick={toggleVoice}
          className={cn(
            "p-1.5 rounded-full transition-colors",
            voiceActive
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
          title={voiceActive ? "Voice on — click to stop" : "Voice assistant"}
        >
          {voiceActive ? (
            <Mic className="h-4 w-4" />
          ) : (
            <MicOff className="h-4 w-4" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          data-ocid="player.volume_mute.toggle"
        >
          {volume === 0 ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </button>
        <div className="relative h-4 flex items-center w-24">
          <div className="absolute inset-x-0 h-1 rounded-full overflow-hidden pointer-events-none">
            <div className="h-full rounded-full" style={volBgStyle} />
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number.parseFloat(e.target.value))}
            className="omp-range absolute inset-0 w-full"
            data-ocid="player.volume.input"
          />
        </div>
      </div>

      {/* Mobile: mute toggle */}
      <div className="flex md:hidden items-center gap-1.5 flex-shrink-0">
        <button
          type="button"
          onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
          className="text-muted-foreground"
          data-ocid="player.mobile_mute.toggle"
        >
          {volume === 0 ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
