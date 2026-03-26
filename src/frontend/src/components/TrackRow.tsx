import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Heart,
  ListPlus,
  ListStart,
  MoreHorizontal,
  Play,
  PlusSquare,
  Trash2,
} from "lucide-react";
import type { Track } from "../lib/db";
import { formatDuration } from "../lib/helpers";
import { PlaceholderArt } from "../lib/placeholderArt";
import { usePlayerStore } from "../lib/store";
import type { Playlist } from "../lib/store";

interface TrackRowProps {
  track: Track;
  index: number;
  playlists: Playlist[];
  onPlay?: () => void;
  extraMenuItems?: React.ReactNode;
  showIndex?: boolean;
}

export function TrackRow({
  track,
  index,
  playlists,
  onPlay,
  extraMenuItems,
  showIndex = true,
}: TrackRowProps) {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const favorites = usePlayerStore((s) => s.favorites);
  const toggleFavorite = usePlayerStore((s) => s.toggleFavorite);
  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const playNext = usePlayerStore((s) => s.playNext);
  const addTrackToPlaylist = usePlayerStore((s) => s.addTrackToPlaylist);
  const deleteTrack = usePlayerStore((s) => s.deleteTrack);
  const playTrack = usePlayerStore((s) => s.playTrack);

  const isCurrentTrack = currentTrack?.id === track.id;
  const isFavorite = favorites.includes(track.id);
  const isActivelyPlaying = isCurrentTrack && isPlaying;

  const handlePlay = () => {
    if (onPlay) onPlay();
    else playTrack(track);
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors",
        isCurrentTrack
          ? "bg-accent border-l-2 border-primary"
          : "hover:bg-accent/60",
      )}
      data-ocid={`track.item.${index}`}
      onDoubleClick={handlePlay}
    >
      {/* Index / Equalizer */}
      <div className="w-6 flex-shrink-0 flex items-center justify-center">
        {isActivelyPlaying ? (
          <div className="flex items-end gap-[2px] h-4">
            <div className="eq-bar h-full" />
            <div className="eq-bar h-full" />
            <div className="eq-bar h-full" />
          </div>
        ) : showIndex ? (
          <>
            <span
              className={cn(
                "text-xs group-hover:hidden",
                isCurrentTrack ? "text-primary" : "text-muted-foreground",
              )}
            >
              {index}
            </span>
            <button
              type="button"
              className="hidden group-hover:flex text-foreground"
              onClick={handlePlay}
              data-ocid={`track.play.button.${index}`}
            >
              <Play className="h-3.5 w-3.5" fill="currentColor" />
            </button>
          </>
        ) : (
          <button
            type="button"
            className="hidden group-hover:flex text-foreground"
            onClick={handlePlay}
            data-ocid={`track.play.button.${index}`}
          >
            <Play className="h-3.5 w-3.5" fill="currentColor" />
          </button>
        )}
      </div>

      {/* Art + Title */}
      <PlaceholderArt title={track.title} size={40} />
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate",
            isCurrentTrack && "text-primary",
          )}
        >
          {track.title}
        </p>
        <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
      </div>

      {/* Duration */}
      <span className="text-xs text-muted-foreground flex-shrink-0 hidden sm:block">
        {formatDuration(track.duration)}
      </span>

      {/* Favorite */}
      <button
        type="button"
        data-ocid={`track.favorite.toggle.${index}`}
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(track.id);
        }}
        className={cn(
          "flex-shrink-0 transition-colors",
          isFavorite
            ? "text-primary"
            : "text-muted-foreground opacity-0 group-hover:opacity-100",
        )}
      >
        <Heart
          className="h-4 w-4"
          fill={isFavorite ? "currentColor" : "none"}
        />
      </button>

      {/* More menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            data-ocid={`track.more.button.${index}`}
            className="flex-shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground transition-colors p-1 rounded"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-popover border-border">
          <DropdownMenuItem
            onClick={() => addToQueue(track)}
            data-ocid={`track.add_to_queue.button.${index}`}
          >
            <ListPlus className="h-4 w-4 mr-2" /> Add to Queue
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => playNext(track)}
            data-ocid={`track.play_next.button.${index}`}
          >
            <ListStart className="h-4 w-4 mr-2" /> Play Next
          </DropdownMenuItem>
          {playlists.length > 0 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <PlusSquare className="h-4 w-4 mr-2" /> Add to Playlist
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-popover border-border">
                {playlists.map((pl) => (
                  <DropdownMenuItem
                    key={pl.id}
                    onClick={() => addTrackToPlaylist(pl.id, track.id)}
                    data-ocid={`track.add_to_playlist.button.${index}`}
                  >
                    {pl.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
          {extraMenuItems && <DropdownMenuSeparator />}
          {extraMenuItems}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => deleteTrack(track.id)}
            className="text-destructive"
            data-ocid={`track.delete.button.${index}`}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
