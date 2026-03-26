type VoiceCommand = "play" | "pause" | "next" | "previous" | "shuffle";
type CommandHandler = (cmd: VoiceCommand) => void;

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult:
    | ((event: {
        results: {
          length: number;
          [i: number]: { [j: number]: { transcript: string } };
        };
      }) => void)
    | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

class VoiceAssistant {
  private recognition: SpeechRecognitionLike | null = null;
  private handler: CommandHandler | null = null;
  private active = false;

  init(handler: CommandHandler) {
    this.handler = handler;
    const w = window as Window & {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;
    this.recognition = new SR();
    this.recognition.lang = "en-US";
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      const t = last[0].transcript.trim().toLowerCase();
      if (t.includes("next")) this.handler?.("next");
      else if (t.includes("previous") || t.includes("prev"))
        this.handler?.("previous");
      else if (t.includes("pause")) this.handler?.("pause");
      else if (t.includes("play")) this.handler?.("play");
      else if (t.includes("shuffle")) this.handler?.("shuffle");
    };
    this.recognition.onerror = (e) => {
      if (e.error !== "no-speech") console.error("Voice error", e.error);
    };
    this.recognition.onend = () => {
      if (this.active) this.recognition?.start();
    };
  }

  start() {
    this.active = true;
    try {
      this.recognition?.start();
    } catch (_) {}
  }
  stop() {
    this.active = false;
    try {
      this.recognition?.stop();
    } catch (_) {}
  }
}

export const voiceAssistant = new VoiceAssistant();
