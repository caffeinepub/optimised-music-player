import { Music, Upload } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import TrackRow from "../components/TrackRow";
import { useMusicStore } from "../lib/store";

export default function LibraryView() {
  const { tracks, addFiles, deleteTrackById } = useMusicStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    await addFiles(files);
    toast.success(`Added ${files.length} track(s)`);
  };

  return (
    <div
      className="min-h-full p-6"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
      }}
      data-ocid="library.section"
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Your Library</h1>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105"
          style={{ background: "#1DB954", color: "#000" }}
          onClick={() => fileInputRef.current?.click()}
          data-ocid="library.upload_button"
        >
          <Upload size={16} /> Upload Music
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) {
              handleFiles(e.target.files);
              e.target.value = "";
            }
          }}
        />
      </div>

      {tracks.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed gap-4"
          style={{ borderColor: "#282828" }}
          data-ocid="library.empty_state"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "#282828" }}
          >
            <Music size={28} style={{ color: "#1DB954" }} />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-lg">
              Your library is empty
            </p>
            <p className="text-sm mt-1" style={{ color: "#b3b3b3" }}>
              Upload audio files or drag &amp; drop them here
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold mt-2"
            style={{ background: "#1DB954", color: "#000" }}
            onClick={() => fileInputRef.current?.click()}
            data-ocid="library.primary_button"
          >
            <Upload size={16} /> Upload Music
          </button>
        </div>
      ) : (
        <div className="flex flex-col">
          <div
            className="grid grid-cols-4 px-4 pb-2 text-xs uppercase tracking-wider border-b mb-2"
            style={{ color: "#b3b3b3", borderColor: "#282828" }}
          >
            <span className="col-span-2">Title</span>
            <span>Artist</span>
            <span className="text-right">Duration</span>
          </div>
          {tracks.map((track, i) => (
            <TrackRow
              key={track.id}
              track={track}
              index={i}
              showDelete
              onDelete={deleteTrackById}
            />
          ))}
        </div>
      )}
    </div>
  );
}
