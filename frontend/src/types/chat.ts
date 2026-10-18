export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  sessionId?: string;
  title: string;
  subtitle?: string;
  avatarUrl?: string;
  systemRole?: string;
  status: "idle" | "ready" | "active";
  tags: string[];
  messages: ChatMessage[];
  deletable?: boolean;
  lastMessageSnippet?: string;
  isExpanded?: boolean;
}
