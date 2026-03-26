import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import Layout from "./components/Layout";
import { audioEngine } from "./lib/audioEngine";
import { useMusicStore } from "./lib/store";
import { voiceAssistant } from "./lib/voiceAssistant";

export default function App() {
  const {
    loadTracks,
    setCurrentTime,
    setDuration,
    handleTrackEnded,
    currentTrack,
    nextTrack,
    prevTrack,
    togglePlayPause,
    toggleShuffle,
    voiceActive,
  } = useMusicStore();

  useEffect(() => {
    audioEngine.onTimeUpdate = setCurrentTime;
    audioEngine.onDurationChange = setDuration;
    audioEngine.onEnded = handleTrackEnded;
  }, [setCurrentTime, setDuration, handleTrackEnded]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    loadTracks();
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: media session setup
  useEffect(() => {
    if (!currentTrack || !navigator.mediaSession) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
    });
    navigator.mediaSession.setActionHandler("play", () => togglePlayPause());
    navigator.mediaSession.setActionHandler("pause", () => togglePlayPause());
    navigator.mediaSession.setActionHandler("nexttrack", () => nextTrack());
    navigator.mediaSession.setActionHandler("previoustrack", () => prevTrack());
  }, [currentTrack]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: voice init once
  useEffect(() => {
    voiceAssistant.init((cmd) => {
      if (cmd === "play" || cmd === "pause") togglePlayPause();
      else if (cmd === "next") nextTrack();
      else if (cmd === "previous") prevTrack();
      else if (cmd === "shuffle") toggleShuffle();
    });
  }, []);

  useEffect(() => {
    if (voiceActive) voiceAssistant.start();
    else voiceAssistant.stop();
  }, [voiceActive]);

  return (
    <>
      <Layout />
      <Toaster />
    </>
  );
}
