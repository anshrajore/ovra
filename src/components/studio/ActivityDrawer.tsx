"use client";

import { X, Activity, Clock, User } from "lucide-react";
import { appStore } from "@/lib/store/app-store";

interface ActivityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ActivityDrawer({ isOpen, onClose }: ActivityDrawerProps) {
  const activities = appStore.getActivity();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-ovra-border/80 shadow-2xl z-50 flex flex-col justify-between animate-in slide-in-from-right duration-200 select-none">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-50 text-ovra-orange flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-950">Workspace Activity</h3>
            <p className="text-xs text-gray-500">
              Audit log of changes, executions, and member updates.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {activities.map((act) => (
          <div key={act.id} className="flex items-start gap-3 text-xs">
            <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
              {act.userAvatar}
            </div>
            <div className="flex-1">
              <div className="leading-snug">
                <span className="font-bold text-gray-950">{act.userName}</span>{" "}
                <span className="text-gray-600">{act.action}</span>{" "}
                <span className="font-semibold text-ovra-orange">{act.targetTitle}</span>
              </div>
              <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" /> {act.timestamp}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50/70 text-[11px] text-gray-500 text-center">
        All activity events are cryptographically recorded for enterprise compliance.
      </div>
    </div>
  );
}
