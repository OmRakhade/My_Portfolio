"use client";

import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { Moon, Plus, Sun } from "lucide-react";

export function BottomToolbar() {
  const { isDarkMode, toggleDarkMode, addDocumentNode, addChatNode } =
    useWorkspaceStore();

  return (
    <aside
      aria-label="Workspace Actions Toolbar"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 select-none pointer-events-auto"
    >
      <div className="workspace-toolbar flex items-center gap-2 rounded-2xl bg-[#16171c]/90 backdrop-blur-2xl border border-white/[0.08] p-1.5 shadow-2xl shadow-black/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
        <button
          type="button"
          onClick={toggleDarkMode}
          aria-pressed={isDarkMode}
          className="mode-toggle flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-zinc-400 transition-all duration-200 hover:bg-white/[0.08] hover:text-white"
          title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
          aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
        >
          {isDarkMode ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        <div className="flex items-center gap-2">
          {/* 2. MIDDLE BUTTON: (+) Add doc (Plus icon + "Add doc" as in sketch) */}
          <button
            type="button"
            onClick={() => addDocumentNode()}
            className="flex h-10 w-auto shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-white/[0.03] px-2.5 text-zinc-300 transition-all duration-200 hover:bg-purple-600/20 hover:text-purple-200 border border-white/[0.06] hover:border-purple-500/40 text-xs font-medium cursor-pointer shadow-sm md:h-9 md:px-3.5"
            aria-label="Add document"
            title="Add Document to Workspace"
          >
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-500/20 text-purple-300">
              <Plus className="h-3 w-3" />
            </div>
            <span>Add doc</span>
          </button>

          {/* 3. RIGHT BUTTON: [+] new chat (Rounded square with [+] labeled "new chat" in sketch) */}
          <button
            type="button"
            onClick={() => addChatNode()}
            className="flex h-10 w-auto shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-2.5 text-white border border-purple-400/40 text-xs font-semibold transition-all duration-200 shadow-[0_0_18px_rgba(168,85,247,0.35)] cursor-pointer hover:from-purple-600 hover:to-indigo-600 md:h-9 md:px-3.5"
            aria-label="New chat"
            title="Create New Chat Node"
          >
            <div className="flex h-4 w-4 items-center justify-center rounded bg-white/20 text-white">
              <Plus className="h-3 w-3 stroke-[2.5]" />
            </div>
            <span>new chat</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
