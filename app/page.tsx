"use client";

import { useState, useEffect, useMemo } from "react";
import { formatDistanceToNow, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from "date-fns";
import { Activity, Zap, CheckCircle, Plus, Rocket, Lightbulb, FileText, Trash2, Search, Calendar, List, ChevronLeft, ChevronRight, X } from "lucide-react";
import clsx from "clsx";

interface ActivityItem {
  id: string;
  type: string;
  action: string;
  title: string;
  description?: string;
  source?: string;
  timestamp: number;
  scheduledDate?: string; // YYYY-MM-DD for scheduled activities
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

const typeDotColors: Record<string, string> = {
  task: "bg-green-400",
  project: "bg-blue-400",
  idea: "bg-yellow-400",
  note: "bg-gray-400",
  milestone: "bg-purple-400",
};

const actionVerbs: Record<string, string> = {
  created: "Created",
  completed: "Completed",
  updated: "Updated",
  deleted: "Deleted",
  scheduled: "Scheduled",
};

const sampleActivities: ActivityItem[] = [
  { id: "1", type: "project", action: "created", title: "Mission Control Dashboard", source: "manual", timestamp: Date.now() - 1000 * 60 * 5 },
  { id: "2", type: "task", action: "completed", title: "Set up Next.js + Tailwind", source: "trello", timestamp: Date.now() - 1000 * 60 * 15 },
  { id: "3", type: "idea", action: "created", title: "Add Trello integration for auto-sync", timestamp: Date.now() - 1000 * 60 * 30 },
  { id: "4", type: "milestone", action: "completed", title: "Phase 1: Core infrastructure", source: "notion", timestamp: Date.now() - 1000 * 60 * 60 },
  { id: "5", type: "note", action: "created", title: "Research Convex for real-time sync", timestamp: Date.now() - 1000 * 60 * 120 },
  { id: "6", type: "task", action: "scheduled", title: "Weekly review meeting", scheduledDate: format(addMonths(new Date(), 0), "yyyy-MM-dd"), timestamp: Date.now() - 1000 * 60 * 180 },
];

export default function MissionControl() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newActivity, setNewActivity] = useState({ type: "task", action: "created", title: "", description: "", scheduledDate: "" });
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"feed" | "calendar">("feed");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("mission-control-activities");
    if (stored) {
      setActivities(JSON.parse(stored));
    } else {
      setActivities(sampleActivities);
      localStorage.setItem("mission-control-activities", JSON.stringify(sampleActivities));
    }
  }, []);

  useEffect(() => {
    if (mounted && activities.length > 0) {
      localStorage.setItem("mission-control-activities", JSON.stringify(activities));
    }
  }, [activities, mounted]);

  // Filter activities based on search query
  const filteredActivities = useMemo(() => {
    if (!searchQuery.trim()) return activities;
    const query = searchQuery.toLowerCase();
    return activities.filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query) ||
        a.type.toLowerCase().includes(query) ||
        a.action.toLowerCase().includes(query) ||
        a.source?.toLowerCase().includes(query)
    );
  }, [activities, searchQuery]);

  // Get activities for calendar (by date)
  const getActivitiesForDate = (date: Date) => {
    return filteredActivities.filter((a) => {
      // Check scheduled date first
      if (a.scheduledDate) {
        return isSameDay(new Date(a.scheduledDate), date);
      }
      // Fall back to timestamp
      return isSameDay(new Date(a.timestamp), date);
    });
  };

  // Calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    // Pad start to make week start on Monday
    const startDay = start.getDay();
    const paddingStart = startDay === 0 ? 6 : startDay - 1;
    const paddingDays: (Date | null)[] = Array(paddingStart).fill(null);
    
    return [...paddingDays, ...days];
  }, [currentMonth]);

  const addActivity = (activity: Omit<ActivityItem, "id" | "timestamp">) => {
    const newItem: ActivityItem = { ...activity, id: crypto.randomUUID(), timestamp: Date.now() };
    setActivities([newItem, ...activities]);
  };

  const deleteActivity = (id: string) => setActivities(activities.filter((a) => a.id !== id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity.title.trim()) return;
    addActivity({
      type: newActivity.type,
      action: newActivity.scheduledDate ? "scheduled" : newActivity.action,
      title: newActivity.title,
      description: newActivity.description || undefined,
      source: "manual",
      scheduledDate: newActivity.scheduledDate || undefined,
    });
    setNewActivity({ type: "task", action: "created", title: "", description: "", scheduledDate: "" });
    setShowForm(false);
  };

  const stats = {
    total: activities.length,
    today: activities.filter((a) => new Date(a.timestamp).toDateString() === new Date().toDateString()).length,
    completed: activities.filter((a) => a.action === "completed").length,
    scheduled: activities.filter((a) => a.scheduledDate).length,
  };

  if (!mounted) return <div className="min-h-screen flex items-center justify-center"><Activity className="w-12 h-12 animate-pulse" /></div>;

  return (
    <main className="min-h-screen p-4 md:p-8">
      <header className="max-w-5xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Mission Control</h1>
              <p className="text-gray-500 text-sm">Real-time activity feed</p>
            </div>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition">
            <Plus className="w-5 h-5" /> Add Activity
          </button>
        </div>
      </header>

      {/* Search Bar */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activities..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-12 pr-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700 rounded transition">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-sm text-gray-500 mt-2">
            Found {filteredActivities.length} result{filteredActivities.length !== 1 ? "s" : ""} for &quot;{searchQuery}&quot;
          </p>
        )}
      </div>

      {/* View Tabs */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="flex gap-2 p-1 bg-gray-900 rounded-lg w-fit">
          <button
            onClick={() => setView("feed")}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-md transition",
              view === "feed" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
            )}
          >
            <List className="w-4 h-4" /> Feed
          </button>
          <button
            onClick={() => setView("calendar")}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-md transition",
              view === "calendar" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
            )}
          >
            <Calendar className="w-4 h-4" /> Calendar
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mb-8 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-white" },
          { label: "Today", value: stats.today, color: "text-green-400" },
          { label: "Completed", value: stats.completed, color: "text-blue-400" },
          { label: "Scheduled", value: stats.scheduled, color: "text-purple-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-500 text-sm">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="max-w-5xl mx-auto mb-8">
          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Type</label>
                <select value={newActivity.type} onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white">
                  {["task", "project", "idea", "note", "milestone"].map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Action</label>
                <select value={newActivity.action} onChange={(e) => setNewActivity({ ...newActivity, action: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white">
                  {["created", "completed", "updated", "deleted"].map((a) => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Schedule Date (optional)</label>
                <input
                  type="date"
                  value={newActivity.scheduledDate}
                  onChange={(e) => setNewActivity({ ...newActivity, scheduledDate: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Title</label>
              <input type="text" value={newActivity.title} onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })} placeholder="What happened?" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white" />
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Description (optional)</label>
              <textarea value={newActivity.description} onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })} placeholder="Add more details..." className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white h-20" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition">Add Activity</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Feed View */}
      {view === "feed" && (
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-300 mb-4">Activity Feed</h2>
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4" />
              <p>{searchQuery ? "No activities match your search." : "No activities yet. Create your first one!"}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className={clsx("activity-item flex items-start gap-4 p-4 rounded-xl border group", typeColors[activity.type] || typeColors.note)}>
                  <div className="flex-shrink-0 mt-0.5">{typeIcons[activity.type] || typeIcons.note}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs uppercase tracking-wide opacity-70">{actionVerbs[activity.action]} {activity.type}</span>
                      {activity.source && <span className="text-xs bg-black/20 px-2 py-0.5 rounded">{activity.source}</span>}
                      {activity.scheduledDate && (
                        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {format(new Date(activity.scheduledDate), "MMM d, yyyy")}
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-white">{activity.title}</p>
                    {activity.description && <p className="text-sm opacity-70 mt-1">{activity.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-50 whitespace-nowrap">{formatDistanceToNow(activity.timestamp, { addSuffix: true })}</span>
                    <button onClick={() => deleteActivity(activity.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Calendar View */}
      {view === "calendar" && (
        <div className="max-w-5xl mx-auto">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-300">{format(currentMonth, "MMMM yyyy")}</h2>
            <div className="flex gap-2">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => setCurrentMonth(new Date())} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition">
                Today
              </button>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-gray-800">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                if (!day) {
                  return <div key={`empty-${idx}`} className="min-h-[100px] p-2 border-b border-r border-gray-800/50 bg-gray-950/30" />;
                }

                const dayActivities = getActivitiesForDate(day);
                const isToday = isSameDay(day, new Date());
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(selectedDate && isSameDay(day, selectedDate) ? null : day)}
                    className={clsx(
                      "min-h-[100px] p-2 border-b border-r border-gray-800/50 cursor-pointer transition hover:bg-gray-800/50",
                      !isCurrentMonth && "opacity-40",
                      isSelected && "bg-purple-900/30 border-purple-500"
                    )}
                  >
                    <div className={clsx(
                      "text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full",
                      isToday && "bg-purple-600 text-white"
                    )}>
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {dayActivities.slice(0, 3).map((a) => (
                        <div key={a.id} className="flex items-center gap-1">
                          <div className={clsx("w-2 h-2 rounded-full flex-shrink-0", typeDotColors[a.type] || typeDotColors.note)} />
                          <span className="text-xs text-gray-400 truncate">{a.title}</span>
                        </div>
                      ))}
                      {dayActivities.length > 3 && (
                        <span className="text-xs text-gray-500">+{dayActivities.length - 3} more</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Activities */}
          {selectedDate && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-300 mb-4">
                Activities for {format(selectedDate, "MMMM d, yyyy")}
              </h3>
              {getActivitiesForDate(selectedDate).length === 0 ? (
                <p className="text-gray-500">No activities on this day.</p>
              ) : (
                <div className="space-y-3">
                  {getActivitiesForDate(selectedDate).map((activity) => (
                    <div key={activity.id} className={clsx("activity-item flex items-start gap-4 p-4 rounded-xl border group", typeColors[activity.type] || typeColors.note)}>
                      <div className="flex-shrink-0 mt-0.5">{typeIcons[activity.type] || typeIcons.note}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs uppercase tracking-wide opacity-70">{actionVerbs[activity.action]} {activity.type}</span>
                          {activity.source && <span className="text-xs bg-black/20 px-2 py-0.5 rounded">{activity.source}</span>}
                        </div>
                        <p className="font-medium text-white">{activity.title}</p>
                        {activity.description && <p className="text-sm opacity-70 mt-1">{activity.description}</p>}
                      </div>
                      <button onClick={() => deleteActivity(activity.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <footer className="max-w-5xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-gray-600 text-sm">
        <p>Mission Control v1.1 • Built by Leo 🚀</p>
      </footer>
    </main>
  );
}
