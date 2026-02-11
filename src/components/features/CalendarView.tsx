"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Clock,
  Trello,
  RefreshCw,
} from "lucide-react";
import { clsx } from "clsx";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"week" | "day">("week");

  // Get week start (Sunday)
  const weekStart = useMemo(() => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - date.getDay());
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  }, [currentDate]);

  const tasks = useQuery(api.tasks.getForWeek, { weekStart });

  // Generate week days
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      return date;
    });
  }, [weekStart]);

  const navigate = (direction: number) => {
    const newDate = new Date(currentDate);
    if (view === "week") {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else {
      newDate.setDate(newDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => setCurrentDate(new Date());

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Group tasks by day
  const tasksByDay = useMemo(() => {
    const grouped: Record<string, typeof tasks> = {};
    tasks?.forEach((task) => {
      const date = new Date(task.scheduledFor).toDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(task);
    });
    return grouped;
  }, [tasks]);

  const getTasksForDay = (date: Date) => {
    return tasksByDay[date.toDateString()] || [];
  };

  const formatMonthYear = () => {
    return currentDate.toLocaleDateString("en-US", { 
      month: "long", 
      year: "numeric" 
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Calendar Header */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary-400" />
              {formatMonthYear()}
            </h2>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-400" />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1.5 rounded-lg bg-primary-500/20 text-primary-400 text-sm font-medium hover:bg-primary-500/30 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => navigate(1)}
                className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex bg-slate-800/50 rounded-lg p-1">
              <button
                onClick={() => setView("week")}
                className={clsx(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  view === "week" ? "bg-primary-500 text-white" : "text-slate-400 hover:text-white"
                )}
              >
                Week
              </button>
              <button
                onClick={() => setView("day")}
                className={clsx(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  view === "day" ? "bg-primary-500 text-white" : "text-slate-400 hover:text-white"
                )}
              >
                Day
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Week View */}
      {view === "week" && (
        <div className="glass rounded-2xl overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-slate-700/50">
            {weekDays.map((date, i) => (
              <div
                key={i}
                className={clsx(
                  "p-4 text-center border-r border-slate-700/50 last:border-r-0",
                  isToday(date) && "bg-primary-500/10"
                )}
              >
                <div className="text-xs text-slate-500 uppercase">{DAYS[i]}</div>
                <div className={clsx(
                  "text-2xl font-bold mt-1",
                  isToday(date) ? "text-primary-400" : "text-white"
                )}>
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Day Content */}
          <div className="grid grid-cols-7 min-h-[400px]">
            {weekDays.map((date, i) => {
              const dayTasks = getTasksForDay(date);
              
              return (
                <div
                  key={i}
                  className={clsx(
                    "p-2 border-r border-slate-700/50 last:border-r-0",
                    isToday(date) && "bg-primary-500/5"
                  )}
                >
                  <div className="space-y-2">
                    {dayTasks.map((task) => (
                      <TaskCard key={task._id} task={task} compact />
                    ))}
                    {dayTasks.length === 0 && (
                      <div className="text-center py-8 text-slate-600 text-sm">
                        No tasks
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day View */}
      {view === "day" && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-700/50">
            <h3 className="text-lg font-semibold text-white">
              {currentDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric"
              })}
            </h3>
          </div>
          
          <div className="divide-y divide-slate-700/50 max-h-[600px] overflow-auto">
            {HOURS.map((hour) => {
              const hourTasks = getTasksForDay(currentDate).filter((task) => {
                const taskHour = new Date(task.scheduledFor).getHours();
                return taskHour === hour;
              });

              return (
                <div key={hour} className="flex">
                  <div className="w-20 p-3 text-sm text-slate-500 border-r border-slate-700/50">
                    {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                  </div>
                  <div className="flex-1 p-2 min-h-[60px]">
                    <div className="space-y-1">
                      {hourTasks.map((task) => (
                        <TaskCard key={task._id} task={task} />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Task Sources Legend */}
      <div className="glass rounded-2xl p-4">
        <h3 className="text-sm font-medium text-white mb-3">Task Sources</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-slate-400">Trello</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm text-slate-400">Cron Jobs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-sm text-slate-400">Manual</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TaskCardProps {
  task: any;
  compact?: boolean;
}

function TaskCard({ task, compact }: TaskCardProps) {
  const sourceColors = {
    trello: "border-l-green-500 bg-green-500/10",
    cron: "border-l-blue-500 bg-blue-500/10",
    manual: "border-l-purple-500 bg-purple-500/10",
  };

  const priorityColors = {
    high: "text-red-400",
    medium: "text-yellow-400",
    low: "text-green-400",
  };

  return (
    <div
      className={clsx(
        "rounded-lg border-l-2 p-2 transition-all hover:scale-[1.02]",
        sourceColors[task.source as keyof typeof sourceColors] || sourceColors.manual,
        task.completed && "opacity-50"
      )}
    >
      <div className="flex items-start gap-2">
        {task.source === "trello" && <Trello className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />}
        {task.source === "cron" && <RefreshCw className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />}
        
        <div className="flex-1 min-w-0">
          <p className={clsx(
            "text-sm font-medium truncate",
            task.completed ? "text-slate-500 line-through" : "text-white"
          )}>
            {task.title}
          </p>
          
          {!compact && task.description && (
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(task.scheduledFor)}
            </span>
            {task.priority && (
              <span className={clsx(
                "text-xs",
                priorityColors[task.priority as keyof typeof priorityColors]
              )}>
                {task.priority}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
