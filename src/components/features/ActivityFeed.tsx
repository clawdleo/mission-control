"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { 
  Activity, 
  Filter, 
  Calendar,
  Mail,
  Trello,
  Brain,
  Code,
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { clsx } from "clsx";

const categories = [
  { id: "all", label: "All", icon: Activity },
  { id: "email", label: "Email", icon: Mail },
  { id: "trello", label: "Trello", icon: Trello },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "memory", label: "Memory", icon: Brain },
  { id: "code", label: "Code", icon: Code },
  { id: "message", label: "Messages", icon: MessageSquare },
];

const statuses = [
  { id: "all", label: "All Status" },
  { id: "success", label: "Success" },
  { id: "pending", label: "Pending" },
  { id: "failed", label: "Failed" },
];

const categoryColors: Record<string, string> = {
  email: "border-l-blue-500 bg-blue-500/5",
  trello: "border-l-green-500 bg-green-500/5",
  calendar: "border-l-purple-500 bg-purple-500/5",
  memory: "border-l-pink-500 bg-pink-500/5",
  code: "border-l-orange-500 bg-orange-500/5",
  message: "border-l-cyan-500 bg-cyan-500/5",
  default: "border-l-slate-500 bg-slate-500/5",
};

const categoryIcons: Record<string, any> = {
  email: Mail,
  trello: Trello,
  calendar: Calendar,
  memory: Brain,
  code: Code,
  message: MessageSquare,
  default: Activity,
};

export function ActivityFeed() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">("all");

  const getDateRange = () => {
    const now = Date.now();
    switch (dateFilter) {
      case "today":
        return { startDate: now - 24 * 60 * 60 * 1000 };
      case "week":
        return { startDate: now - 7 * 24 * 60 * 60 * 1000 };
      case "month":
        return { startDate: now - 30 * 24 * 60 * 60 * 1000 };
      default:
        return {};
    }
  };

  const activities = useQuery(api.activities.list, {
    limit: 100,
    category: selectedCategory === "all" ? undefined : selectedCategory,
    status: selectedStatus === "all" ? undefined : selectedStatus,
    ...getDateRange(),
  });

  // Group activities by date
  const groupedActivities = activities?.reduce((acc, activity) => {
    const date = new Date(activity.timestamp).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, typeof activities>);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filters */}
      <div className="glass rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400">Category:</span>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={clsx(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all",
                      selectedCategory === cat.id
                        ? "bg-primary-500/20 text-primary-400 border border-primary-500/30"
                        : "bg-slate-700/30 text-slate-400 hover:bg-slate-700/50 border border-transparent"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-slate-400">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary-500/50"
            >
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary-500/50"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-6">
        {groupedActivities && Object.entries(groupedActivities).map(([date, dayActivities]) => (
          <div key={date} className="space-y-3">
            {/* Date Header */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-full">
                <Calendar className="w-4 h-4 text-primary-400" />
                <span className="text-sm font-medium text-white">{date}</span>
              </div>
              <div className="flex-1 h-px bg-slate-700/50" />
              <span className="text-sm text-slate-500">{dayActivities?.length} actions</span>
            </div>

            {/* Activities */}
            <div className="space-y-2 ml-4">
              {dayActivities?.map((activity) => {
                const Icon = categoryIcons[activity.category] || categoryIcons.default;
                const colorClass = categoryColors[activity.category] || categoryColors.default;
                
                return (
                  <div
                    key={activity._id}
                    className={clsx(
                      "glass rounded-xl p-4 border-l-4 transition-all hover:scale-[1.01]",
                      colorClass
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-slate-800/50">
                        <Icon className="w-5 h-5 text-slate-300" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-white">{activity.action}</h3>
                          <StatusBadge status={activity.status} />
                        </div>
                        <p className="text-sm text-slate-400 mb-2">{activity.details}</p>
                        
                        {activity.metadata && (
                          <div className="flex flex-wrap gap-2">
                            {activity.metadata.source && (
                              <span className="px-2 py-0.5 bg-slate-700/50 rounded text-xs text-slate-400">
                                Source: {activity.metadata.source}
                              </span>
                            )}
                            {activity.metadata.duration && (
                              <span className="px-2 py-0.5 bg-slate-700/50 rounded text-xs text-slate-400">
                                Duration: {activity.metadata.duration}ms
                              </span>
                            )}
                            {activity.metadata.tags?.map((tag) => (
                              <span 
                                key={tag}
                                className="px-2 py-0.5 bg-primary-500/10 rounded text-xs text-primary-400"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-sm text-slate-500">
                          {formatTime(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {!activities?.length && (
          <div className="glass rounded-2xl p-12 text-center">
            <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No activities found</h3>
            <p className="text-slate-400">
              Activities will appear here as Leo performs actions
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    success: { icon: CheckCircle2, class: "bg-green-500/10 text-green-400" },
    pending: { icon: Clock, class: "bg-yellow-500/10 text-yellow-400" },
    failed: { icon: XCircle, class: "bg-red-500/10 text-red-400" },
  };

  const { icon: Icon, class: className } = config[status as keyof typeof config] || config.pending;

  return (
    <span className={clsx("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", className)}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
