import { create } from "zustand";
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Connection,
} from "@xyflow/react";
import type {
  Chat,
  Document,
  WorkspaceNode,
  WorkspaceEdge,
  WorkspaceStoreState,
  ZoomLevel,
  ProfileSection,
  DocumentFileType,
} from "@/types";
import { ApiClientError, apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

function getDocumentFileType(fileName: string): DocumentFileType {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (extension === "pdf") return "pdf";
  if (extension === "json") return "json";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(extension ?? "")) {
    return "image";
  }
  if (["html", "htm"].includes(extension ?? "")) return "web";
  return "doc";
}

function createSystemDocumentNodes(documents: Document[]): WorkspaceNode[] {
  return documents.map((document, index) => ({
    id: document.id,
    type: "documentNode",
    position: { x: 100, y: 70 + index * 210 },
    data: { ...document },
  }));
}

function createSystemDocumentEdges(
  documents: Document[],
  chats: Chat[]
): WorkspaceEdge[] {
  return documents.flatMap((document) =>
    chats.map((chat) => ({
      id: `edge-${document.id}-${chat.id}`,
      source: document.id,
      sourceHandle: "out",
      target: chat.id,
      targetHandle: "in",
      animated: true,
      style: { stroke: "#818cf8", strokeWidth: 1.5 },
    }))
  );
}

function getRequestErrorMessage(error: unknown): string {
  if (
    error instanceof ApiClientError &&
    typeof error.data === "object" &&
    error.data !== null &&
    "detail" in error.data
  ) {
    return String(error.data.detail);
  }
  return error instanceof Error ? error.message : "The request failed.";
}

const INITIAL_BACKEND_DOCUMENTS: Document[] = [];

const INITIAL_CHAT: Chat = {
  id: "chat-primary",
  title: "Tensel Assistant",
  subtitle: "AI Architect Copilot",
  avatarUrl: "/images/chat_avatar.jpg",
  systemRole: "Lead Architecture & Systems Advisor",
  status: "ready",
  tags: ["Architecture Core", "AI Platform"],
  deletable: false,
  messages: [
    {
      id: "msg-initial",
      role: "assistant",
      content:
        "Welcome. Ask about Om's portfolio, or connect a document to discuss it with the assistant.",
      timestamp: "10:42 AM",
    },
  ],
  isExpanded: false,
};

const INITIAL_NODES: WorkspaceNode[] = [
  {
    id: INITIAL_CHAT.id,
    type: "chatNode",
    position: { x: 440, y: 130 },
    data: {
      ...INITIAL_CHAT,
    },
  },
  ...createSystemDocumentNodes(INITIAL_BACKEND_DOCUMENTS),
];

const INITIAL_EDGES = createSystemDocumentEdges(INITIAL_BACKEND_DOCUMENTS, [
  INITIAL_CHAT,
]);

