import {
  BarChart2,
  Clock,
  Heart,
  Library,
  ListMusic,
  Music2,
  Plus,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Upload,
} from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { type ViewType, useMusicStore } from "../lib/store";

interface SidebarProps {
  onClose: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { currentView, setCurrentView, playlists, createPlaylist, addFiles } =
    useMusicStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navItems: { label: string; view: ViewType; icon: React.ReactNode }[] = [
    { label: "Library", view: "library", icon: <Library size={18} /> },
    { label: "Search", view: "search", icon: <Search size={18} /> },
    { label: "Queue", view: "queue", icon: <ListMusic size={18} /> },
    { label: "Liked Songs", view: "favorites", icon: <Heart size={18} /> },
    {
      label: "Recently Played",
      view: "recently-played",
      icon: <Clock size={18} />,
    },
    { label: "Stats", view: "stats", icon: <BarChart2 size={18} /> },
  ];

  const smartPlaylists: {
    label: string;
    view: ViewType;
    icon: React.ReactNode;
  }[] = [
    {
      label: "Recently Added",
      view: "smart-recently-added",
      icon: <Sparkles size={16} />,
    },
    {
      label: "Most Played",
      view: "smart-most-played",
      icon: <TrendingUp size={16} />,
    },
    { label: "Top 50", view: "smart-top-50", icon: <Star size={16} /> },
  ];

  const isActive = (view: ViewType) => {
    if (typeof currentView === "object" && typeof view === "object") {
      return (
        (currentView as { type: string; id: string }).id ===
        (view as { type: string; id: string }).id
      );
    }
    return currentView === view;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      await addFiles(e.target.files);
      toast.success(`Added ${e.target.files.length} track(s)`);
    }
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) {
      await addFiles(e.dataTransfer.files);
      toast.success(`Added ${e.dataTransfer.files.length} track(s)`);
    }
  };

  const navBtn = (
    view: ViewType,
    icon: React.ReactNode,
    label: string,
    ocid: string,
  ) => (
    <button
      type="button"
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left w-full"
      style={{
        color: isActive(view) ? "white" : "rgba(255,255,255,0.5)",
        background: isActive(view)
          ? "linear-gradient(135deg, rgba(139,92,246,0.35), rgba(236,72,153,0.2))"
          : "transparent",
        borderLeft: isActive(view)
          ? "2px solid #8B5CF6"
          : "2px solid transparent",
      }}
      onClick={() => {
        setCurrentView(view);
        onClose();
      }}
      data-ocid={ocid}
    >
      <span style={{ color: isActive(view) ? "#a78bfa" : "inherit" }}>
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );

  return (
    <div
      className="flex flex-col h-full px-3 py-4 gap-1"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 pb-4">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #8B5CF6, #EC4899)" }}
        >
          <Music2 size={16} color="white" />
        </div>
        <span
          className="font-bold text-lg"
          style={{
            background: "linear-gradient(90deg, #a78bfa, #f472b6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Music
        </span>
      </div>

      {/* Upload button */}
      <button
        type="button"
        className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition-all mb-3 hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
          color: "#fff",
          boxShadow: "0 4px 16px rgba(139,92,246,0.4)",
        }}
        onClick={() => fileInputRef.current?.click()}
        data-ocid="sidebar.upload_button"
      >
        <Upload size={16} /> Upload Music
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) =>
          navBtn(
            item.view,
            item.icon,
            item.label,
            `nav.${String(item.view)}.link`,
          ),
        )}
      </nav>

      <div className="mt-4 flex-1 overflow-y-auto">
        {/* Smart Playlists */}
        <div className="mb-3">
          <div className="flex items-center px-3 mb-1.5">
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{
                background: "linear-gradient(90deg, #8B5CF6, #06B6D4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Smart Playlists
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            {smartPlaylists.map((sp) =>
              navBtn(sp.view, sp.icon, sp.label, `nav.${String(sp.view)}.link`),
            )}
          </div>
        </div>

        {/* User Playlists */}
        <div className="flex items-center justify-between px-3 mb-2">
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{
              background: "linear-gradient(90deg, #EC4899, #06B6D4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Playlists
          </span>
          <button
            type="button"
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            style={{ color: "rgba(255,255,255,0.5)" }}
            onClick={() => {
              const n = prompt("Playlist name:");
              if (n?.trim()) createPlaylist(n.trim());
            }}
            data-ocid="playlist.open_modal_button"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="flex flex-col gap-0.5">
          {playlists.map((pl) => {
            const view: ViewType = { type: "playlist", id: pl.id };
            const active = isActive(view);
            return (
              <button
                type="button"
                key={pl.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left w-full"
                style={{
                  color: active ? "white" : "rgba(255,255,255,0.5)",
                  background: active
                    ? "linear-gradient(135deg, rgba(139,92,246,0.35), rgba(236,72,153,0.2))"
                    : "transparent",
                  borderLeft: active
                    ? "2px solid #8B5CF6"
                    : "2px solid transparent",
                }}
                onClick={() => {
                  setCurrentView(view);
                  onClose();
                }}
                data-ocid="playlist.link"
              >
                <ListMusic
                  size={16}
                  style={{ color: active ? "#a78bfa" : "inherit" }}
                />
                <span className="truncate">{pl.name}</span>
              </button>
            );
          })}
          {playlists.length === 0 && (
            <p
              className="px-3 py-2 text-xs"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              No playlists yet
            </p>
          )}
        </div>
      </div>

      <div
        className="pt-2 border-t"
        style={{ borderColor: "rgba(139,92,246,0.15)" }}
      >
        <p className="text-xs px-3" style={{ color: "rgba(255,255,255,0.2)" }}>
          Drag audio files here to upload
        </p>
        <p
          className="text-xs px-3 mt-1"
          style={{ color: "rgba(255,255,255,0.2)" }}
        >
          &copy; {new Date().getFullYear()}. Built with &hearts; using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-purple-400 transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
