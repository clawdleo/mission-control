"use client";

import { useState } from "react";
import { Search, Bell, RefreshCw } from "lucide-react";

interface HeaderProps {
  onSearch: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const [searchValue, setSearchValue] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const now = new Date();
  const timeString = now.toLocaleTimeString("en-US", { 
    hour: "2-digit", 
    minute: "2-digit",
    hour12: true 
  });
  const dateString = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  });

  return (
    <header className="glass-dark border-b border-slate-700/50 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search memory, tasks, notes..."
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl 
                         text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50 
                         focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
          </div>
        </form>

        {/* Right Side */}
        <div className="flex items-center gap-4 ml-6">
          {/* Date/Time */}
          <div className="text-right">
            <div className="text-sm font-medium text-white">{timeString}</div>
            <div className="text-xs text-slate-400">{dateString}</div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
            title="Refresh data"
          >
            <RefreshCw 
              className={`w-5 h-5 text-slate-400 ${isRefreshing ? "animate-spin" : ""}`} 
            />
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-slate-700/50 transition-colors">
            <Bell className="w-5 h-5 text-slate-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
          </button>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="status-dot status-success" />
            <span className="text-sm text-green-400">Active</span>
          </div>
        </div>
      </div>
    </header>
  );
}
