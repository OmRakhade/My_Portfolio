"use client";

import { useReactFlow } from "@xyflow/react";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { cn } from "@/lib/utils";
import type { ZoomLevel } from "@/types";

const ZOOM_OPTIONS: { label: string; value: ZoomLevel }[] = [
  { label: "75%", value: 0.75 },
  { label: "100%", value: 1 },
  { label: "125%", value: 1.25 },
];

export function WorkspaceControls() {
  const { zoomTo } = useReactFlow();
  const { zoomLevel, setZoomLevel } = useWorkspaceStore();

  const handleZoom = (level: ZoomLevel) => {
    setZoomLevel(level);
    zoomTo(level, { duration: 300 });
  };

  return (
    <div
      role="group"
      aria-label="Workspace Zoom Controls"
      className="workspace-zoom-controls flex items-center gap-1 rounded-full bg-[#16171c]/85 backdrop-blur-xl border border-white/[0.08] p-1 shadow-2xl shadow-black/80 select-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]"
    >
      {ZOOM_OPTIONS.map((opt) => {
        const isActive = zoomLevel === opt.value;
        return (
          <button
            key={opt.label}
            type="button"
            onClick={() => handleZoom(opt.value)}
            aria-pressed={isActive}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium font-mono transition-all duration-150 cursor-pointer",
              isActive
                ? "bg-purple-600/30 text-purple-200 border border-purple-500/40 font-semibold shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-transparent"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
