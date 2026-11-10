"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { StudioHeader } from "@/components/studio/Header";
import { StudioSidebar } from "@/components/studio/Sidebar";
import { WorkflowCanvas } from "@/components/studio/WorkflowCanvas";
import { AIAssistantDrawer, WorkflowPatch } from "@/components/studio/AIAssistantDrawer";
import { initialWorkflow } from "@/lib/data/initial-workflow";
import { useAppStore } from "@/lib/store/use-app-store";
import { WorkflowDefinition } from "@/lib/types/workflow";

function StudioContent() {
  const searchParams = useSearchParams();
  const workflowId = searchParams.get("id");
  const store = useAppStore();
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);
  const [isExecutionRunning, setIsExecutionRunning] = useState(false);

  const activeWorkflow: WorkflowDefinition = useMemo(() => {
    if (workflowId) {
      const found = store.getWorkflows().find((w) => w.id === workflowId);
      if (found) return found;
    }
    const workflows = store.getWorkflows();
    if (workflows.length > 0) return workflows[0];
    return {
      id: "wf_blank",
      name: "Untitled Automation",
      description: "Blank canvas workflow",
      status: "draft" as const,
      version: 1,
      workspaceId: store.getActiveWorkspace().id,
      nodes: [],
      edges: [],
      lastSavedAt: "Just now",
    };
  }, [workflowId, store]);

  const handleApplyPatch = (patch: WorkflowPatch) => {
    // Non-destructive patch: Add nodes with clean positioning, add edges, bump version
    const updatedNodes = [...activeWorkflow.nodes, ...patch.addNodes];
    const updatedEdges = [...activeWorkflow.edges, ...patch.addEdges];
    const nextVersion = (activeWorkflow.version || 1) + 1;

    const patchedWorkflow: WorkflowDefinition = {
      ...activeWorkflow,
      nodes: updatedNodes,
      edges: updatedEdges,
      version: nextVersion,
      lastSavedAt: "Draft auto-saved via AI Assistant",
    };

    store.saveWorkflow(patchedWorkflow);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white select-none">
      {/* Top Application Navigation */}
      <StudioHeader onOpenAIStudio={() => setIsAIDrawerOpen(true)} />

      {/* Main Workspace: Left Sidebar + Workflow Canvas */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <StudioSidebar
          activeTab="workflows"
          onOpenAIStudio={() => setIsAIDrawerOpen(true)}
        />

        {/* Center/Right Main Canvas */}
        <div className="flex-1 relative h-full w-full overflow-hidden">
          <WorkflowCanvas
            key={`${activeWorkflow.id}_v${activeWorkflow.version || 1}`}
            initialWorkflow={activeWorkflow}
            onExecutionStateChange={(running) => setIsExecutionRunning(running)}
            onOpenAIStudio={() => setIsAIDrawerOpen(true)}
          />

          {/* In-Canvas Right Docked AI Assistant Drawer */}
          <AIAssistantDrawer
            isOpen={isAIDrawerOpen}
            onClose={() => setIsAIDrawerOpen(false)}
            activeWorkflow={activeWorkflow}
            isExecutionRunning={isExecutionRunning}
            onApplyPatch={handleApplyPatch}
          />
        </div>
      </div>
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen w-screen bg-[#FAF7F2] text-sm font-semibold text-gray-500">
          Loading OVRA Studio...
        </div>
      }
    >
      <StudioContent />
    </Suspense>
  );
}
