import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Heart,
  Library,
  List,
  Music2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { usePlayerStore } from "../lib/store";
import type { ActiveView, Playlist } from "../lib/store";

const navItems: { label: string; view: ActiveView; icon: React.ReactNode }[] = [
  { label: "Library", view: "library", icon: <Library className="h-4 w-4" /> },
  { label: "Search", view: "search", icon: <Search className="h-4 w-4" /> },
  {
    label: "Favorites",
    view: "favorites",
    icon: <Heart className="h-4 w-4" />,
  },
  { label: "Queue", view: "queue", icon: <List className="h-4 w-4" /> },
];

interface SidebarProps {
  onNavigate: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const activeView = usePlayerStore((s) => s.activeView);
  const playlists = usePlayerStore((s) => s.playlists);
  const setActiveView = usePlayerStore((s) => s.setActiveView);
  const createPlaylist = usePlayerStore((s) => s.createPlaylist);
  const renamePlaylist = usePlayerStore((s) => s.renamePlaylist);
  const deletePlaylist = usePlayerStore((s) => s.deletePlaylist);

  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newName, setNewName] = useState("");
  const [editPlaylist, setEditPlaylist] = useState<Playlist | null>(null);
  const [editName, setEditName] = useState("");

  const handleCreate = () => {
    if (!newName.trim()) return;
    createPlaylist(newName.trim());
    setNewName("");
    setShowNewDialog(false);
  };

  const handleRename = () => {
    if (!editPlaylist || !editName.trim()) return;
    renamePlaylist(editPlaylist.id, editName.trim());
    setEditPlaylist(null);
  };

  const navigate = (view: ActiveView) => {
    setActiveView(view);
    onNavigate();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Music2 className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sm text-primary leading-tight">
          Optimised
          <br />
          Music Player
        </span>
      </div>

      {/* Nav */}
      <nav className="px-3 space-y-0.5 flex-shrink-0">
        {navItems.map((item) => (
          <button
            type="button"
            key={item.view}
            data-ocid={`nav.${item.view}.link`}
            onClick={() => navigate(item.view)}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors",
              activeView === item.view
                ? "bg-accent text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mx-4 my-3 border-t border-border flex-shrink-0" />

      {/* Playlists */}
      <div className="flex items-center justify-between px-5 mb-2 flex-shrink-0">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Playlists
        </span>
        <button
          type="button"
          data-ocid="sidebar.create_playlist.button"
          onClick={() => setShowNewDialog(true)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="New Playlist"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <ScrollArea className="flex-1 px-3">
        {playlists.length === 0 && (
          <p className="text-xs text-muted-foreground px-3 py-2">
            No playlists yet
          </p>
        )}
        {playlists.map((pl) => (
          <button
            type="button"
            key={pl.id}
            className={cn(
              "group flex items-center gap-2 w-full px-3 py-2 rounded-md transition-colors text-left",
              activeView === `playlist-${pl.id}`
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
            )}
            data-ocid="sidebar.playlist.link"
            onClick={() => navigate(`playlist-${pl.id}`)}
          >
            <Music2 className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="text-sm flex-1 truncate">{pl.name}</span>
            <div className="hidden group-hover:flex items-center gap-1">
              <button
                type="button"
                data-ocid="sidebar.playlist.edit_button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditPlaylist(pl);
                  setEditName(pl.name);
                }}
                className="p-0.5 rounded hover:text-foreground"
              >
                <Pencil className="h-3 w-3" />
              </button>
              <button
                type="button"
                data-ocid="sidebar.playlist.delete_button"
                onClick={(e) => {
                  e.stopPropagation();
                  deletePlaylist(pl.id);
                }}
                className="p-0.5 rounded hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </button>
        ))}
      </ScrollArea>

      {/* Footer */}
      <div className="px-4 py-3 flex-shrink-0">
        <p className="text-[11px] text-muted-foreground">
          &copy; {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Built with ❤️ caffeine.ai
          </a>
        </p>
      </div>

      {/* New Playlist Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>New Playlist</DialogTitle>
          </DialogHeader>
          <Input
            data-ocid="sidebar.playlist_name.input"
            placeholder="Playlist name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowNewDialog(false)}
              data-ocid="sidebar.create_playlist.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              data-ocid="sidebar.create_playlist.confirm_button"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Playlist Dialog */}
      <Dialog
        open={!!editPlaylist}
        onOpenChange={(o) => !o && setEditPlaylist(null)}
      >
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Rename Playlist</DialogTitle>
          </DialogHeader>
          <Input
            data-ocid="sidebar.rename_playlist.input"
            placeholder="New name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            autoFocus
          />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setEditPlaylist(null)}
              data-ocid="sidebar.rename_playlist.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              data-ocid="sidebar.rename_playlist.confirm_button"
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
