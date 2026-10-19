"use client";

import { memo, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  Maximize2,
  Minimize2,
  Trash2,
  ArrowUp,
  Sparkles,
  Moon,
  Sun,
  Copy,
  Check,
  TriangleAlert,
} from "lucide-react";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { cn } from "@/lib/utils";
import type { ChatWorkspaceNode } from "@/types";
import { ChatMessageContent } from "./ChatMessageContent";

const QUICK_PROMPTS = [
  { label: "Skills", prompt: "Summarize Om's documented technical skills." },
  { label: "Education", prompt: "Summarize Om's education history." },
  {
    label: "Experience",
    prompt:
      "Summarize Om's employment and internships, including organizations, roles, dates, and documented responsibilities. Do not substitute project work for employment.",
  },
  {
    label: "Achievements",
    prompt:
      "Summarize Om's listed awards, hackathon results, and leadership achievements. State participation counts exactly as documented; do not infer additional events.",
  },
] as const;

function ChatNodeComponent({ id, data, selected }: NodeProps<ChatWorkspaceNode>) {
  const { chats, deleteChatNode, sendChatMessage, isDarkMode, toggleDarkMode } =
    useWorkspaceStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const expandedMessagesEndRef = useRef<HTMLDivElement>(null);

  const hasMultipleChats = chats.length > 1;
  const isSending = data.status === "active";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    expandedMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data.messages, isSending, isExpanded]);

  // Track if chat has been initiated (more than initial state, or user sent message)
  // Per hand-drawn sketch: "only first time when card created. if chat initiated this will get invisible"
  const isChatInitiated =
    data.messages &&
    data.messages.some((msg) => msg.role === "user");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inputVal.trim()) return;

    sendChatMessage(id, inputVal.trim());
    setInputVal("");
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteChatNode(id);
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  const handleCopyConversation = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const transcript = [
      data.title || "Portfolio conversation",
      ...data.messages.map((message) => {
        const speaker = message.role === "user" ? "You" : "Assistant";
        return `${speaker}:\n${message.content}`;
      }),
    ].join("\n\n");

    try {
      await navigator.clipboard.writeText(transcript);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  };

  const copyConversationButton = (
    <button
      type="button"
      onClick={handleCopyConversation}
      className="nodrag flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.04] text-zinc-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
      title={
        copyState === "copied"
          ? "Conversation copied"
          : copyState === "error"
            ? "Could not copy conversation"
            : "Copy conversation"
      }
      aria-label={
        copyState === "copied"
          ? "Conversation copied"
          : copyState === "error"
            ? "Could not copy conversation"
            : "Copy conversation"
      }
    >
      {copyState === "copied" ? (
        <Check className="h-3.5 w-3.5 text-emerald-300" />
      ) : copyState === "error" ? (
        <TriangleAlert className="h-3.5 w-3.5 text-rose-300" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );

  return (
    <>
      <div
      className={cn(
        "chat-node-card group relative w-[380px] rounded-[26px] bg-[#16171c]/90 p-4.5 text-zinc-100 select-none",
        "border border-white/[0.08] backdrop-blur-2xl shadow-2xl shadow-black/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]",
        "transition-all duration-200 flex flex-col",
        selected
          ? "border-purple-400/50 ring-1 ring-purple-500/30 shadow-[0_0_24px_rgba(168,85,247,0.2)]"
          : "hover:border-white/[0.18]",
        isExpanded && "pointer-events-none opacity-0"
      )}
    >
      {/* Ambient Radial Glow Layer behind the card */}
      <div className="pointer-events-none absolute -inset-3 bg-gradient-to-tr from-purple-600/20 via-pink-600/10 to-indigo-600/15 rounded-[36px] blur-2xl opacity-70 -z-10" />

      <Handle
        type="target"
        position={Position.Left}
        id="in"
        className="!w-3 !h-3 !bg-purple-400 group-hover:!bg-white !border-2 !border-[#16171c] transition-colors shadow-[0_0_8px_rgba(168,85,247,0.6)]"
      />

      <Handle
        type="target"
        position={Position.Bottom}
        id="documents"
        className="!w-3 !h-3 !bg-emerald-400 group-hover:!bg-emerald-200 !border-2 !border-[#16171c] transition-colors shadow-[0_0_8px_rgba(52,211,153,0.6)]"
      />

      {/* 1. TOP BAR: Delete icon on Left, Expand icon on Right (Exact Hand-Drawn Sketch Layout) */}
      <div className="flex items-center justify-between w-full mb-2">
        <div className="flex items-center gap-1.5">
          {data.deletable !== false && (
            <button
              type="button"
              onClick={handleDelete}
              className="nodrag flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.04] text-zinc-400 transition-colors hover:bg-white/10 hover:text-rose-400 cursor-pointer"
              title={
                hasMultipleChats
                  ? "Delete this chat node"
                  : "Clear conversation (Reset to initial welcome state)"
              }
              aria-label="Delete chat"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          {copyConversationButton}
        </div>

        {/* Center Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-300 font-mono">
          <Sparkles className="h-2.5 w-2.5 text-purple-400" />
          <span>Interactive Agent</span>
        </div>

        {/* Top-Right Expand Icon */}
        <button
          type="button"
          onClick={handleToggleExpand}
          className="nodrag flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/10 transition-colors border border-white/[0.06] cursor-pointer"
          title={isExpanded ? "Collapse card" : "Expand card"}
          aria-label="Toggle expand"
        >
          {isExpanded ? (
            <Minimize2 className="h-3.5 w-3.5" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* 2. HEADER TEXT (Exact text from hand-drawn sketch: "Hi, I am Om let's discuss about me!") */}
      <div className="text-center px-2 mb-3.5">
        <h3 className="text-base font-bold text-white tracking-tight leading-snug">
          Hi, I am Om, let&apos;s discuss about me!
        </h3>
        <p className="text-[11px] text-zinc-400 font-normal mt-0.5">
          Ask questions about my experience, skills, and architecture.
        </p>
      </div>

      {/* 3. MIDDLE AREA:
          - FIRST TIME ONLY: Initial Welcome Box with purple badge (Invisible once chat initiated)
          - AFTER CHAT INITIATED: Live message stream
      */}
      {!isChatInitiated ? (
        // Only first time when card created; disappears when chat is initiated
        <div className="rounded-2xl bg-black/40 border border-purple-500/30 p-3.5 mb-3.5 shadow-inner">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-purple-200">
              Connected to Portfolio Knowledge
            </span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Ask a question about the information in my portfolio.
          </p>
          <div className="nodrag mt-2.5 flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map(({ label, prompt }) => (
              <button
                key={label}
                type="button"
                onClick={() => sendChatMessage(id, prompt)}
                disabled={isSending}
                className="nodrag px-2 py-0.5 rounded-full bg-white/[0.05] hover:bg-purple-600/20 text-zinc-300 hover:text-purple-200 border border-white/[0.06] hover:border-purple-500/30 text-[10px] transition-colors cursor-pointer"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        // Live conversation area once chat has been initiated
        <div
          className={cn(
            "nowheel nodrag select-text cursor-auto space-y-2 mb-3.5 overflow-y-auto px-1 pr-1.5 transition-all",
            isExpanded ? "max-h-64" : "max-h-60"
          )}
        >
          {data.messages &&
            data.messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "rounded-xl p-2.5 text-xs leading-relaxed border transition-colors",
                  msg.role === "assistant"
                    ? "bg-black/35 border-white/[0.06] text-zinc-300 shadow-sm"
                    : "bg-purple-950/40 border-purple-500/30 text-purple-100 ml-6 text-right"
                )}
              >
                {msg.role === "assistant" ? (
                  <ChatMessageContent content={msg.content} compact />
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            ))}
          {isSending && (
            <p className="px-2 text-xs text-zinc-400 animate-pulse" role="status">
              Thinking...
            </p>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* 4. BOTTOM INPUT AREA (Matching sketch input field with send button) */}
      <form
        onSubmit={handleSend}
        className="nodrag flex items-center gap-2 rounded-xl bg-black/55 border border-white/[0.08] p-1.5 focus-within:border-purple-500/40 focus-within:ring-1 focus-within:ring-purple-500/30 transition-all mt-auto"
      >
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={isSending ? "Waiting for a response..." : "Ask anything about Om..."}
          disabled={isSending}
          className="nodrag flex-1 bg-transparent px-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputVal.trim() || isSending}
          className="nodrag flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 disabled:opacity-40 disabled:hover:from-purple-500 transition-all cursor-pointer shadow-sm"
          title="Send query"
          aria-label="Send query"
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
      </form>

      <Handle
        type="source"
        position={Position.Right}
        id="out"
        className="!w-3 !h-3 !bg-purple-400 group-hover:!bg-white !border-2 !border-[#16171c] transition-colors shadow-[0_0_8px_rgba(168,85,247,0.6)]"
      />
    </div>
      {isExpanded && typeof document !== "undefined" &&
        createPortal(
          <div
            data-theme={isDarkMode ? "dark" : "light"}
            className="chat-expanded-overlay fixed inset-0 z-[100] flex h-dvh w-dvw flex-col overflow-hidden bg-[#0d0e12] px-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-[calc(env(safe-area-inset-bottom)+0.75rem)] text-zinc-100 md:px-16 md:py-10"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`chat-title-${id}`}
          >
            <header className="flex w-full shrink-0 items-start justify-between gap-2 border-b border-white/10 pb-3 sm:pb-5">
              <div>
                <h2 id={`chat-title-${id}`} className="text-xl font-semibold text-white">
                  {data.title || "Interactive Agent"}
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Hi, I am Om, let&apos;s discuss about me!
                </p>
              </div>
              <div className="flex items-center gap-2">
                {copyConversationButton}
                <button
                  type="button"
                  onClick={toggleDarkMode}
                  aria-pressed={isDarkMode}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
                  title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
                >
                  {isDarkMode ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Collapse chat"
                  title="Collapse chat"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
              </div>
            </header>

            <div className="flex min-h-0 flex-1 justify-center overflow-y-auto py-3 sm:py-8 select-text cursor-auto">
              <div className="w-full max-w-4xl space-y-3">
                {data.messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "max-w-[85%] rounded-2xl border p-4 text-sm leading-relaxed",
                      message.role === "user"
                        ? "ml-auto border-purple-500/30 bg-purple-950/40 text-purple-100"
                        : "border-white/[0.08] bg-white/[0.04] text-zinc-300"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <ChatMessageContent content={message.content} />
                    ) : (
                      message.content
                    )}
                  </div>
                ))}
                {isSending && (
                  <p className="text-sm text-zinc-400 animate-pulse" role="status">
                    Thinking...
                  </p>
                )}
                <div ref={expandedMessagesEndRef} />
              </div>
            </div>

            <form
              onSubmit={handleSend}
              className="mx-auto flex w-full max-w-4xl shrink-0 items-center gap-2 rounded-xl border border-white/[0.1] bg-black/40 p-2 focus-within:border-purple-500/40"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(event) => setInputVal(event.target.value)}
                placeholder={isSending ? "Waiting for a response..." : "Ask anything about Om..."}
                disabled={isSending}
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputVal.trim() || isSending}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white disabled:opacity-40 md:h-9 md:w-9"
                aria-label="Send query"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </form>
          </div>,
          document.body
        )}
    </>
  );
}

export const ChatNode = memo(ChatNodeComponent);
