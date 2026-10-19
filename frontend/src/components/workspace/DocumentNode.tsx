"use client";

import { memo, useRef } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  FileText,
  FileCode,
  Globe,
  Image as ImageIcon,
  File,
  Trash2,
  Database,
  Plus,
} from "lucide-react";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { cn } from "@/lib/utils";
import type { DocumentWorkspaceNode, DocumentFileType } from "@/types";

function getDocumentIcon(fileType?: DocumentFileType) {
  switch (fileType) {
    case "pdf":
      return {
        icon: FileText,
        colorClass: "from-rose-500/20 to-rose-600/10 text-rose-400 border-rose-500/20",
      };
    case "json":
      return {
        icon: FileCode,
        colorClass: "from-cyan-500/20 to-blue-600/10 text-cyan-400 border-cyan-500/20",
      };
    case "image":
      return {
        icon: ImageIcon,
        colorClass: "from-emerald-500/20 to-teal-600/10 text-emerald-400 border-emerald-500/20",
      };
    case "web":
      return {
        icon: Globe,
        colorClass: "from-purple-500/20 to-indigo-600/10 text-purple-400 border-purple-500/20",
      };
    default:
      return {
        icon: File,
        colorClass: "from-zinc-500/20 to-zinc-600/10 text-zinc-400 border-zinc-500/20",
      };
  }
}

function DocumentNodeComponent({ id, data, selected }: NodeProps<DocumentWorkspaceNode>) {
  const { deleteDocumentNode, setDocumentFile } = useWorkspaceStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconConfig = getDocumentIcon(data.fileType);
  const IconComponent = iconConfig.icon;

  const isDeletable = data.deletable !== false;
  const isBackendSource = data.source === "backend";

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeletable) {
      deleteDocumentNode(id);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (file) void setDocumentFile(id, file);
    event.currentTarget.value = "";
  };

  return (
    <div
      className={cn(
        "document-node-card group relative w-[220px] rounded-[24px] bg-[#16171c]/85 p-4 text-zinc-100 select-none",
        "border border-white/[0.08] backdrop-blur-2xl shadow-2xl shadow-black/85 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]",
        "flex flex-col items-center text-center transition-all duration-200",
        selected
          ? "border-purple-400/50 ring-1 ring-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
          : "hover:border-white/[0.16]"
      )}
    >
      {/* Ambient Radial Glow behind the card */}
      <div className="pointer-events-none absolute -inset-2 bg-gradient-to-tr from-purple-600/15 via-indigo-600/10 to-transparent rounded-[32px] blur-xl opacity-60 -z-10" />

      {isBackendSource && (
        <Handle
          type="target"
          position={Position.Left}
          id="in"
          className="!w-3 !h-3 !bg-zinc-400 group-hover:!bg-purple-300 !border-2 !border-[#16171c] transition-colors"
        />
      )}

      {data.pendingUpload ? (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md,.json,application/pdf,text/plain,text/markdown,application/json"
            className="hidden"
            onChange={handleFileChange}
            aria-label="Choose a document"
          />
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="nodrag mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] text-zinc-300 transition-colors hover:border-purple-400/60 hover:bg-purple-500/15 hover:text-purple-200"
            aria-label="Choose a document from your device"
          >
            <Plus className="h-6 w-6" />
          </button>
          <p className="text-sm font-medium text-zinc-300">Add the document</p>
          {isDeletable && (
            <button
              type="button"
              onClick={handleDelete}
              className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-zinc-500 opacity-100 transition-all hover:bg-black/60 hover:text-rose-400 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100"
              title="Delete document"
              aria-label="Delete document"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </>
      ) : (
        <>

      {/* Top Meta Indicator: Backend Knowledge vs User Delete */}
      <div className="w-full flex items-center justify-between mb-2.5">
        {isBackendSource ? (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[9.5px] text-purple-300 font-mono">
            <Database className="h-2.5 w-2.5 text-purple-400" />
            <span>Connected Knowledge</span>
          </div>
        ) : (
          <span className="text-[10px] text-zinc-500 font-mono">User Document</span>
        )}

        {isDeletable && (
          <button
            type="button"
            onClick={handleDelete}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-black/40 text-zinc-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100 hover:text-rose-400 hover:bg-black/80 transition-all border border-white/5 cursor-pointer ml-auto"
            title="Delete document"
            aria-label="Delete document"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Media Tile Icon matching reference design */}
      <div
        className={cn(
          "mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b border shadow-inner transition-transform group-hover:scale-105",
          iconConfig.colorClass
        )}
      >
        <IconComponent className="h-7 w-7" />
      </div>

      {/* Title */}
      <h4
        className="mb-1 block w-full min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold text-white"
        title={data.title || data.name}
      >
        {data.title || data.name}
      </h4>

      {/* Meta Subtitle */}
      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono mb-2">
        <span>{data.fileCount || 1} {data.fileCount === 1 ? "Item" : "Items"}</span>
        <span>•</span>
        <span className="uppercase text-[10px] text-zinc-500 font-semibold">{data.fileType}</span>
      </div>

      {data.uploading ? (
        <p className="text-[10px] text-zinc-400" role="status">
          Uploading and extracting text...
        </p>
      ) : data.error ? (
        <p className="text-[10px] text-rose-300" role="alert">
          {data.error}
        </p>
      ) : data.summary ? (
        <p className="line-clamp-3 text-[10px] leading-relaxed text-zinc-400">
          {data.summary}
        </p>
      ) : null}

      {/* Tag pills */}
      {data.tags && data.tags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1 mt-1">
          {data.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-[10px] text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

        </>
      )}

      <Handle
        type="source"
        position={isBackendSource ? Position.Right : Position.Top}
        id="out"
        className="!w-3 !h-3 !bg-zinc-400 group-hover:!bg-purple-300 !border-2 !border-[#16171c] transition-colors"
      />
    </div>
  );
}

export const DocumentNode = memo(DocumentNodeComponent);
