import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Clock, Music2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { TrackRow } from "../components/TrackRow";
import { formatDuration } from "../lib/helpers";
import { PlaceholderArt } from "../lib/placeholderArt";
import { usePlayerStore } from "../lib/store";
import type { Playlist } from "../lib/store";

interface PlaylistViewProps {
  playlist: Playlist;
}

export default function PlaylistView({ playlist }: PlaylistViewProps) {
  const tracks = usePlayerStore((s) => s.tracks);
  const playlists = usePlayerStore((s) => s.playlists);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const deletePlaylist = usePlayerStore((s) => s.deletePlaylist);
  const addTrackToPlaylist = usePlayerStore((s) => s.addTrackToPlaylist);
  const removeTrackFromPlaylist = usePlayerStore(
    (s) => s.removeTrackFromPlaylist,
  );

  const [addOpen, setAddOpen] = useState(false);
  const [addSearch, setAddSearch] = useState("");

  const playlistTracks = playlist.trackIds
    .map((id) => tracks.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => !!t);

  const totalDuration = playlistTracks.reduce((acc, t) => acc + t.duration, 0);

  const availableToAdd = tracks.filter(
    (t) =>
      !playlist.trackIds.includes(t.id) &&
      (addSearch === "" ||
        t.title.toLowerCase().includes(addSearch.toLowerCase()) ||
        t.artist.toLowerCase().includes(addSearch.toLowerCase())),
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div
          className="w-24 h-24 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "oklch(var(--accent))" }}
        >
          <Music2 className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Playlist
          </p>
          <h1 className="text-3xl font-bold truncate">{playlist.name}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            <span>
              {playlistTracks.length} track
              {playlistTracks.length !== 1 ? "s" : ""}
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(totalDuration)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            size="sm"
            onClick={() => setAddOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-ocid="playlist.add_songs.button"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Songs
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deletePlaylist(playlist.id)}
            className="text-destructive hover:text-destructive"
            data-ocid="playlist.delete.button"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tracks */}
      {playlistTracks.length === 0 ? (
        <div
          className="flex flex-col items-center py-16 text-center"
          data-ocid="playlist.empty_state"
        >
          <Music2 className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No songs in this playlist</p>
          <Button
            className="mt-4"
            onClick={() => setAddOpen(true)}
            data-ocid="playlist.empty.add.button"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Songs
          </Button>
        </div>
      ) : (
        <div className="space-y-0.5" data-ocid="playlist.list">
          {playlistTracks.map((track, i) => (
            <TrackRow
              key={track.id}
              track={track}
              index={i + 1}
              playlists={playlists}
              onPlay={() => playTrack(track)}
              extraMenuItems={
                <DropdownMenuItem
                  onClick={() => removeTrackFromPlaylist(playlist.id, track.id)}
                  className="text-destructive"
                  data-ocid={`playlist.remove_track.button.${i + 1}`}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Remove from Playlist
                </DropdownMenuItem>
              }
            />
          ))}
        </div>
      )}

      {/* Add Songs Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent
          className="bg-card border-border max-w-md"
          data-ocid="playlist.add_songs.dialog"
        >
          <DialogHeader>
            <DialogTitle>Add Songs to {playlist.name}</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Search..."
            value={addSearch}
            onChange={(e) => setAddSearch(e.target.value)}
            className="mb-2"
            data-ocid="playlist.add_songs_search.input"
          />
          <ScrollArea className="h-72">
            {availableToAdd.length === 0 ? (
              <p className="text-sm text-muted-foreground p-3">
                No tracks to add
              </p>
            ) : (
              availableToAdd.map((track) => (
                <button
                  type="button"
                  key={track.id}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-accent/60 transition-colors text-left",
                  )}
                  onClick={() => addTrackToPlaylist(playlist.id, track.id)}
                >
                  <PlaceholderArt title={track.title} size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {track.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {track.artist}
                    </p>
                  </div>
                  <Plus className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </button>
              ))
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
