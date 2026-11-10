"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
import { Workflow, Plus, Sparkles } from "lucide-react";

import { nodeTypes } from "./CustomNodes";
import { FloatingToolbar } from "./FloatingToolbar";
import { NodeInspectorModal } from "./NodeInspectorModal";
import { CodeModal } from "./CodeModal";
import { AIStudioModal } from "./AIStudioModal";
import { UniversalNodePickerModal } from "./UniversalNodePickerModal";
import { OpenAPIImportModal } from "./OpenAPIImportModal";
import { CanvasHeader } from "./CanvasHeader";
import { BlankCanvasState } from "./BlankCanvasState";
import { WorkflowDefinition, WorkflowNodeData } from "@/lib/types/workflow";
import { defaultExecutionProvider } from "@/lib/simulator/engine";
import { testNodeExecution } from "@/lib/node-platform";
import { appStore } from "@/lib/store/app-store";

interface WorkflowCanvasProps {
  initialWorkflow: WorkflowDefinition;
  onExecutionStateChange?: (isRunning: boolean) => void;
  onOpenAIStudio?: () => void;
}

interface HistorySnapshot {
  nodes: Node[];
  edges: Edge[];
  workflowNodes: WorkflowNodeData[];
}

export function WorkflowCanvas({
  initialWorkflow,
  onExecutionStateChange,
  onOpenAIStudio,
}: WorkflowCanvasProps) {
  const router = useRouter();
  const [workflow, setWorkflow] = useState<WorkflowDefinition>(() => {
    // Check if store already has a stored version of this workflow
    const stored = appStore.getWorkflows().find((w) => w.id === initialWorkflow.id);
    return stored || initialWorkflow;
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isAIStudioOpen, setIsAIStudioOpen] = useState(false);
  const [isNodeLibraryOpen, setIsNodeLibraryOpen] = useState(false);
  const [isOpenOpenAPIModal, setIsOpenOpenAPIModal] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      position: (n as any).position || positions[n.id] || { x: 100 + idx * 260, y: 250 },
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

  // Undo / Redo History Stack
  const [history, setHistory] = useState<HistorySnapshot[]>([
    { nodes: initialNodes, edges: initialEdges, workflowNodes: workflow.nodes },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushHistory = useCallback(
    (newNodes: Node[], newEdges: Edge[], newWfNodes: WorkflowNodeData[]) => {
      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        return [...sliced, { nodes: newNodes, edges: newEdges, workflowNodes: newWfNodes }];
      });
      setHistoryIndex((prev) => prev + 1);
      setSaveStatus("unsaved");
    },
    [historyIndex]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const target = history[historyIndex - 1];
      setNodes(target.nodes);
      setEdges(target.edges);
      setWorkflow((w) => ({ ...w, nodes: target.workflowNodes }));
      setHistoryIndex(historyIndex - 1);
    }
  }, [historyIndex, history, setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const target = history[historyIndex + 1];
      setNodes(target.nodes);
      setEdges(target.edges);
      setWorkflow((w) => ({ ...w, nodes: target.workflowNodes }));
      setHistoryIndex(historyIndex + 1);
    }
  }, [historyIndex, history, setNodes, setEdges]);

  // Connect handler
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        const nextEdges = addEdge(params, eds);
        pushHistory(nodes, nextEdges, workflow.nodes);
        return nextEdges;
      });
    },
    [setEdges, nodes, workflow.nodes, pushHistory]
  );

  // Find currently selected node data
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    const wfNode = workflow.nodes.find((n) => n.id === selectedNodeId);
    if (!wfNode) return null;
    const canvasNode = nodes.find((n) => n.id === selectedNodeId);
    return {
      ...wfNode,
      status: (canvasNode?.data?.status as any) || wfNode.status || "idle",
    };
  }, [selectedNodeId, workflow.nodes, nodes]);

  // Node click handler opens Node Inspector
  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedNodeId(node.id);
  }, []);

  // Save workflow action
  const handleSave = useCallback(() => {
    setSaveStatus("saving");
    const updated: WorkflowDefinition = {
      ...workflow,
      nodes: workflow.nodes.map((n) => {
        const cn = nodes.find((node) => node.id === n.id);
        return {
          ...n,
          ...(cn ? { position: cn.position } : {}),
        };
      }),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        sourceHandle: e.sourceHandle || undefined,
        target: e.target,
        label: (e.label as string) || undefined,
      })),
      lastSavedAt: "Just now",
    };

    appStore.saveWorkflow(updated);
    setTimeout(() => {
      setWorkflow(updated);
      setSaveStatus("saved");
    }, 400);
  }, [workflow, nodes, edges]);

  // Duplicate Selected Node
  const handleDuplicateNode = useCallback(
    (nodeId: string) => {
      const target = workflow.nodes.find((n) => n.id === nodeId);
      const canvasTarget = nodes.find((n) => n.id === nodeId);
      if (!target || !canvasTarget) return;

      const newId = `node_${Date.now()}`;
      const newPos = {
        x: canvasTarget.position.x + 40,
        y: canvasTarget.position.y + 40,
      };

      const newWfNode: WorkflowNodeData = {
        ...JSON.parse(JSON.stringify(target)),
        id: newId,
        label: `${target.label} (Copy)`,
        status: "idle",
      };

      const newCanvasNode: Node = {
        id: newId,
        type: target.type,
        position: newPos,
        data: {
          label: newWfNode.label,
          subtitle: newWfNode.subtitle,
          status: "idle",
        },
      };

      const nextNodes = [...nodes, newCanvasNode];
      const nextWfNodes = [...workflow.nodes, newWfNode];

      setNodes(nextNodes);
      setWorkflow((w) => ({ ...w, nodes: nextWfNodes }));
      setSelectedNodeId(newId);
      pushHistory(nextNodes, edges, nextWfNodes);
    },
    [workflow.nodes, nodes, edges, setNodes, pushHistory]
  );

  // Delete Node
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      const nextNodes = nodes.filter((n) => n.id !== nodeId);
      const nextEdges = edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
      const nextWfNodes = workflow.nodes.filter((n) => n.id !== nodeId);

      setNodes(nextNodes);
      setEdges(nextEdges);
      setWorkflow((w) => ({ ...w, nodes: nextWfNodes }));
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
      }
      pushHistory(nextNodes, nextEdges, nextWfNodes);
    },
    [nodes, edges, workflow.nodes, selectedNodeId, setNodes, setEdges, pushHistory]
  );

  // Update Node Config
  const handleUpdateNodeConfig = useCallback(
    (nodeId: string, updatedConfig: Record<string, any>) => {
      setWorkflow((wf) => ({
        ...wf,
        nodes: wf.nodes.map((n) => (n.id === nodeId ? { ...n, config: updatedConfig } : n)),
      }));
      setSaveStatus("unsaved");
    },
    []
  );

  // Run Single Node Solo Test via Platform Engine
  const handleRunSoloNode = useCallback(
    async (nodeId: string) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, status: "running" } } : n))
      );

      const targetNode = workflow.nodes.find((n) => n.id === nodeId);
      const startTime = Date.now();
      let outputs: Record<string, any> = {};
      let isSuccess = true;

      try {
        const mockInput = targetNode?.inputs && Object.keys(targetNode.inputs).length > 0
          ? targetNode.inputs
          : {
              orderId: "ORD_7891",
              amount: 14500,
              customer: { name: "Ananya Iyer", email: "ananya.iyer@fintech.in" },
              event: "payment_authorized",
              timestamp: new Date().toISOString(),
            };

        const res = await testNodeExecution(
          targetNode?.type || "core.webhook",
          mockInput,
          targetNode?.config || {}
        );

        outputs = res.output || {};
        isSuccess = res.success;
      } catch (err: any) {
        outputs = { error: err.message || "Node execution failed" };
        isSuccess = false;
      }

      const durationMs = Math.max(Date.now() - startTime, 35);

      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? { ...n, data: { ...n.data, status: isSuccess ? "success" : "failed", durationMs } }
            : n
        )
      );

      setWorkflow((wf) => ({
        ...wf,
        nodes: wf.nodes.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                status: isSuccess ? "success" : "failed",
                inputs: { mode: "solo_test_trigger", triggeredBy: "NodeInspector" },
                outputs,
                executionDurationMs: durationMs,
              }
            : n
        ),
      }));
    },
    [setNodes, workflow.nodes]
  );

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // ⌘S or Ctrl+S -> Save
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
        return;
      }

      // ⌘Z or Ctrl+Z -> Undo / Redo
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      // ⌘Y or Ctrl+Y -> Redo
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
        return;
      }

      // ⌘D or Ctrl+D -> Duplicate Selected Node
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        const selected = nodes.find((n) => n.selected);
        if (selected) {
          handleDuplicateNode(selected.id);
        } else if (selectedNodeId) {
          handleDuplicateNode(selectedNodeId);
        }
        return;
      }

      // Delete or Backspace -> Delete selected nodes / edges
      if (e.key === "Delete" || e.key === "Backspace") {
        const selectedCanvasNodes = nodes.filter((n) => n.selected);
        const selectedCanvasEdges = edges.filter((e) => e.selected);

        if (selectedCanvasNodes.length > 0 || selectedCanvasEdges.length > 0) {
          e.preventDefault();
          const nodeIdsToDelete = new Set(selectedCanvasNodes.map((n) => n.id));
          const nextNodes = nodes.filter((n) => !nodeIdsToDelete.has(n.id));
          const nextEdges = edges.filter(
            (ed) =>
              !ed.selected &&
              !nodeIdsToDelete.has(ed.source) &&
              !nodeIdsToDelete.has(ed.target)
          );
          const nextWfNodes = workflow.nodes.filter((n) => !nodeIdsToDelete.has(n.id));

          setNodes(nextNodes);
          setEdges(nextEdges);
          setWorkflow((w) => ({ ...w, nodes: nextWfNodes }));
          pushHistory(nextNodes, nextEdges, nextWfNodes);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    nodes,
    edges,
    workflow.nodes,
    selectedNodeId,
    handleSave,
    handleUndo,
    handleRedo,
    handleDuplicateNode,
    pushHistory,
    setNodes,
    setEdges,
  ]);

  // Full Interactive Test Run Simulation
  const handleTestRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    onExecutionStateChange?.(true);

    // Reset node states to idle
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, status: "idle" },
      }))
    );

    const execStartTime = Date.now();
    const executionId = `exec_${Date.now()}`;

    try {
      const execResult = await defaultExecutionProvider.executeWorkflowGraph(
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

      // Record truthful execution in app store
      const execDuration = Date.now() - execStartTime;
      const isOverallSuccess = execResult.status === "SUCCESS";
      const hasFailed = execResult.status === "FAILED";

      appStore.addExecutionRecord({
        id: executionId,
        workflowId: workflow.id,
        workflowName: workflow.name,
        status: hasFailed ? "FAILED" : isOverallSuccess ? "SUCCESS" : "FAILED",
        triggerType: "manual",
        startedAt: new Date(execStartTime).toISOString(),
        durationMs: execDuration,
        nodeCount: workflow.nodes.length,
        steps: workflow.nodes.map((n) => {
          const stepResult = execResult.nodeResults[n.id];
          return {
            nodeId: n.id,
            nodeLabel: n.label,
            nodeType: n.type,
            status: (stepResult?.status as any) || (hasFailed ? "failed" : "success"),
            durationMs: stepResult?.durationMs || n.executionDurationMs || 45,
            inputs: stepResult?.inputPayload || n.inputs,
            outputs: stepResult?.outputPayload || n.outputs,
          };
        }),
      });

      // Trigger Confetti Celebration ONLY on genuine SUCCESS
      if (isOverallSuccess) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#2342FF", "#10B981", "#6366F1", "#FACC15"],
        });
      }
    } catch (err) {
      console.error("Test run error:", err);
      appStore.addExecutionRecord({
        id: executionId,
        workflowId: workflow.id,
        workflowName: workflow.name,
        status: "FAILED",
        triggerType: "manual",
        startedAt: new Date(execStartTime).toISOString(),
        durationMs: Date.now() - execStartTime,
        nodeCount: workflow.nodes.length,
        steps: workflow.nodes.map((n) => ({
          nodeId: n.id,
          nodeLabel: n.label,
          nodeType: n.type,
          status: "failed",
        })),
      });
    } finally {
      setIsRunning(false);
      onExecutionStateChange?.(false);
    }
  };

  // Add new node from library
  const handleAddNode = (newNodeData: WorkflowNodeData) => {
    const newNode: Node = {
      id: newNodeData.id,
      type: newNodeData.type,
      position: { x: 450 + Math.random() * 80, y: 220 + Math.random() * 80 },
      data: {
        label: newNodeData.label,
        subtitle: newNodeData.subtitle,
        status: "idle",
      },
    };

    const nextNodes = [...nodes, newNode];
    const nextWfNodes = [...workflow.nodes, newNodeData];

    setNodes(nextNodes);
    setWorkflow((wf) => ({
      ...wf,
      nodes: nextWfNodes,
    }));
    pushHistory(nextNodes, edges, nextWfNodes);
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
    pushHistory(generatedNodes, generatedEdges, newWf.nodes);
    appStore.saveWorkflow(newWf);
  };

  // Duplicate Workflow
  const handleDuplicateWorkflow = () => {
    const cloned = appStore.duplicateWorkflow(workflow.id);
    if (cloned) {
      setWorkflow(cloned);
      router.push(`/studio?id=${cloned.id}`);
    }
  };

  // Export JSON file
  const handleExportJSON = () => {
    const exportData = {
      ...workflow,
      nodes: workflow.nodes.map((n) => {
        const cn = nodes.find((node) => node.id === n.id);
        return {
          ...n,
          ...(cn ? { position: cn.position } : {}),
        };
      }),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        sourceHandle: e.sourceHandle || undefined,
        target: e.target,
        label: (e.label as string) || undefined,
      })),
      exportedAt: new Date().toISOString(),
      generator: "OVRA Platform v2.0",
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${workflow.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}.ovra.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON file
  const handleImportJSONClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.nodes && Array.isArray(parsed.nodes)) {
          handleApplyWorkflow({
            id: `wf_${Date.now()}`,
            name: parsed.name ? `${parsed.name} (Imported)` : "Imported Automation",
            description: parsed.description || "Imported workflow",
            status: "draft",
            version: 1,
            workspaceId: appStore.getActiveWorkspace().id,
            nodes: parsed.nodes,
            edges: parsed.edges || [],
            lastSavedAt: "Imported just now",
          });
        } else {
          alert("Invalid OVRA workflow format. File must contain a 'nodes' array.");
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Clear Canvas
  const handleClearCanvas = () => {
    setNodes([]);
    setEdges([]);
    setWorkflow((w) => ({ ...w, nodes: [], edges: [] }));
    setSelectedNodeId(null);
    pushHistory([], [], []);
  };

  // Create Starter Node for Blank Canvas
  const handleCreateBlankWorkflow = () => {
    const starterNode: WorkflowNodeData = {
      id: `node_manual_${Date.now()}`,
      type: "core.manual_trigger",
      label: "Manual Trigger",
      subtitle: "Click 'Test Run' to execute",
      status: "idle",
      config: {},
    };
    const newNode: Node = {
      id: starterNode.id,
      type: starterNode.type,
      position: { x: 380, y: 240 },
      data: {
        label: starterNode.label,
        subtitle: starterNode.subtitle,
        status: "idle",
      },
    };
    setNodes([newNode]);
    setWorkflow((wf) => {
      const updated = {
        ...wf,
        nodes: [starterNode],
        edges: [],
      };
      appStore.saveWorkflow(updated);
      return updated;
    });
    setSelectedNodeId(starterNode.id);
    pushHistory([newNode], [], [starterNode]);
  };

  // Delete Workflow
  const handleDeleteWorkflow = () => {
    appStore.deleteWorkflow(workflow.id);
    router.push("/workflows");
  };

  // Restore Version
  const handleRestoreVersion = (ver: number) => {
    const success = appStore.restoreWorkflowVersion(workflow.id, ver);
    if (success) {
      const restored = appStore.getWorkflows().find((w) => w.id === workflow.id);
      if (restored) {
        handleApplyWorkflow(restored);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAF7F2] relative">
      {/* Hidden File Input for JSON import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {/* Canvas Top Bar */}
      <CanvasHeader
        workflowId={workflow.id}
        workflowName={workflow.name}
        workflowVersion={workflow.version || 1}
        workflowStatus={workflow.status || "draft"}
        nodesCount={nodes.length}
        onPublish={() => {
          setWorkflow((w) => ({
            ...w,
            status: "active",
            version: (w.version || 1) + 1,
          }));
        }}
        onUpdateName={(name) => {
          const updated = { ...workflow, name };
          setWorkflow(updated);
          appStore.saveWorkflow(updated);
        }}
        onTestRun={handleTestRun}
        onOpenCode={() => setIsCodeModalOpen(true)}
        onOpenAIStudio={onOpenAIStudio}
        onDuplicateWorkflow={handleDuplicateWorkflow}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSONClick}
        onClearCanvas={handleClearCanvas}
        onDeleteWorkflow={handleDeleteWorkflow}
        onRestoreVersion={handleRestoreVersion}
        saveStatus={saveStatus}
        isRunning={isRunning}
      />

      {/* React Flow Viewport */}
      <div className="flex-1 w-full h-full relative">
        {nodes.length === 0 && (
          <BlankCanvasState
            onCreateBlank={handleCreateBlankWorkflow}
            onExploreTemplates={() => router.push("/templates")}
            onImportJSON={handleImportJSONClick}
          />
        )}

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
              const selectedIds = new Set(nodes.filter((n) => n.selected).map((n) => n.id));
              const nextNodes = nodes.filter((n) => !n.selected);
              const nextEdges = edges.filter(
                (e) => !e.selected && !selectedIds.has(e.source) && !selectedIds.has(e.target)
              );
              const nextWfNodes = workflow.nodes.filter((n) => !selectedIds.has(n.id));

              setNodes(nextNodes);
              setEdges(nextEdges);
              setWorkflow((w) => ({ ...w, nodes: nextWfNodes }));
              pushHistory(nextNodes, nextEdges, nextWfNodes);
            }}
          />
        </ReactFlow>


      </div>

      {/* Node Inspector Drawer */}
      <NodeInspectorModal
        node={selectedNode}
        onClose={() => setSelectedNodeId(null)}
        onUpdateConfig={handleUpdateNodeConfig}
        onDuplicateNode={handleDuplicateNode}
        onDeleteNode={handleDeleteNode}
        onRunSingleNode={handleRunSoloNode}
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

      {/* Universal Node Picker Modal */}
      <UniversalNodePickerModal
        isOpen={isNodeLibraryOpen}
        onClose={() => setIsNodeLibraryOpen(false)}
        onAddNode={handleAddNode}
        onOpenOpenAPIImport={() => {
          setIsNodeLibraryOpen(false);
          setIsOpenOpenAPIModal(true);
        }}
      />

      {/* OpenAPI 3.0 / 3.1 Importer Modal */}
      <OpenAPIImportModal
        isOpen={isOpenOpenAPIModal}
        onClose={() => setIsOpenOpenAPIModal(false)}
        onImportComplete={(connectorName, count) => {
          setIsOpenOpenAPIModal(false);
          setIsNodeLibraryOpen(true);
        }}
      />
    </div>
  );
}