export const useWorkspaceStore = create<WorkspaceStoreState>((set, get) => ({
  nodes: INITIAL_NODES,
  edges: INITIAL_EDGES,
  chats: [INITIAL_CHAT],
  documents: INITIAL_BACKEND_DOCUMENTS,
  activeChatId: INITIAL_CHAT.id,

  isDarkMode: true,
  zoomLevel: 1 as ZoomLevel,
  isProfileOpen: true,
  activeProfileSection: "About" as ProfileSection,

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as WorkspaceNode[],
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges) as WorkspaceEdge[],
    });
  },

  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(
        {
          ...connection,
          animated: true,
          style: { stroke: "#818cf8", strokeWidth: 1.5 },
        },
        get().edges
      ) as WorkspaceEdge[],
    });
  },

  setActiveChatId: (activeChatId) => set({ activeChatId }),
  toggleProfile: () => set((state) => ({ isProfileOpen: !state.isProfileOpen })),
  setProfileOpen: (isProfileOpen) => set({ isProfileOpen }),
  setActiveProfileSection: (activeProfileSection) =>
    set({ activeProfileSection }),
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  setZoomLevel: (zoomLevel) => set({ zoomLevel }),

  setSystemDocuments: (systemDocuments) => {
    const state = get();
    const previousSystemIds = new Set(
      state.documents
        .filter((document) => document.source === "backend")
        .map((document) => document.id)
    );
    const userDocuments = state.documents.filter(
      (document) => document.source === "user"
    );

    set({
      documents: [...systemDocuments, ...userDocuments],
      nodes: [
        ...state.nodes.filter(
          (node) =>
            node.type === "chatNode" ||
            (node.type === "documentNode" && node.data.source === "user")
        ),
        ...createSystemDocumentNodes(systemDocuments),
      ],
      edges: [
        ...state.edges.filter((edge) => !previousSystemIds.has(edge.source)),
        ...createSystemDocumentEdges(systemDocuments, state.chats),
      ],
    });
  },

  addChatNode: (position) => {
    const state = get();
    const nextIndex = state.chats.length + 1;
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      title: `Specialist Agent #${nextIndex}`,
      subtitle: "Dedicated Context Node",
      avatarUrl: "/images/chat_avatar.jpg",
      status: "ready",
      deletable: true,
      tags: ["Context Agent", "Interactive"],
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: "Connected to workspace. Ready to discuss project context.",
          timestamp: "Just now",
        },
      ],
      isExpanded: false,
    };

    const newNode: WorkspaceNode = {
      id: newChat.id,
      type: "chatNode",
      position: position || {
        x: 480 + (Math.random() * 80 - 40),
        y: 220 + (Math.random() * 80 - 40),
      },
      data: { ...newChat },
    };

    set({
      chats: [...state.chats, newChat],
      nodes: [...state.nodes, newNode],
      edges: [
        ...state.edges,
        ...createSystemDocumentEdges(
          state.documents.filter((document) => document.source === "backend"),
          [newChat]
        ),
      ],
      activeChatId: newChat.id,
    });
  },

  addDocumentNode: (position) => {
    const newDoc: Document = {
      id: `doc-user-${Date.now()}`,
      name: "",
      title: "",
      category: "projects",
      source: "user",
      deletable: true,
      fileType: "doc",
      summary: "",
      tags: [],
      pendingUpload: true,
    };

    const newNode: WorkspaceNode = {
      id: newDoc.id,
      type: "documentNode",
      position: position || {
        x: 140 + (Math.random() * 60 - 30),
        y: 380 + (Math.random() * 60 - 30),
      },
      data: { ...newDoc },
    };

    set({
      documents: [...get().documents, newDoc],
      nodes: [...get().nodes, newNode],
    });
  },

  setDocumentFile: async (id, file) => {
    const document = get().documents.find((item) => item.id === id);
    if (!document) return;

    const updateDocument = (updatedDocument: Document) => {
      const state = get();
      set({
        documents: state.documents.map((item) =>
          item.id === id ? updatedDocument : item
        ),
        nodes: state.nodes.map((node) =>
          node.id === id && node.type === "documentNode"
            ? { ...node, data: { ...updatedDocument } }
            : node
        ),
      });
    };

    updateDocument({
      ...document,
      name: file.name,
      title: file.name,
      fileType: getDocumentFileType(file.name),
      pendingUpload: false,
      uploading: true,
      error: undefined,
    });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadedDocument = await apiClient<Document>(
        API_ENDPOINTS.DOCUMENTS.UPLOAD,
        { method: "POST", body: formData }
      );
      const latestDocument = get().documents.find((item) => item.id === id);
      if (!latestDocument) return;
      updateDocument({
        ...latestDocument,
        ...uploadedDocument,
        id,
        serverId: uploadedDocument.id,
        pendingUpload: false,
        uploading: false,
        error: undefined,
      });
    } catch (error) {
      const latestDocument = get().documents.find((item) => item.id === id);
      if (!latestDocument) return;
      updateDocument({
        ...latestDocument,
        uploading: false,
        error: getRequestErrorMessage(error),
      });
    }
  },

  deleteChatNode: (id: string) => {
    const { chats, nodes, edges } = get();
    const chatToDelete = chats.find((chat) => chat.id === id);
    if (chatToDelete?.deletable === false) return;

    // REQUIREMENT: If there is only ONE chat, deleting it must NOT remove it.
    // Instead, clear its conversation, reset it to its initial state, and keep it visible.
    if (chats.length <= 1) {
      const resetChat: Chat = {
        ...INITIAL_CHAT,
        id,
        sessionId: crypto.randomUUID(),
        messages: [
          {
            id: `msg-reset-${Date.now()}`,
            role: "assistant",
            content: "Conversation cleared. Ready for new questions.",
            timestamp: "Just now",
          },
        ],
      };

      set({
        chats: [resetChat],
        nodes: nodes.map((node) =>
          node.id === id && node.type === "chatNode"
            ? { ...node, data: { ...resetChat } }
            : node
        ),
      });
      return;
    }

    // If there are multiple chats: deleting one removes that chat node and its edges.
    set({
      chats: chats.filter((c) => c.id !== id),
      nodes: nodes.filter((n) => n.id !== id),
      edges: edges.filter((e) => e.source !== id && e.target !== id),
      activeChatId:
        get().activeChatId === id ? null : get().activeChatId,
    });
  },

  deleteDocumentNode: (id: string) => {
    const { documents, nodes, edges } = get();
    const targetDoc = documents.find((d) => d.id === id);

    // Backend persistent documents cannot be deleted
    if (targetDoc && targetDoc.deletable === false) {
      return;
    }

    set({
      documents: documents.filter((d) => d.id !== id),
      nodes: nodes.filter((n) => n.id !== id),
      edges: edges.filter((e) => e.source !== id && e.target !== id),
    });
  },

  sendChatMessage: async (chatId: string, content: string) => {
    const state = get();
    const targetChat = state.chats.find((chat) => chat.id === chatId);
    if (!targetChat || targetChat.status === "active") return;
    const connectedUserDocuments = state.edges
      .filter((edge) => edge.target === chatId || edge.source === chatId)
      .map((edge) => {
        const docId = edge.target === chatId ? edge.source : edge.target;
        return state.documents.find((document) => document.id === docId);
      })
      .filter(
        (document): document is Document =>
          document !== undefined && document.source === "user"
      );
    const sessionId = targetChat.sessionId ?? crypto.randomUUID();

    const updateChat = (update: (chat: Chat) => Chat) => {
      const state = get();
      const updatedChats = state.chats.map((chat) =>
        chat.id === chatId ? update(chat) : chat
      );
      const updatedChat = updatedChats.find((chat) => chat.id === chatId);

      set({
        chats: updatedChats,
        nodes: state.nodes.map((node) =>
          node.id === chatId && node.type === "chatNode" && updatedChat
            ? { ...node, data: { ...updatedChat } }
            : node
        ),
      });
    };

    if (
      connectedUserDocuments.some(
        (document) => document.uploading || !document.serverId
      )
    ) {
      updateChat((chat) => ({
        ...chat,
        messages: [
          ...chat.messages,
          {
            id: `msg-${Date.now()}`,
            role: "assistant",
            content:
              "A connected document is still uploading or could not be processed. Wait for it or replace it before asking about it.",
            timestamp: "Just now",
          },
        ],
      }));
      return;
    }

    const documentIds = connectedUserDocuments.map(
      (document) => document.serverId as string
    );

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: "user" as const,
      content,
      timestamp: "Just now",
    };

    updateChat((chat) => ({
      ...chat,
      sessionId,
      status: "active",
      messages: [...chat.messages, userMessage],
    }));

    try {
      const result = await apiClient<{ response: string }>(API_ENDPOINTS.CHAT, {
        method: "POST",
        body: {
          message: content,
          session_id: sessionId,
          document_ids: documentIds,
        },
      });

      updateChat((chat) => ({
        ...chat,
        status: "ready",
        messages: [
          ...chat.messages,
          {
            id: `msg-${Date.now()}`,
            role: "assistant",
            content: result.response,
            timestamp: "Just now",
          },
        ],
      }));
    } catch (error) {
      updateChat((chat) => ({
        ...chat,
        status: "ready",
        messages: [
          ...chat.messages,
          {
            id: `msg-${Date.now()}`,
            role: "assistant",
            content:
              error instanceof ApiClientError
                ? `The assistant request failed: ${getRequestErrorMessage(error)}`
                : "I couldn't reach the portfolio assistant. Check that the backend is running and try again.",
            timestamp: "Just now",
          },
        ],
      }));
    }
  },

  resetWorkspace: () => {
    set({
      nodes: INITIAL_NODES,
      edges: INITIAL_EDGES,
      chats: [INITIAL_CHAT],
      documents: INITIAL_BACKEND_DOCUMENTS,
      activeChatId: INITIAL_CHAT.id,
      isDarkMode: true,
      zoomLevel: 1,
      activeProfileSection: "About",
    });
  },
}));
