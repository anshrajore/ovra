"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { StudioHeader } from "@/components/studio/Header";
import { StudioSidebar } from "@/components/studio/Sidebar";
import { WorkflowCanvas } from "@/components/studio/WorkflowCanvas";
import { AIStudioModal } from "@/components/studio/AIStudioModal";
import { initialWorkflow } from "@/lib/data/initial-workflow";
import { useAppStore } from "@/lib/store/use-app-store";
import { WorkflowDefinition } from "@/lib/types/workflow";

function StudioContent() {
  const searchParams = useSearchParams();
  const workflowId = searchParams.get("id");
  const store = useAppStore();
  const [isAIStudioOpen, setIsAIStudioOpen] = useState(false);

  const activeWorkflow: WorkflowDefinition = useMemo(() => {
    if (workflowId) {
      const found = store.getWorkflows().find((w) => w.id === workflowId);
      if (found) return found;
    }
    const workflows = store.getWorkflows();
    return workflows[0] || initialWorkflow;
  }, [workflowId, store]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white select-none">
      {/* Top Application Navigation */}
      <StudioHeader onOpenAIStudio={() => setIsAIStudioOpen(true)} />

      {/* Main Workspace: Left Sidebar + Workflow Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <StudioSidebar activeTab="workflows" />

        {/* Center/Right Main Canvas */}
        <WorkflowCanvas key={activeWorkflow.id} initialWorkflow={activeWorkflow} />
      </div>

      {/* AI Studio Global Trigger */}
      <AIStudioModal
        isOpen={isAIStudioOpen}
        onClose={() => setIsAIStudioOpen(false)}
        onApplyWorkflow={(wf) => {
          store.saveWorkflow(wf);
        }}
      />
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
