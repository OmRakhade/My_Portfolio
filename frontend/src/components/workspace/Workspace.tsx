"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
} from "@xyflow/react";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { ChatNode } from "./ChatNode";
import { DocumentNode } from "./DocumentNode";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { ProfilePanel } from "@/components/profile/ProfilePanel";
import { BottomToolbar } from "@/components/toolbar/BottomToolbar";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { Document } from "@/types";
import "@xyflow/react/dist/style.css";

const defaultEdgeOptions = {
  animated: true,
  style: { stroke: "#818cf8", strokeWidth: 1.5 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "#818cf8",
    width: 14,
    height: 14,
  },
};

function WorkspaceFlow() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    documents,
    isDarkMode,
    setSystemDocuments,
  } = useWorkspaceStore();
  const { data: systemDocuments } = useQuery({
    queryKey: ["system-documents"],
    queryFn: () => apiClient<Document[]>(API_ENDPOINTS.DOCUMENTS.LIST),
  });

  useEffect(() => {
    if (systemDocuments) setSystemDocuments(systemDocuments);
  }, [systemDocuments, setSystemDocuments]);

  const nodeTypes = useMemo(
    () => ({
      chatNode: ChatNode,
      documentNode: DocumentNode,
    }),
    []
  );

  return (
    <div
      data-theme={isDarkMode ? "dark" : "light"}
      className="workspace-root relative h-dvh w-dvw overflow-hidden bg-[#0d0e12] select-none"
    >
      {/* Ambient Radial Glow Lighting in Canvas Background */}
      <div className="pointer-events-none absolute top-1/4 left-1/3 h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/[0.08] blur-[150px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/3 h-[500px] w-[500px] rounded-full bg-indigo-600/[0.07] blur-[140px]" />

      {/* 1. FIXED UI LAYER (Does NOT move when canvas is panned) */}
      <TopNavigation />
      <ProfilePanel />
      <BottomToolbar />

      {/* 2. WORKSPACE LAYER (Pannable, Zoomable React Flow Canvas) */}
      <main className="h-full w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          isValidConnection={(connection) =>
            connection.targetHandle !== "documents" ||
            documents.some((document) => document.id === connection.source)
          }
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          minZoom={0.5}
          maxZoom={1.5}
          panOnDrag={true}
          zoomOnScroll={true}
          proOptions={{ hideAttribution: true }}
          className="portfolio-canvas"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={28}
            size={1.2}
            color={isDarkMode ? "#454752" : "#c4cdca"}
            className="opacity-90"
          />
        </ReactFlow>
      </main>
    </div>
  );
}

export function Workspace() {
  return (
    <ReactFlowProvider>
      <WorkspaceFlow />
    </ReactFlowProvider>
  );
}
