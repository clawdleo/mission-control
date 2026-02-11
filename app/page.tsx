"use client";

import { useState, useEffect, useMemo } from "react";
import { formatDistanceToNow, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, addDays } from "date-fns";
import { Activity, Zap, CheckCircle, Plus, Rocket, Lightbulb, FileText, Trash2, Search, Calendar, List, ChevronLeft, ChevronRight, X, Clock, RefreshCw, Download, Upload } from "lucide-react";
import clsx from "clsx";

interface ActivityItem {
  id: string;
  type: string;
  action: string;
  title: string;
  description?: string;
  source?: string;
  timestamp: number;
  scheduledDate?: string;
  recurrence?: string; // e.g., "daily", "weekdays", "weekly", "monthly"
}

const typeIcons: Record<string, React.ReactNode> = {
  task: <CheckCircle className="w-5 h-5" />,
  project: <Rocket className="w-5 h-5" />,
  idea: <Lightbulb className="w-5 h-5" />,
  note: <FileText className="w-5 h-5" />,
  milestone: <Zap className="w-5 h-5" />,
  cron: <RefreshCw className="w-5 h-5" />,
  autonomous: <Clock className="w-5 h-5" />,
};

const typeColors: Record<string, string> = {
  task: "text-green-400 bg-green-400/10 border-green-400/30",
  project: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  idea: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  note: "text-gray-400 bg-gray-400/10 border-gray-400/30",
  milestone: "text-purple-400 bg-purple-400/10 border-purple-400/30",
  cron: "text-orange-400 bg-orange-400/10 border-orange-400/30",
  autonomous: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
};

const typeDotColors: Record<string, string> = {
  task: "bg-green-400",
  project: "bg-blue-400",
  idea: "bg-yellow-400",
  note: "bg-gray-400",
  milestone: "bg-purple-400",
  cron: "bg-orange-400",
  autonomous: "bg-cyan-400",
};

const actionVerbs: Record<string, string> = {
  created: "Created",
  completed: "Completed",
  updated: "Updated",
  deleted: "Deleted",
  scheduled: "Scheduled",
  running: "Running",
  planned: "Planned",
};

// Generate dates for this week
const today = new Date();
const getDateStr = (daysFromNow: number) => format(addDays(today, daysFromNow), "yyyy-MM-dd");

