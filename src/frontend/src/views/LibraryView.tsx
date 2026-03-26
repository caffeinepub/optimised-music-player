import { Button } from "@/components/ui/button";
import { Music2, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { TrackRow } from "../components/TrackRow";
import { addTrack } from "../lib/db";
import type { Track } from "../lib/db";
import { generateId, getDurationFromFile, parseFilename } from "../lib/helpers";
import { usePlayerStore } from "../lib/store";

const SUPPORTED_TYPES = [
  "audio/mpeg",
  "audio/wav",
  "audio/flac",
  "audio/ogg",
  "audio/mp4",
  "audio/aac",
  "audio/x-m4a",
  "audio/webm",
];
const SUPPORTED_EXTS = /\.(mp3|wav|flac|ogg|m4a|aac|webm)$/i;

export default function LibraryView() {
  const tracks = usePlayerStore((s) => s.tracks);
  const playlists = usePlayerStore((s) => s.playlists);
  const loadTracks = usePlayerStore((s) => s.loadTracks);
  const playTrack = usePlayerStore((s) => s.playTrack);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const processFiles = useCallback(
    async (files: File[]) => {
      setUploading(true);
      let added = 0;
      for (const file of files) {
        if (
          !SUPPORTED_TYPES.includes(file.type) &&
          !SUPPORTED_EXTS.test(file.name)
        ) {
          toast.error(`Unsupported format: ${file.name}`);
          continue;
        }
        try {
          const duration = await getDurationFromFile(file);
          const { title, artist } = parseFilename(file.name);
          const arrayBuffer = await file.arrayBuffer();
          const track: Track = {
            id: generateId(),
            title,
            artist,
            album: "",
            duration,
            size: file.size,
            mimeType: file.type || "audio/mpeg",
            addedAt: Date.now(),
          };
          await addTrack(track, arrayBuffer);
          added++;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "";
          if (msg.startsWith("DUPLICATE:")) {
            toast.info(`Already in library: ${file.name}`);
          } else {
            toast.error(`Failed to add: ${file.name}`);
          }
        }
      }
      if (added > 0) {
        await loadTracks();
        toast.success(`Added ${added} track${added !== 1 ? "s" : ""}`);
      }
      setUploading(false);
    },
    [loadTracks],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) processFiles(Array.from(files));
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) processFiles(files);
  };

  return (
    <div
      className="relative min-h-full"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 border-2 border-dashed border-primary rounded-lg m-2"
          data-ocid="library.dropzone"
        >
          <Music2 className="h-16 w-16 text-primary mb-4" />
          <p className="text-xl font-semibold">Drop audio files here</p>
          <p className="text-muted-foreground text-sm mt-1">
            MP3, WAV, FLAC, OGG, M4A, AAC supported
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Your Library</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {tracks.length} track{tracks.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          data-ocid="library.upload.button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? "Adding..." : "Upload"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.flac,.ogg,.m4a,.aac"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />
      </div>

      {/* Track list */}
      {tracks.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-24 text-center"
          data-ocid="library.empty_state"
        >
          <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center mb-6">
            <Music2 className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Your library is empty</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Drop audio files here or click Upload to add your music collection.
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-primary text-primary-foreground"
            data-ocid="library.empty.upload.button"
          >
            <Upload className="h-4 w-4 mr-2" /> Add Music
          </Button>
        </div>
      ) : (
        <div className="space-y-0.5" data-ocid="library.list">
          {tracks.map((track, i) => (
            <TrackRow
              key={track.id}
              track={track}
              index={i + 1}
              playlists={playlists}
              onPlay={() => playTrack(track)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
