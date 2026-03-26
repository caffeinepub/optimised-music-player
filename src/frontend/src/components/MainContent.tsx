import { Menu } from "lucide-react";
import { usePlayerStore } from "../lib/store";
import FavoritesView from "../views/FavoritesView";
import LibraryView from "../views/LibraryView";
import PlaylistView from "../views/PlaylistView";
import QueueView from "../views/QueueView";
import SearchView from "../views/SearchView";

export default function MainContent() {
  const activeView = usePlayerStore((s) => s.activeView);
  const setSidebarOpen = usePlayerStore((s) => s.setSidebarOpen);
  const playlists = usePlayerStore((s) => s.playlists);

  const renderView = () => {
    if (activeView === "library") return <LibraryView />;
    if (activeView === "favorites") return <FavoritesView />;
    if (activeView === "queue") return <QueueView />;
    if (activeView === "search") return <SearchView />;
    if (activeView.startsWith("playlist-")) {
      const playlistId = activeView.replace("playlist-", "");
      const playlist = playlists.find((p) => p.id === playlistId);
      if (playlist) return <PlaylistView playlist={playlist} />;
    }
    return <LibraryView />;
  };

  return (
    <div className="flex-1 overflow-y-auto" data-ocid="main.panel">
      {/* Mobile top bar */}
      <div className="flex md:hidden items-center gap-3 px-4 py-3 sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <button
          type="button"
          data-ocid="main.menu.button"
          onClick={() => setSidebarOpen(true)}
          className="text-foreground"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-semibold text-sm text-primary">
          Optimised Music Player
        </span>
      </div>

      <div className="px-4 md:px-6 py-4">{renderView()}</div>
    </div>
  );
}
