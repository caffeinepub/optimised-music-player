import { Search } from "lucide-react";
import { useState } from "react";
import TrackRow from "../components/TrackRow";
import { useMusicStore } from "../lib/store";

export default function SearchView() {
  const { tracks } = useMusicStore();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const filtered = query.trim()
    ? tracks.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.artist.toLowerCase().includes(query.toLowerCase()),
      )
    : tracks;

  return (
    <div className="p-6" data-ocid="search.section">
      <h1 className="text-2xl font-bold text-white mb-4">Search</h1>
      <div className="relative mb-6">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "#b3b3b3" }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs, artists..."
          className="w-full pl-10 pr-4 py-3 rounded-full text-sm text-white outline-none"
          style={{
            background: "#282828",
            border: `2px solid ${focused ? "#1DB954" : "transparent"}`,
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          data-ocid="search.search_input"
        />
      </div>
      {filtered.length === 0 ? (
        <p
          className="text-center py-12"
          style={{ color: "#b3b3b3" }}
          data-ocid="search.empty_state"
        >
          {query ? `No results for "${query}"` : "No tracks in your library"}
        </p>
      ) : (
        <div className="flex flex-col">
          {filtered.map((t, i) => (
            <TrackRow key={t.id} track={t} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
