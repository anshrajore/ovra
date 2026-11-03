"use client";

import { useState } from "react";
import {
  MousePointer,
  Hand,
  Plus,
  Link2,
  Trash2,
  Maximize2,
  Minus,
} from "lucide-react";
import { useReactFlow } from "@xyflow/react";

interface FloatingToolbarProps {
  onOpenNodeLibrary?: () => void;
  onDeleteSelected?: () => void;
}

export function FloatingToolbar({
  onOpenNodeLibrary,
  onDeleteSelected,
}: FloatingToolbarProps) {
  const [activeTool, setActiveTool] = useState<"pointer" | "hand" | "link">(
    "pointer"
  );
  const { zoomIn, zoomOut, fitView, zoomTo, getZoom } = useReactFlow();

  const handleZoomReset = () => {
    zoomTo(1);
  };

  return (
    <>
      {/* 1. Bottom Left: Zoom & View Controls */}
      <div className="absolute left-6 bottom-6 z-10 flex items-center bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-2xl shadow-soft px-3 py-1.5 gap-2 select-none">
        <button
          onClick={() => fitView({ padding: 0.2 })}
          title="Fit to View"
          className="p-1.5 text-gray-600 hover:text-gray-950 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        <div className="h-3 w-px bg-gray-200" />

        <button
          onClick={() => zoomOut()}
          title="Zoom Out"
          className="p-1.5 text-gray-600 hover:text-gray-950 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleZoomReset}
          className="text-xs font-semibold text-gray-700 hover:text-gray-950 px-1 py-0.5 rounded transition-colors"
        >
          100%
        </button>

        <button
          onClick={() => zoomIn()}
          title="Zoom In"
          className="p-1.5 text-gray-600 hover:text-gray-950 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Bottom Center: Interaction Modes Toolbar */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-6 z-10 flex items-center bg-[#1E1F24] border border-white/10 rounded-2xl shadow-xl px-2 py-1.5 gap-1 select-none">
        {/* Pointer Tool */}
        <button
          onClick={() => setActiveTool("pointer")}
          title="Select Mode"
          className={`p-2 rounded-xl text-xs transition-colors ${
            activeTool === "pointer"
              ? "bg-white/20 text-white shadow-2xs"
              : "text-gray-400 hover:text-white hover:bg-white/10"
          }`}
        >
          <MousePointer className="w-4 h-4" />
        </button>

        {/* Hand Pan Tool */}
        <button
          onClick={() => setActiveTool("hand")}
          title="Pan Mode"
          className={`p-2 rounded-xl text-xs transition-colors ${
            activeTool === "hand"
              ? "bg-white/20 text-white shadow-2xs"
              : "text-gray-400 hover:text-white hover:bg-white/10"
          }`}
        >
          <Hand className="w-4 h-4" />
        </button>

        {/* Plus / Add Node Tool */}
        <button
          onClick={onOpenNodeLibrary}
          title="Add New Node"
          className="p-2 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Link / Connection Tool */}
        <button
          onClick={() => setActiveTool("link")}
          title="Connect Mode"
          className={`p-2 rounded-xl text-xs transition-colors ${
            activeTool === "link"
              ? "bg-white/20 text-white shadow-2xs"
              : "text-gray-400 hover:text-white hover:bg-white/10"
          }`}
        >
          <Link2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-white/20 mx-0.5" />

        {/* Trash / Delete Tool */}
        <button
          onClick={onDeleteSelected}
          title="Delete Selected"
          className="p-2 rounded-xl text-xs text-gray-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}
