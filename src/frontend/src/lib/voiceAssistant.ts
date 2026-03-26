import { toast } from "sonner";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export type VoiceCommands = {
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  shuffle: () => void;
  stop: () => void;
};

let recognition: SpeechRecognitionInstance | null = null;
let active = false;

export function startVoiceRecognition(commands: VoiceCommands): void {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) {
    toast.error("Voice assistant not available in this browser");
    return;
  }

  if (recognition) {
    recognition.stop();
  }

  recognition = new SpeechRec();
  recognition.continuous = true;
  recognition.lang = "en-US";
  recognition.interimResults = false;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const last = event.results.length - 1;
    const transcript = event.results[last][0].transcript.toLowerCase().trim();

    if (transcript.includes("play")) {
      commands.play();
      toast.success("🎤 Voice: Play");
    } else if (transcript.includes("pause")) {
      commands.pause();
      toast.success("🎤 Voice: Pause");
    } else if (transcript.includes("next")) {
      commands.next();
      toast.success("🎤 Voice: Next");
    } else if (transcript.includes("previous") || transcript.includes("prev")) {
      commands.previous();
      toast.success("🎤 Voice: Previous");
    } else if (transcript.includes("shuffle")) {
      commands.shuffle();
      toast.success("🎤 Voice: Shuffle");
    } else if (transcript.includes("stop")) {
      commands.stop();
      toast.success("🎤 Voice: Stop");
    }
  };

  recognition.onerror = () => {
    active = false;
  };

  recognition.onend = () => {
    if (active) {
      try {
        recognition?.start();
      } catch {}
    }
  };

  active = true;
  try {
    recognition.start();
  } catch {
    toast.error("Could not start voice recognition");
  }
}

export function stopVoiceRecognition(): void {
  active = false;
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
}
