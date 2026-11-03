import { StudioHeader } from "@/components/studio/Header";
import { StudioSidebar } from "@/components/studio/Sidebar";
import { WorkflowCanvas } from "@/components/studio/WorkflowCanvas";
import { initialWorkflow } from "@/lib/data/initial-workflow";

export default function StudioPage() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white select-none">
      {/* Top Application Navigation */}
      <StudioHeader />

      {/* Main Workspace: Left Sidebar + Workflow Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <StudioSidebar activeTab="workflows" />

        {/* Center/Right Main Canvas */}
        <WorkflowCanvas initialWorkflow={initialWorkflow} />
      </div>
    </div>
  );
}
