"use client";

import { 
  LayoutDashboard, 
  Activity, 
  Calendar, 
  Search,
  Bot,
} from "lucide-react";
import { clsx } from "clsx";

type View = "dashboard" | "activity" | "calendar" | "search";

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const navItems = [
  { id: "dashboard" as View, icon: LayoutDashboard, label: "Dashboard" },
  { id: "activity" as View, icon: Activity, label: "Activity Feed" },
  { id: "calendar" as View, icon: Calendar, label: "Calendar" },
  { id: "search" as View, icon: Search, label: "Search" },
];

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-64 glass-dark border-r border-slate-700/50 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center glow">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white">Mission Control</h1>
            <p className="text-xs text-slate-400">Leo's Command Center</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={clsx(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-primary-500/20 text-primary-400 glow-subtle"
                      : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Status Footer */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="status-dot status-success" />
            <span className="text-sm text-slate-300">System Online</span>
          </div>
          <div className="text-xs text-slate-500">
            Last sync: just now
          </div>
        </div>
      </div>
    </aside>
  );
}
