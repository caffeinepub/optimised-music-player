import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import Layout from "./components/Layout";
import { initAudioEngine, setupMediaSessionHandlers } from "./lib/audioEngine";
import { usePlayerStore } from "./lib/store";
import {
  startVoiceRecognition,
  stopVoiceRecognition,
} from "./lib/voiceAssistant";

export default function App() {
  const loadTracks = usePlayerStore((s) => s.loadTracks);
  const voiceActive = usePlayerStore((s) => s.voiceActive);

  useEffect(() => {
    // Always dark mode
    document.documentElement.classList.add("dark");

    // Init audio engine with store callbacks
    initAudioEngine({
      onTimeUpdate: (t) => usePlayerStore.setState({ currentTime: t }),
      onDurationChange: (d) => usePlayerStore.setState({ duration: d }),
      onEnded: () => usePlayerStore.getState().handleTrackEnded(),
    });

    // Media Session handlers
    setupMediaSessionHandlers({
      onPlay: () => usePlayerStore.getState().resume(),
      onPause: () => usePlayerStore.getState().pause(),
      onNext: () => usePlayerStore.getState().nextTrack(),
      onPrev: () => usePlayerStore.getState().prevTrack(),
    });

    // Load tracks from IndexedDB
    loadTracks();
  }, [loadTracks]);

  useEffect(() => {
    if (voiceActive) {
      startVoiceRecognition({
        play: () => usePlayerStore.getState().resume(),
        pause: () => usePlayerStore.getState().pause(),
        next: () => usePlayerStore.getState().nextTrack(),
        previous: () => usePlayerStore.getState().prevTrack(),
        shuffle: () => usePlayerStore.getState().toggleShuffle(),
        stop: () => usePlayerStore.getState().pause(),
      });
    } else {
      stopVoiceRecognition();
    }
  }, [voiceActive]);

  return (
    <>
      <Layout />
      <Toaster theme="dark" position="top-right" richColors />
    </>
  );
}
