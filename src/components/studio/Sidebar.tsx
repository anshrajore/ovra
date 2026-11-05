"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Workflow,
  PlayCircle,
  LayoutGrid,
  Layers,
  KeyRound,
  Settings,
  Folder,
  Plus,
  Sparkles,
  ArrowRight,
  Check,
  X,
  FlaskConical,
  Terminal,
} from "lucide-react";
import { WorkspaceSwitcherDropdown } from "../workspace/WorkspaceSwitcherDropdown";

interface StudioSidebarProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onSelectProject?: (project: string) => void;
}

export function StudioSidebar({
  activeTab,
  onSelectTab,
  onSelectProject,
}: StudioSidebarProps) {
  const pathname = usePathname();
  const [selectedProject, setSelectedProject] = useState("Default Project");
  const [projects, setProjects] = useState([
    { id: "default", name: "Default Project" },
  ]);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const navItems = [
    { id: "workflows", label: "Workflows", href: "/workflows", icon: Workflow },
    { id: "ai-studio", label: "AI Studio", href: "/ai-studio", icon: Sparkles },
    { id: "testlab", label: "TestLab", href: "/testlab", icon: FlaskConical },
    { id: "developers", label: "Developers", href: "/developers", icon: Terminal },
    { id: "executions", label: "Executions", href: "/executions", icon: PlayCircle },
    { id: "templates", label: "Templates", href: "/templates", icon: LayoutGrid },
    { id: "integrations", label: "Integrations", href: "/integrations", icon: Layers },
    { id: "credentials", label: "Credentials", href: "/credentials", icon: KeyRound },
    { id: "settings", label: "Settings", href: "/settings", icon: Settings },
  ];

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    const newProj = {
      id: `proj_${Date.now()}`,
      name: newProjectName.trim(),
    };
    setProjects([...projects, newProj]);
    setSelectedProject(newProj.name);
    setNewProjectName("");
    setIsAddProjectOpen(false);
  };

  return (
    <>
      <aside className="w-64 bg-[#FAF7F2] border-r border-ovra-border/70 flex flex-col justify-between p-4 select-none shrink-0">
        <div className="flex flex-col gap-6">
          {/* Functional Workspace Switcher Dropdown */}
          <WorkspaceSwitcherDropdown />

          {/* Primary Navigation Menu */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeTab === item.id ||
                pathname === item.href ||
                (item.id === "workflows" && pathname === "/studio");
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => onSelectTab?.(item.id)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#1E1F24] text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-950 hover:bg-black/5"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-500"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Projects Section */}
          <div className="pt-2">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Projects
              </span>
              <button
                onClick={() => setIsAddProjectOpen(!isAddProjectOpen)}
                className="w-5 h-5 rounded hover:bg-black/5 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                title="Create Project Folder"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Add Project Form */}
            {isAddProjectOpen && (
              <form onSubmit={handleAddProject} className="mb-2 px-2 flex items-center gap-1">
                <input
                  type="text"
                  autoFocus
                  placeholder="Project name..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded-md focus:border-ovra-orange outline-none"
                />
                <button
                  type="submit"
                  className="p-1 bg-gray-900 text-white rounded hover:bg-black shrink-0"
                >
                  <Check className="w-3 h-3" />
                </button>
              </form>
            )}

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

          <button
            onClick={() => setIsUpgradeModalOpen(true)}
            className="px-3 py-1.5 bg-[#1E1F24] hover:bg-gray-950 text-white rounded-full text-[11px] font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            Upgrade <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </aside>

      {/* Upgrade Pro Modal */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-ovra-orange">
                <Sparkles className="w-5 h-5 fill-ovra-orange" />
                <h3 className="text-base font-bold text-gray-950">OVRA Pro Plan</h3>
              </div>
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 mb-6">
              Unlock unlimited workflow executions, collaborative team seats, dedicated AI model token allowances, and 99.99% SLA priority worker queues.
            </p>

            <div className="p-4 bg-orange-50/50 border border-orange-200/80 rounded-2xl mb-6">
              <div className="text-2xl font-black text-gray-950">
                ₹3,999 <span className="text-xs font-normal text-gray-500">/ month</span>
              </div>
              <div className="text-xs text-gray-700 mt-2 space-y-1">
                <div>✓ 500,000 monthly executions</div>
                <div>✓ Unlimited workspace members</div>
                <div>✓ Custom Python/JS node runners</div>
                <div>✓ 24/7 Priority support</div>
              </div>
            </div>

            <button
              onClick={() => {
                alert("Thank you! Your workspace has been upgraded to OVRA Pro trial.");
                setIsUpgradeModalOpen(false);
              }}
              className="w-full py-2.5 bg-ovra-orange hover:bg-ovra-orange-dark text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Start 14-Day Free Pro Trial
            </button>
          </div>
        </div>
      )}
    </>
  );
}
