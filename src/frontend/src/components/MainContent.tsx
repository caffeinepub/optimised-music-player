import { useMusicStore } from "../lib/store";
import FavoritesView from "../views/FavoritesView";
import LibraryView from "../views/LibraryView";
import PlaylistView from "../views/PlaylistView";
import QueueView from "../views/QueueView";
import RecentlyPlayedView from "../views/RecentlyPlayedView";
import SearchView from "../views/SearchView";
import SmartPlaylistView from "../views/SmartPlaylistView";
import StatsView from "../views/StatsView";

export default function MainContent() {
  const { currentView } = useMusicStore();
  if (typeof currentView === "object" && currentView.type === "playlist")
    return <PlaylistView playlistId={currentView.id} />;
  switch (currentView) {
    case "library":
      return <LibraryView />;
    case "search":
      return <SearchView />;
    case "queue":
      return <QueueView />;
    case "favorites":
      return <FavoritesView />;
    case "recently-played":
      return <RecentlyPlayedView />;
    case "stats":
      return <StatsView />;
    case "smart-recently-added":
      return <SmartPlaylistView mode="recently-added" />;
    case "smart-most-played":
      return <SmartPlaylistView mode="most-played" />;
    case "smart-top-50":
      return <SmartPlaylistView mode="top-50" />;
    default:
      return <LibraryView />;
  }
}
