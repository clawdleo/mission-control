"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Mail,
  Trello,
  Calendar,
  Brain
} from "lucide-react";
import { clsx } from "clsx";

const categoryIcons: Record<string, any> = {
  email: Mail,
  trello: Trello,
  calendar: Calendar,
  memory: Brain,
  default: Activity,
};

const categoryColors: Record<string, string> = {
  email: "text-blue-400 bg-blue-500/10",
  trello: "text-green-400 bg-green-500/10",
  calendar: "text-purple-400 bg-purple-500/10",
  memory: "text-pink-400 bg-pink-500/10",
  default: "text-slate-400 bg-slate-500/10",
};

export function Dashboard() {
  const stats = useQuery(api.activities.stats, { hours: 24 });
  const recentActivities = useQuery(api.activities.list, { limit: 5 });
  const upcomingTasks = useQuery(api.tasks.upcoming, { limit: 5 });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Actions (24h)"
          value={stats?.total ?? 0}
          icon={Activity}
          color="primary"
        />
        <StatCard
          title="Success Rate"
          value={`${stats?.successRate ?? 100}%`}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Pending Tasks"
          value={upcomingTasks?.length ?? 0}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Categories Active"
          value={Object.keys(stats?.byCategory ?? {}).length}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-400" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentActivities?.map((activity) => {
              const Icon = categoryIcons[activity.category] || categoryIcons.default;
              const colorClass = categoryColors[activity.category] || categoryColors.default;
              
              return (
                <div 
                  key={activity._id} 
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                >
                  <div className={clsx("p-2 rounded-lg", colorClass)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {activity.action}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {activity.details}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={activity.status} />
                    <span className="text-xs text-slate-500">
                      {formatRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })}
            {!recentActivities?.length && (
              <div className="text-center py-8 text-slate-500">
                No recent activity
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            Upcoming Tasks
          </h2>
          <div className="space-y-3">
            {upcomingTasks?.map((task) => (
              <div 
                key={task._id} 
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
              >
                <div className={clsx(
                  "p-2 rounded-lg",
                  task.priority === "high" ? "text-red-400 bg-red-500/10" :
                  task.priority === "medium" ? "text-yellow-400 bg-yellow-500/10" :
                  "text-green-400 bg-green-500/10"
                )}>
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDateTime(task.scheduledFor)}
                  </p>
                </div>
                <span className={clsx(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  task.source === "trello" ? "bg-green-500/10 text-green-400" :
                  task.source === "cron" ? "bg-blue-500/10 text-blue-400" :
                  "bg-slate-500/10 text-slate-400"
                )}>
                  {task.source}
                </span>
              </div>
            ))}
            {!upcomingTasks?.length && (
              <div className="text-center py-8 text-slate-500">
                No upcoming tasks
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Activity by Category (24h)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Object.entries(stats?.byCategory ?? {}).map(([category, count]) => {
            const Icon = categoryIcons[category] || categoryIcons.default;
            const colorClass = categoryColors[category] || categoryColors.default;
            
            return (
              <div key={category} className="text-center p-4 rounded-xl bg-slate-800/30">
                <div className={clsx("inline-flex p-3 rounded-xl mb-2", colorClass)}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold text-white">{count as number}</div>
                <div className="text-xs text-slate-400 capitalize">{category}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color 
}: { 
  title: string; 
  value: number | string; 
  icon: any; 
  color: "primary" | "green" | "yellow" | "purple" 
}) {
  const colorClasses = {
    primary: "from-primary-500/20 to-primary-600/10 border-primary-500/20",
    green: "from-green-500/20 to-green-600/10 border-green-500/20",
    yellow: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/20",
    purple: "from-purple-500/20 to-purple-600/10 border-purple-500/20",
  };

  const iconColors = {
    primary: "text-primary-400",
    green: "text-green-400",
    yellow: "text-yellow-400",
    purple: "text-purple-400",
  };

  return (
    <div className={clsx(
      "relative overflow-hidden rounded-2xl border p-6",
      "bg-gradient-to-br",
      colorClasses[color]
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
        <Icon className={clsx("w-8 h-8", iconColors[color])} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusClasses = {
    success: "bg-green-500/10 text-green-400",
    pending: "bg-yellow-500/10 text-yellow-400",
    failed: "bg-red-500/10 text-red-400",
  };

  return (
    <span className={clsx(
      "px-2 py-0.5 rounded-full text-xs font-medium",
      statusClasses[status as keyof typeof statusClasses] || statusClasses.pending
    )}>
      {status}
    </span>
  );
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
