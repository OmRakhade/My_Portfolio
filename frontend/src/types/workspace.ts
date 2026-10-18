import type { Node, Edge, OnNodesChange, OnEdgesChange, OnConnect } from "@xyflow/react";
import type { Chat } from "./chat";
import type { Document } from "./document";

export type ZoomLevel = 0.75 | 1 | 1.25;
export type ProfileSection =
  | "About"
  | "Thoughts"
  | "Extracurricular"
  | "Education"
  | "Skills"
  | "Experience"
  | "Projects";

export type ChatWorkspaceNode = Node<Chat & Record<string, unknown>, "chatNode">;
export type DocumentWorkspaceNode = Node<Document & Record<string, unknown>, "documentNode">;

export type WorkspaceNode = ChatWorkspaceNode | DocumentWorkspaceNode;
export type WorkspaceEdge = Edge;

export interface WorkspaceStoreState {
  // Nodes & Edges
  nodes: WorkspaceNode[];
  edges: WorkspaceEdge[];

  // Entities
  chats: Chat[];
  documents: Document[];
  activeChatId: string | null;

  // Workspace configuration
  isDarkMode: boolean;
  zoomLevel: ZoomLevel;

  // Profile Panel UI
  isProfileOpen: boolean;
  activeProfileSection: ProfileSection;

  // Flow handlers
  onNodesChange: OnNodesChange<WorkspaceNode>;
  onEdgesChange: OnEdgesChange<WorkspaceEdge>;
  onConnect: OnConnect;

  // Actions
  setActiveChatId: (id: string | null) => void;
  toggleProfile: () => void;
  setProfileOpen: (open: boolean) => void;
  setActiveProfileSection: (section: ProfileSection) => void;
  toggleDarkMode: () => void;
  setZoomLevel: (zoom: ZoomLevel) => void;
  addChatNode: (position?: { x: number; y: number }) => void;
  addDocumentNode: (position?: { x: number; y: number }) => void;
  setSystemDocuments: (documents: Document[]) => void;
  setDocumentFile: (id: string, file: File) => Promise<void>;
  deleteChatNode: (id: string) => void;
  deleteDocumentNode: (id: string) => void;
  sendChatMessage: (chatId: string, content: string) => Promise<void>;
  resetWorkspace: () => void;
}
