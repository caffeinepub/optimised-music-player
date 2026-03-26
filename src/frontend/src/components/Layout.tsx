import { AnimatePresence, motion } from "motion/react";
import { usePlayerStore } from "../lib/store";
import MainContent from "./MainContent";
import PlayerBar from "./PlayerBar";
import Sidebar from "./Sidebar";

export default function Layout() {
  const sidebarOpen = usePlayerStore((s) => s.sidebarOpen);
  const setSidebarOpen = usePlayerStore((s) => s.setSidebarOpen);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-60 flex-shrink-0 flex-col bg-sidebar border-r border-border">
        <Sidebar onNavigate={() => {}} />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-40 bg-black/70 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              key="drawer"
              className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col md:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 250 }}
            >
              <Sidebar onNavigate={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <MainContent />
        <PlayerBar />
      </div>
    </div>
  );
}
