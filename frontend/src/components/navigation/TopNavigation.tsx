"use client";

import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { WorkspaceControls } from "@/components/workspace/WorkspaceControls";
import {
  GraduationCap,
  Wrench,
  Briefcase,
  FolderGit2,
  PanelRightOpen,
  PanelRightClose,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ICONS = [
  { label: "Education", icon: GraduationCap },
  { label: "Skills", icon: Wrench },
  { label: "Experience", icon: Briefcase },
  { label: "Projects", icon: FolderGit2 },
] as const;

export function TopNavigation() {
  const {
    isProfileOpen,
    activeProfileSection,
    setActiveProfileSection,
    setProfileOpen,
    toggleProfile,
  } = useWorkspaceStore();

  return (
    <header className="fixed top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none select-none md:top-5 md:left-6 md:right-6">
      {/* Left: Studio Branding Pill */}
      <div className="workspace-brand pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#16171c]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] md:h-auto md:w-auto md:justify-start md:gap-2.5 md:px-3.5 md:py-1.5">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-purple-300">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div className="hidden items-center gap-2 text-xs md:flex">
          <span className="font-semibold text-white tracking-tight">
            AI Workspace
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400 font-mono text-[11px]">
            Portfolio Studio
          </span>
        </div>
      </div>

      {/* Center: 4 Rounded Square Icon Buttons (Exact Wireframe Sketch: Education, Skills, Experience, Projects) */}
      <nav
        aria-label="Portfolio Main Navigation"
        className="workspace-navigation pointer-events-auto flex items-center gap-1 md:gap-2"
      >
        {NAV_ICONS.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              setActiveProfileSection(label);
              setProfileOpen(true);
            }}
            aria-pressed={activeProfileSection === label}
            aria-label={label}
            className={cn(
              "group relative flex h-9 w-9 items-center justify-center rounded-xl md:h-10 md:w-11",
              activeProfileSection === label
                ? "bg-purple-600/25 border-purple-500/40 text-purple-200"
                : "bg-white/[0.03] hover:bg-purple-600/20 border-white/[0.06] hover:border-purple-500/40 text-zinc-400 hover:text-white",
              "border transition-all duration-200 cursor-pointer shadow-sm"
            )}
            title={label}
          >
            <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
          </button>
        ))}
      </nav>

      {/* Right: Zoom Controls & Profile Panel Toggle */}
      <div className="pointer-events-auto flex items-center gap-2.5">
        <div className="hidden md:block">
          <WorkspaceControls />
        </div>

        <button
          type="button"
          onClick={toggleProfile}
          className={cn(
            "profile-toggle flex h-9 w-9 items-center justify-center rounded-full transition-all cursor-pointer shadow-2xl shadow-black/80",
            isProfileOpen
              ? "bg-purple-600/30 text-purple-200 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.25)]"
              : "bg-[#16171c]/85 text-zinc-400 border border-white/[0.08] hover:text-white hover:bg-white/[0.08]"
          )}
          title={isProfileOpen ? "Close Profile Panel" : "Open Profile Panel"}
          aria-label="Toggle profile panel"
        >
          {isProfileOpen ? (
            <PanelRightClose className="h-4 w-4" />
          ) : (
            <PanelRightOpen className="h-4 w-4" />
          )}
        </button>
      </div>
    </header>
  );
}
