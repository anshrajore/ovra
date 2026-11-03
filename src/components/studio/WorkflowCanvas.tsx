"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeMouseHandler,
} from "@xyflow/react";
import confetti from "canvas-confetti";

import { nodeTypes } from "./CustomNodes";
import { FloatingToolbar } from "./FloatingToolbar";
import { NodeInspectorModal } from "./NodeInspectorModal";
import { CodeModal } from "./CodeModal";
import { AIStudioModal } from "./AIStudioModal";
import { NodeLibraryModal } from "./NodeLibraryModal";
import { CanvasHeader } from "./CanvasHeader";
import { WorkflowDefinition, WorkflowNodeData } from "@/lib/types/workflow";
import { defaultExecutionProvider } from "@/lib/simulator/engine";

interface WorkflowCanvasProps {
  initialWorkflow: WorkflowDefinition;
}

export function WorkflowCanvas({ initialWorkflow }: WorkflowCanvasProps) {
  const [workflow, setWorkflow] = useState<WorkflowDefinition>(initialWorkflow);
  const [selectedNode, setSelectedNode] = useState<WorkflowNodeData | null>(null);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isAIStudioOpen, setIsAIStudioOpen] = useState(false);
  const [isNodeLibraryOpen, setIsNodeLibraryOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Convert workflow data to React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {
      node_webhook: { x: 100, y: 250 },
      node_ai_agent: { x: 380, y: 250 },
      node_if_logic: { x: 650, y: 250 },
      node_slack: { x: 960, y: 150 },
      node_email: { x: 960, y: 350 },
    };

    return workflow.nodes.map((n, idx) => ({
      id: n.id,
      type: n.type,
      position: positions[n.id] || { x: 100 + idx * 260, y: 250 },
      data: {
        label: n.label,
        subtitle: n.subtitle,
        status: n.status || "idle",
      },
    }));
  }, [workflow.nodes]);

  // Convert workflow edges to React Flow edges
  const initialEdges: Edge[] = useMemo(() => {
    return workflow.edges.map((e) => ({
      id: e.id,
      source: e.source,
      sourceHandle: e.sourceHandle,
      target: e.target,
      label: e.label,
      animated: isRunning,
      style: {
        stroke: e.label === "Yes" ? "#10B981" : e.label === "No" ? "#F43F5E" : "#9CA3AF",
        strokeWidth: 2,
      },
    }));
  }, [workflow.edges, isRunning]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Node click handler opens Node Inspector
  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      const found = workflow.nodes.find((n) => n.id === node.id);
      if (found) {
        setSelectedNode({
          ...found,
          status: (node.data.status as any) || found.status,
        });
      }
    },
    [workflow.nodes]
  );

  // Interactive Test Run Simulation
  const handleTestRun = async () => {
    if (isRunning) return;
    setIsRunning(true);

    // Reset node states to running/idle
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, status: "idle" },
      }))
    );

    try {
      const executionId = `exec_${Date.now()}`;
      await defaultExecutionProvider.executeWorkflowGraph(
        workflow,
        executionId,
        (nodeId, state) => {
          setNodes((nds) =>
            nds.map((n) => {
              if (n.id === nodeId) {
                return {
                  ...n,
                  data: {
                    ...n.data,
                    status: state.status,
                    durationMs: state.durationMs,
                  },
                };
              }
              return n;
            })
          );

          // Update active node in workflow data
          setWorkflow((wf) => ({
            ...wf,
            nodes: wf.nodes.map((n) =>
              n.id === nodeId
                ? {
                    ...n,
                    status: state.status,
                    inputs: state.inputPayload,
                    outputs: state.outputPayload,
                    executionDurationMs: state.durationMs,
                  }
                : n
            ),
          }));
        }
      );

      // Trigger Confetti Celebration!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#FF5C00", "#10B981", "#6366F1", "#FACC15"],
      });
    } catch (err) {
      console.error("Test run error:", err);
    } finally {
      setIsRunning(false);
    }
  };

  // Add new node from library
  const handleAddNode = (newNodeData: WorkflowNodeData) => {
    const newNode: Node = {
      id: newNodeData.id,
      type: newNodeData.type,
      position: { x: 500, y: 200 },
      data: {
        label: newNodeData.label,
        subtitle: newNodeData.subtitle,
        status: "idle",
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setWorkflow((wf) => ({
      ...wf,
      nodes: [...wf.nodes, newNodeData],
    }));
  };

  // Replace graph with AI generated workflow
  const handleApplyWorkflow = (newWf: WorkflowDefinition) => {
    setWorkflow(newWf);
    const generatedNodes = newWf.nodes.map((n, idx) => ({
      id: n.id,
      type: n.type,
      position: { x: 100 + idx * 240, y: 250 },
      data: {
        label: n.label,
        subtitle: n.subtitle,
        status: "idle",
      },
    }));

    const generatedEdges = newWf.edges.map((e) => ({
      id: e.id,
      source: e.source,
      sourceHandle: e.sourceHandle,
      target: e.target,
      label: e.label,
      style: {
        stroke: e.label === "Yes" ? "#10B981" : e.label === "No" ? "#F43F5E" : "#9CA3AF",
        strokeWidth: 2,
      },
    }));

    setNodes(generatedNodes);
    setEdges(generatedEdges);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAF7F2] relative">
      {/* Canvas Top Bar */}
      <CanvasHeader
        workflowName={workflow.name}
        onUpdateName={(name) => setWorkflow((w) => ({ ...w, name }))}
        onTestRun={handleTestRun}
        onOpenCode={() => setIsCodeModalOpen(true)}
        isRunning={isRunning}
      />

      {/* React Flow Viewport */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          minZoom={0.2}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
          className="bg-[#FAF7F2]"
        >
          {/* Subtle Dot Grid */}
          <Background
            variant={BackgroundVariant.Dots}
            gap={18}
            size={1.5}
            color="#D8D4CC"
          />

          {/* Minimap preview matching wireframe */}
          <MiniMap
            className="!bg-white/90 !border !border-gray-200/90 !rounded-2xl !shadow-soft !overflow-hidden !m-6"
            nodeColor="#E4E4E7"
            maskColor="rgba(250, 247, 242, 0.7)"
            nodeStrokeWidth={2}
          />

          {/* Floating Canvas Toolbar */}
          <FloatingToolbar
            onOpenNodeLibrary={() => setIsNodeLibraryOpen(true)}
            onDeleteSelected={() => {
              setNodes((nds) => nds.filter((n) => !n.selected));
              setEdges((eds) => eds.filter((e) => !e.selected));
            }}
          />
        </ReactFlow>
      </div>

      {/* Node Inspector Drawer */}
      <NodeInspectorModal
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onRunSingleNode={(nodeId) => {
          handleTestRun();
        }}
      />

      {/* Immutable JSON Code Modal */}
      <CodeModal
        workflow={workflow}
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />

      {/* AI Studio Generator Modal */}
      <AIStudioModal
        isOpen={isAIStudioOpen}
        onClose={() => setIsAIStudioOpen(false)}
        onApplyWorkflow={handleApplyWorkflow}
      />

      {/* Node Library Drawer */}
      <NodeLibraryModal
        isOpen={isNodeLibraryOpen}
        onClose={() => setIsNodeLibraryOpen(false)}
        onAddNode={handleAddNode}
      />
    </div>
  );
}
