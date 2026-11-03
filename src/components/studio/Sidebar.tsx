"use client";

import { useState } from "react";
import {
  Workflow,
  PlayCircle,
  LayoutGrid,
  Layers,
  KeyRound,
  Settings,
  Folder,
  Plus,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Building2,
} from "lucide-react";

interface StudioSidebarProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onSelectProject?: (project: string) => void;
}

export function StudioSidebar({
  activeTab = "workflows",
  onSelectTab,
  onSelectProject,
}: StudioSidebarProps) {
  const [selectedProject, setSelectedProject] = useState("SanjeevaniX");

  const navItems = [
    { id: "workflows", label: "Workflows", icon: Workflow },
    { id: "executions", label: "Executions", icon: PlayCircle },
    { id: "templates", label: "Templates", icon: LayoutGrid },
    { id: "integrations", label: "Integrations", icon: Layers },
    { id: "credentials", label: "Credentials", icon: KeyRound },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const projects = [
    { id: "sanjeevanix", name: "SanjeevaniX" },
    { id: "nayamarg", name: "NayaMarg" },
    { id: "research", name: "Research" },
    { id: "general", name: "General" },
  ];

  return (
    <aside className="w-64 bg-[#FAF7F2] border-r border-ovra-border/70 flex flex-col justify-between p-4 select-none shrink-0">
      <div className="flex flex-col gap-6">
        {/* Workspace Dropdown Button */}
        <button className="w-full flex items-center justify-between px-3 py-2.5 bg-white hover:bg-gray-50 border border-gray-200/80 rounded-xl shadow-xs transition-colors">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-gray-700" />
            <span className="text-xs font-bold text-gray-900 tracking-tight">
              Team Workspace
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
        </button>

        {/* Primary Navigation Menu */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab?.(item.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#1E1F24] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-950 hover:bg-black/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-500"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Projects Section */}
        <div className="pt-2">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Projects
            </span>
            <button className="w-5 h-5 rounded hover:bg-black/5 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-0.5">
            {projects.map((proj) => {
              const isSelected = selectedProject === proj.name;
              return (
                <button
                  key={proj.id}
                  onClick={() => {
                    setSelectedProject(proj.name);
                    onSelectProject?.(proj.name);
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-white text-gray-950 font-semibold shadow-2xs border border-gray-200/60"
                      : "text-gray-600 hover:text-gray-950 hover:bg-black/5"
                  }`}
                >
                  <Folder
                    className={`w-3.5 h-3.5 ${
                      isSelected ? "text-ovra-orange" : "text-gray-400"
                    }`}
                  />
                  <span>{proj.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upgrade to Pro Card */}
      <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-[#FFF4EA] to-[#FEE4D6] border border-ovra-orange/20 shadow-xs">
        {/* Subtle orange glow */}
        <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-ovra-orange/20 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center gap-1.5 text-ovra-orange mb-1.5">
          <Sparkles className="w-4 h-4 fill-ovra-orange text-ovra-orange" />
        </div>

        <h4 className="text-xs font-bold text-gray-950 mb-1">
          Upgrade to Pro
        </h4>
        <p className="text-[11px] text-gray-600 leading-relaxed mb-3">
          Get more executions, team seats and AI features.
        </p>

        <button className="px-3 py-1.5 bg-[#1E1F24] hover:bg-gray-950 text-white rounded-full text-[11px] font-semibold flex items-center gap-1.5 shadow-sm transition-all">
          Upgrade <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </aside>
  );
}