// All activities: cron jobs + autonomous work + completed items
const now = Date.now();
const initialActivities: ActivityItem[] = [
  // === COMPLETED TODAY ===
  { id: "done-1", type: "milestone", action: "completed", title: "Mission Control v1.1 deployed", description: "Added Calendar View + Global Search features", source: "leo", timestamp: now - 1000 * 60 * 10 },
  { id: "done-2", type: "project", action: "completed", title: "SparkNote v3.5.1", description: "Real AI integration with Claude API, continuous recording, fixed swipe conflicts", source: "leo", timestamp: now - 1000 * 60 * 60 * 8 },
  
  // === ACTIVE CRON JOBS (recurring) ===
  { id: "cron-1", type: "cron", action: "running", title: "Morning Briefing", description: "7:30 AM weekdays — Work email priorities from Trello Command Center", source: "cron", recurrence: "weekdays", scheduledDate: getDateStr(0), timestamp: now },
  { id: "cron-2", type: "cron", action: "running", title: "Trello Inbox Check", description: "Every 30min (8-18) weekdays — Process new work emails, check overdue, archive done", source: "cron", recurrence: "weekdays", scheduledDate: getDateStr(0), timestamp: now },
  { id: "cron-3", type: "cron", action: "running", title: "OneNote Tasks (Morning)", description: "8:00 AM daily — Parse Slovenian tasks from OneNote, create Trello cards", source: "cron", recurrence: "daily", scheduledDate: getDateStr(0), timestamp: now },
  { id: "cron-4", type: "cron", action: "running", title: "OneNote Tasks (Afternoon)", description: "2:00 PM daily — Check for new OneNote comments", source: "cron", recurrence: "daily", scheduledDate: getDateStr(0), timestamp: now },
  { id: "cron-5", type: "cron", action: "running", title: "OneNote Tasks (Evening)", description: "8:00 PM daily — Final OneNote check", source: "cron", recurrence: "daily", scheduledDate: getDateStr(0), timestamp: now },
  { id: "cron-6", type: "cron", action: "running", title: "Keto Daily Check-in", description: "9:00 PM daily — Ask about meals, score on keto scale, log macros", source: "cron", recurrence: "daily", scheduledDate: getDateStr(0), timestamp: now },
  { id: "cron-7", type: "cron", action: "running", title: "DJI Avinox Weekly News", description: "Friday 9:00 AM — eMTB news roundup, new bikes, firmware, availability", source: "cron", recurrence: "weekly", scheduledDate: getDateStr(4), timestamp: now },
  { id: "cron-8", type: "cron", action: "running", title: "Weekly Crypto Digest", description: "Monday 8:00 AM — Market pulse, hot narratives, actionable alpha", source: "cron", recurrence: "weekly", scheduledDate: getDateStr(7), timestamp: now },
  { id: "cron-9", type: "cron", action: "running", title: "Weekly MTB Hunt", description: "Monday 11:00 AM — Scan willhaben.at, bolha.si, njuskalo.hr for vintage MTB deals", source: "cron", recurrence: "weekly", scheduledDate: getDateStr(7), timestamp: now },
  
  // === AUTONOMOUS WORK PLAN: WEEK OF FEB 11-17 ===
  
  // Tonight (Feb 11)
  { id: "auto-1", type: "autonomous", action: "planned", title: "GAZDA Development Sprint", description: "Work on core features: user auth, landlord profiles, rating system", source: "leo", scheduledDate: getDateStr(0), timestamp: now },
  { id: "auto-2", type: "autonomous", action: "planned", title: "Reddit Problem Hunting", description: "Scan r/startups, r/SideProject, r/Entrepreneur for buildable problems", source: "leo", scheduledDate: getDateStr(0), timestamp: now },
  
  // Wednesday Feb 12
  { id: "auto-3", type: "autonomous", action: "planned", title: "Second Brain Expansion", description: "Add content to Notion: GAZDA project docs, research findings", source: "leo", scheduledDate: getDateStr(1), timestamp: now },
  { id: "auto-4", type: "autonomous", action: "planned", title: "Content Creation: Carousel Ideas", description: "Create 3 Instagram carousel concepts for potential accounts", source: "leo", scheduledDate: getDateStr(1), timestamp: now },
  
  // Thursday Feb 13
  { id: "auto-5", type: "autonomous", action: "planned", title: "GAZDA: MVP Features", description: "Build landlord registration flow, basic review submission", source: "leo", scheduledDate: getDateStr(2), timestamp: now },
  { id: "auto-6", type: "autonomous", action: "planned", title: "Crypto Deep Dive", description: "Research 3 innovative projects like TAO/Bittensor style", source: "leo", scheduledDate: getDateStr(2), timestamp: now },
  
  // Friday Feb 14
  { id: "auto-7", type: "autonomous", action: "planned", title: "Weekly Review & Planning", description: "Review what got done, update memory files, plan next week", source: "leo", scheduledDate: getDateStr(3), timestamp: now },
  { id: "auto-8", type: "autonomous", action: "planned", title: "Morning Surprise Build", description: "Build something cool for Alen to wake up to Saturday", source: "leo", scheduledDate: getDateStr(3), timestamp: now },
  
  // Saturday Feb 15
  { id: "auto-9", type: "autonomous", action: "planned", title: "Deep Work: GAZDA or New Project", description: "Extended build session on main project", source: "leo", scheduledDate: getDateStr(4), timestamp: now },
  { id: "auto-10", type: "autonomous", action: "planned", title: "Tool Improvements", description: "Enhance existing tools: Mission Control, SparkNote, etc.", source: "leo", scheduledDate: getDateStr(4), timestamp: now },
  
  // Sunday Feb 16
  { id: "auto-11", type: "autonomous", action: "planned", title: "Content & Research Day", description: "X/Twitter content ideas, Reddit scanning, trend research", source: "leo", scheduledDate: getDateStr(5), timestamp: now },
  { id: "auto-12", type: "autonomous", action: "planned", title: "Memory & Docs Cleanup", description: "Organize memory files, update MEMORY.md with learnings", source: "leo", scheduledDate: getDateStr(5), timestamp: now },
  
  // Monday Feb 17
  { id: "auto-13", type: "autonomous", action: "planned", title: "Week Kickoff: Priority Tasks", description: "Start week strong with high-impact work", source: "leo", scheduledDate: getDateStr(6), timestamp: now },
  { id: "auto-14", type: "autonomous", action: "planned", title: "Convex Integration for Mission Control", description: "Add real-time sync so activities persist across devices", source: "leo", scheduledDate: getDateStr(6), timestamp: now },
  
  // === PROJECTS IN PROGRESS ===
  { id: "proj-1", type: "project", action: "updated", title: "GAZDA (MojGazda)", description: "Tenant-landlord rating platform for Croatia. Live at mojgazda.onrender.com", source: "render", timestamp: now - 1000 * 60 * 60 * 24 },
  { id: "proj-2", type: "project", action: "updated", title: "SparkNote", description: "Voice-first note-taking Android app with AI. v3.5.1 on ClawdDrive", source: "flutter", timestamp: now - 1000 * 60 * 60 * 8 },
  { id: "proj-3", type: "project", action: "updated", title: "OcijeniGazdu", description: "Croatian version of GAZDA. Live at ocijenigazdu.onrender.com", source: "render", timestamp: now - 1000 * 60 * 60 * 24 * 2 },
  { id: "proj-4", type: "project", action: "created", title: "Mission Control", description: "Activity feed dashboard. This app! v1.2 with all features", source: "render", timestamp: now - 1000 * 60 * 60 * 6 },
  
  // === IDEAS BACKLOG ===
  { id: "idea-1", type: "idea", action: "created", title: "Convex real-time sync", description: "Replace localStorage with Convex for cross-device Mission Control", source: "leo", timestamp: now - 1000 * 60 * 60 * 2 },
  { id: "idea-2", type: "idea", action: "created", title: "Trello integration", description: "Auto-sync Leo's Command Center cards to Mission Control", source: "leo", timestamp: now - 1000 * 60 * 60 * 3 },
  { id: "idea-3", type: "idea", action: "created", title: "Notion integration", description: "Pull tasks from Personal Kanban to Mission Control", source: "leo", timestamp: now - 1000 * 60 * 60 * 4 },
];

