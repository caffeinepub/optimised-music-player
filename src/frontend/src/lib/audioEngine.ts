type TimeCallback = (time: number) => void;
type DurationCallback = (duration: number) => void;

class AudioEngine {
  private audio: HTMLAudioElement;
  private ctx: AudioContext | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private bassFilter: BiquadFilterNode | null = null;
  private midFilter: BiquadFilterNode | null = null;
  private trebleFilter: BiquadFilterNode | null = null;
  private crossfadeSeconds = 0;
  private isFadingOut = false;

  onTimeUpdate: TimeCallback = () => {};
  onDurationChange: DurationCallback = () => {};
  onEnded: () => void = () => {};

  constructor() {
    this.audio = new Audio();
    this.audio.addEventListener("timeupdate", () => {
      this.onTimeUpdate(this.audio.currentTime);
      this.checkCrossfade();
    });
    this.audio.addEventListener("durationchange", () =>
      this.onDurationChange(this.audio.duration),
    );
    this.audio.addEventListener("ended", () => this.onEnded());
  }

  private initAudioContext() {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this.source = this.ctx.createMediaElementSource(this.audio);
    this.gainNode = this.ctx.createGain();
    this.bassFilter = this.ctx.createBiquadFilter();
    this.midFilter = this.ctx.createBiquadFilter();
    this.trebleFilter = this.ctx.createBiquadFilter();

    this.bassFilter.type = "lowshelf";
    this.bassFilter.frequency.value = 250;
    this.midFilter.type = "peaking";
    this.midFilter.frequency.value = 1000;
    this.trebleFilter.type = "highshelf";
    this.trebleFilter.frequency.value = 4000;

    this.source
      .connect(this.bassFilter)
      .connect(this.midFilter)
      .connect(this.trebleFilter)
      .connect(this.gainNode)
      .connect(this.ctx.destination);
  }

  private checkCrossfade() {
    if (!this.crossfadeSeconds || !this.gainNode || !this.ctx) return;
    const remaining = (this.audio.duration || 0) - this.audio.currentTime;
    if (
      remaining > 0 &&
      remaining <= this.crossfadeSeconds &&
      !this.isFadingOut
    ) {
      this.isFadingOut = true;
      const now = this.ctx.currentTime;
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
      this.gainNode.gain.linearRampToValueAtTime(0, now + remaining);
    }
  }

  loadTrack(url: string) {
    this.isFadingOut = false;
    if (this.gainNode && this.ctx) {
      const now = this.ctx.currentTime;
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setValueAtTime(0, now);
      this.gainNode.gain.linearRampToValueAtTime(
        1,
        now + Math.min(this.crossfadeSeconds, 1),
      );
    }
    this.audio.src = url;
    this.audio.load();
  }

  play(): Promise<void> {
    this.initAudioContext();
    if (this.ctx?.state === "suspended") {
      this.ctx.resume();
    }
    if (this.gainNode && !this.isFadingOut) {
      const now = this.ctx!.currentTime;
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setValueAtTime(1, now);
    }
    return this.audio.play();
  }

  pause() {
    this.audio.pause();
  }

  seekTo(s: number) {
    this.audio.currentTime = s;
    this.isFadingOut = false;
    if (this.gainNode && this.ctx) {
      const now = this.ctx.currentTime;
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setValueAtTime(1, now);
    }
  }

  setVolume(v: number) {
    this.audio.volume = Math.max(0, Math.min(1, v));
  }

  seekForward(s = 10) {
    this.audio.currentTime = Math.min(
      this.audio.duration || 0,
      this.audio.currentTime + s,
    );
  }

  seekBackward(s = 10) {
    this.audio.currentTime = Math.max(0, this.audio.currentTime - s);
  }

  getCurrentTime() {
    return this.audio.currentTime;
  }

  getDuration() {
    return this.audio.duration || 0;
  }

  setEQBand(band: "bass" | "mid" | "treble", gainDb: number) {
    const filter =
      band === "bass"
        ? this.bassFilter
        : band === "mid"
          ? this.midFilter
          : this.trebleFilter;
    if (filter) filter.gain.value = gainDb;
  }

  setCrossfade(seconds: number) {
    this.crossfadeSeconds = seconds;
  }
}

export const audioEngine = new AudioEngine();
