"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Activity, Zap, CheckCircle, Plus, Rocket, Lightbulb, FileText, Trash2 } from "lucide-react";
import clsx from "clsx";

interface ActivityItem {
  id: string;
  type: string;
  action: string;
  title: string;
  description?: string;
  source?: string;
  timestamp: number;
}

const typeIcons: Record<string, React.ReactNode> = {
  task: <CheckCircle className="w-5 h-5" />,
  project: <Rocket className="w-5 h-5" />,
  idea: <Lightbulb className="w-5 h-5" />,
  note: <FileText className="w-5 h-5" />,
  milestone: <Zap className="w-5 h-5" />,
};

const typeColors: Record<string, string> = {
  task: "text-green-400 bg-green-400/10 border-green-400/30",
  project: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  idea: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  note: "text-gray-400 bg-gray-400/10 border-gray-400/30",
  milestone: "text-purple-400 bg-purple-400/10 border-purple-400/30",
};

const actionVerbs: Record<string, string> = {
  created: "Created",
  completed: "Completed",
  updated: "Updated",
  deleted: "Deleted",
};

const sampleActivities: ActivityItem[] = [
  { id: "1", type: "project", action: "created", title: "Mission Control Dashboard", source: "manual", timestamp: Date.now() - 1000 * 60 * 5 },
  { id: "2", type: "task", action: "completed", title: "Set up Next.js + Tailwind", source: "trello", timestamp: Date.now() - 1000 * 60 * 15 },
  { id: "3", type: "idea", action: "created", title: "Add Trello integration for auto-sync", timestamp: Date.now() - 1000 * 60 * 30 },
  { id: "4", type: "milestone", action: "completed", title: "Phase 1: Core infrastructure", source: "notion", timestamp: Date.now() - 1000 * 60 * 60 },
  { id: "5", type: "note", action: "created", title: "Research Convex for real-time sync", timestamp: Date.now() - 1000 * 60 * 120 },
];

export default function MissionControl() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newActivity, setNewActivity] = useState({
    type: "task",
    action: "created",
    title: "",
    description: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("mission-control-activities");
    if (stored) {
      setActivities(JSON.parse(stored));
    } else {
      setActivities(sampleActivities);
      localStorage.setItem("mission-control-activities", JSON.stringify(sampleActivities));
    }
  }, []);

  useEffect(() => {
    if (activities.length > 0) {
      localStorage.setItem("mission-control-activities", JSON.stringify(activities));
    }
  }, [activities]);

  const addActivity = (activity: Omit<ActivityItem, "id" | "timestamp">) => {
    const newItem: ActivityItem = {
      ...activity,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setActivities([newItem, ...activities]);
  };

  const deleteActivity = (id: string) => {
    setActivities(activities.filter(a => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity.title.trim()) return;
    
    addActivity({
      type: newActivity.type,
      action: newActivity.action,
      title: newActivity.title,
      description: newActivity.description || undefined,
      source: "manual",
    });
    
    setNewActivity({ type: "task", action: "created", title: "", description: "" });
    setShowForm(false);
  };

  const stats = {
    total: activities.length,
    today: activities.filter(a => new Date(a.timestamp).toDateString() === new Date().toDateString()).length,
    completed: activities.filter(a => a.action === "completed").length,
    created: activities.filter(a => a.action === "created").length,
  };

  return (
    <main className="min-h-screen p-8">
      <header className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Mission Control
              </h1>
              <p className="text-gray-500 text-sm">Real-time activity feed</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            Add Activity
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-500 text-sm">Total Activities</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-500 text-sm">Today</p>
          <p className="text-2xl font-bold text-green-400">{stats.today}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-500 text-sm">Completed</p>
          <p className="text-2xl font-bold text-blue-400">{stats.completed}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-500 text-sm">Created</p>
          <p className="text-2xl font-bold text-purple-400">{stats.created}</p>
        </div>
      </div>

      {showForm && (
        <div className="max-w-4xl mx-auto mb-8">
          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Type</label>
                <select
                  value={newActivity.type}
                  onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="task">Task</option>
                  <option value="project">Project</option>
                  <option value="idea">Idea</option>
                  <option value="note">Note</option>
                  <option value="milestone">Milestone</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Action</label>
                <select
                  value={newActivity.action}
                  onChange={(e) => setNewActivity({ ...newActivity, action: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="created">Created</option>
                  <option value="completed">Completed</option>
                  <option value="updated">Updated</option>
                  <option value="deleted">Deleted</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Title</label>
              <input
                type="text"
                value={newActivity.title}
                onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                placeholder="What happened?"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Description (optional)</label>
              <textarea
                value={newActivity.description}
                onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                placeholder="Add more details..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white h-20"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition"
              >
                Add Activity
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-300 mb-4">Activity Feed</h2>
        
        {activities.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4" />
            <p>No activities yet. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={clsx(
                  "activity-item flex items-start gap-4 p-4 rounded-xl border group",
                  typeColors[activity.type] || typeColors.note
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {typeIcons[activity.type] || typeIcons.note}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs uppercase tracking-wide opacity-70">
                      {actionVerbs[activity.action]} {activity.type}
                    </span>
                    {activity.source && (
                      <span className="text-xs bg-black/20 px-2 py-0.5 rounded">
                        {activity.source}
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-white">{activity.title}</p>
                  {activity.description && (
                    <p className="text-sm opacity-70 mt-1">{activity.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs opacity-50 whitespace-nowrap">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </span>
                  <button
                    onClick={() => deleteActivity(activity.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="max-w-4xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-gray-600 text-sm">
        <p>Mission Control v1.0 • Built by Leo 🚀</p>
        <p className="mt-1">Convex integration coming soon for real-time sync</p>
      </footer>
    </main>
  );
}