export default function MissionControl() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newActivity, setNewActivity] = useState({ type: "task", action: "created", title: "", description: "", scheduledDate: "", recurrence: "" });
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"feed" | "calendar">("feed");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("mission-control-activities");
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with initial activities (avoid duplicates by id)
      const existingIds = new Set(parsed.map((a: ActivityItem) => a.id));
      const newItems = initialActivities.filter(a => !existingIds.has(a.id));
      const merged = [...newItems, ...parsed];
      setActivities(merged);
      localStorage.setItem("mission-control-activities", JSON.stringify(merged));
    } else {
      setActivities(initialActivities);
      localStorage.setItem("mission-control-activities", JSON.stringify(initialActivities));
    }
  }, []);

  useEffect(() => {
    if (mounted && activities.length > 0) {
      localStorage.setItem("mission-control-activities", JSON.stringify(activities));
    }
  }, [activities, mounted]);

  const filteredActivities = useMemo(() => {
    let filtered = activities;
    
    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(a => a.type === filterType);
    }
    
    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.description?.toLowerCase().includes(query) ||
          a.type.toLowerCase().includes(query) ||
          a.action.toLowerCase().includes(query) ||
          a.source?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [activities, searchQuery, filterType]);

  const getActivitiesForDate = (date: Date) => {
    return filteredActivities.filter((a) => {
      if (a.scheduledDate) {
        return isSameDay(new Date(a.scheduledDate), date);
      }
      return isSameDay(new Date(a.timestamp), date);
    });
  };

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
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
      recurrence: newActivity.recurrence || undefined,
    });
    setNewActivity({ type: "task", action: "created", title: "", description: "", scheduledDate: "", recurrence: "" });
    setShowForm(false);
  };

  const exportData = () => {
    const data = JSON.stringify(activities, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mission-control-${format(new Date(), "yyyy-MM-dd")}.json`;
    a.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          const existingIds = new Set(activities.map(a => a.id));
          const newItems = imported.filter((a: ActivityItem) => !existingIds.has(a.id));
          setActivities([...newItems, ...activities]);
        }
      } catch (err) {
        console.error("Import failed:", err);
      }
    };
    reader.readAsText(file);
  };

  const stats = {
    total: activities.length,
    today: activities.filter((a) => {
      const date = a.scheduledDate ? new Date(a.scheduledDate) : new Date(a.timestamp);
      return date.toDateString() === new Date().toDateString();
    }).length,
    crons: activities.filter((a) => a.type === "cron").length,
    planned: activities.filter((a) => a.type === "autonomous").length,
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
              <p className="text-gray-500 text-sm">Leo&apos;s Activity Hub — Everything I Do</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={exportData} className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-sm">
              <Download className="w-4 h-4" /> Export
            </button>
            <label className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-sm cursor-pointer">
              <Upload className="w-4 h-4" /> Import
              <input type="file" accept=".json" onChange={importData} className="hidden" />
            </label>
            <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition">
              <Plus className="w-5 h-5" /> Add
            </button>
          </div>
        </div>
      </header>

      {/* Search + Filter */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
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
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
        >
          <option value="all">All Types</option>
          <option value="task">Tasks</option>
          <option value="project">Projects</option>
          <option value="cron">Cron Jobs</option>
          <option value="autonomous">Autonomous</option>
          <option value="idea">Ideas</option>
          <option value="milestone">Milestones</option>
          <option value="note">Notes</option>
        </select>
      </div>

      {/* View Tabs */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="flex gap-2 p-1 bg-gray-900 rounded-lg w-fit">
          <button
            onClick={() => setView("feed")}
            className={clsx("flex items-center gap-2 px-4 py-2 rounded-md transition", view === "feed" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white")}
          >
            <List className="w-4 h-4" /> Feed
          </button>
          <button
            onClick={() => setView("calendar")}
            className={clsx("flex items-center gap-2 px-4 py-2 rounded-md transition", view === "calendar" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white")}
          >
            <Calendar className="w-4 h-4" /> Calendar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-5xl mx-auto mb-8 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-white" },
          { label: "Today", value: stats.today, color: "text-green-400" },
          { label: "Cron Jobs", value: stats.crons, color: "text-orange-400" },
          { label: "Planned", value: stats.planned, color: "text-cyan-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-500 text-sm">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="max-w-5xl mx-auto mb-8">
          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Type</label>
                <select value={newActivity.type} onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white">
                  {["task", "project", "idea", "note", "milestone", "cron", "autonomous"].map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Action</label>
                <select value={newActivity.action} onChange={(e) => setNewActivity({ ...newActivity, action: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white">
                  {["created", "completed", "updated", "scheduled", "planned", "running"].map((a) => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Schedule Date</label>
                <input type="date" value={newActivity.scheduledDate} onChange={(e) => setNewActivity({ ...newActivity, scheduledDate: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Recurrence</label>
                <select value={newActivity.recurrence} onChange={(e) => setNewActivity({ ...newActivity, recurrence: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white">
                  <option value="">None</option>
                  <option value="daily">Daily</option>
                  <option value="weekdays">Weekdays</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Title</label>
              <input type="text" value={newActivity.title} onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })} placeholder="What's happening?" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white" />
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Description</label>
              <textarea value={newActivity.description} onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })} placeholder="Details..." className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white h-20" />
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
          <h2 className="text-xl font-semibold text-gray-300 mb-4">
            {filterType === "all" ? "All Activities" : `${filterType.charAt(0).toUpperCase() + filterType.slice(1)}s`}
            {searchQuery && ` matching "${searchQuery}"`}
            <span className="text-gray-500 font-normal ml-2">({filteredActivities.length})</span>
          </h2>
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4" />
              <p>{searchQuery ? "No activities match your search." : "No activities yet."}</p>
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
                      {activity.recurrence && (
                        <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" /> {activity.recurrence}
                        </span>
                      )}
                      {activity.scheduledDate && (
                        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {format(new Date(activity.scheduledDate), "MMM d")}
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-300">{format(currentMonth, "MMMM yyyy")}</h2>
            <div className="flex gap-2">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => setCurrentMonth(new Date())} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition">Today</button>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="grid grid-cols-7 border-b border-gray-800">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className="min-h-[100px] p-2 border-b border-r border-gray-800/50 bg-gray-950/30" />;

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
                    <div className={clsx("text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full", isToday && "bg-purple-600 text-white")}>
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {dayActivities.slice(0, 3).map((a) => (
                        <div key={a.id} className="flex items-center gap-1">
                          <div className={clsx("w-2 h-2 rounded-full flex-shrink-0", typeDotColors[a.type] || typeDotColors.note)} />
                          <span className="text-xs text-gray-400 truncate">{a.title}</span>
                        </div>
                      ))}
                      {dayActivities.length > 3 && <span className="text-xs text-gray-500">+{dayActivities.length - 3} more</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedDate && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-300 mb-4">Activities for {format(selectedDate, "MMMM d, yyyy")}</h3>
              {getActivitiesForDate(selectedDate).length === 0 ? (
                <p className="text-gray-500">No activities on this day.</p>
              ) : (
                <div className="space-y-3">
                  {getActivitiesForDate(selectedDate).map((activity) => (
                    <div key={activity.id} className={clsx("flex items-start gap-4 p-4 rounded-xl border group", typeColors[activity.type] || typeColors.note)}>
                      <div className="flex-shrink-0 mt-0.5">{typeIcons[activity.type] || typeIcons.note}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs uppercase tracking-wide opacity-70">{actionVerbs[activity.action]} {activity.type}</span>
                          {activity.recurrence && <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded">{activity.recurrence}</span>}
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
        <p>Mission Control v1.2 • Built by Leo 🦁</p>
      </footer>
    </main>
  );
}
