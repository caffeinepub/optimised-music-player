import { Menu, Music2, X } from "lucide-react";
import { useState } from "react";
import MainContent from "./MainContent";
import MiniPlayer from "./MiniPlayer";
import NowPlayingScreen from "./NowPlayingScreen";
import PlayerBar from "./PlayerBar";
import Sidebar from "./Sidebar";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col" style={{ background: "#0a0a14" }}>
      <div className="flex flex-1 overflow-hidden">
        <aside
          className="hidden md:flex w-60 flex-col flex-shrink-0"
          style={{
            background: "rgba(6,6,16,0.98)",
            borderRight: "1px solid rgba(139,92,246,0.15)",
          }}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="absolute inset-0"
              style={{
                background: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(4px)",
              }}
              onClick={() => setSidebarOpen(false)}
              onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
              role="button"
              tabIndex={0}
              aria-label="Close sidebar"
            />
            <aside
              className="relative w-72 flex flex-col z-10"
              style={{
                background: "rgba(6,6,16,0.99)",
                borderRight: "1px solid rgba(139,92,246,0.2)",
              }}
            >
              <button
                type="button"
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                style={{ color: "rgba(255,255,255,0.5)" }}
                onClick={() => setSidebarOpen(false)}
                data-ocid="sidebar.close_button"
              >
                <X size={18} />
              </button>
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </aside>
          </div>
        )}

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile header */}
          <header
            className="flex items-center gap-3 px-4 py-3 md:hidden flex-shrink-0"
            style={{
              background: "rgba(10,10,20,0.97)",
              borderBottom: "1px solid rgba(139,92,246,0.2)",
              backdropFilter: "blur(10px)",
            }}
          >
            <button
              type="button"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              style={{ color: "rgba(255,255,255,0.7)" }}
              onClick={() => setSidebarOpen(true)}
              data-ocid="nav.toggle"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
                }}
              >
                <Music2 size={14} color="white" />
              </div>
              <span
                className="font-bold text-base"
                style={{
                  background:
                    "linear-gradient(90deg, #8B5CF6, #EC4899, #06B6D4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Music Player
              </span>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto">
            <MainContent />
          </div>
        </main>
      </div>
      <MiniPlayer />
      <PlayerBar />
      <NowPlayingScreen />
    </div>
  );
}
