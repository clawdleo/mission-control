'use client';

import { useState, useEffect } from 'react';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'recurring' | 'backlog' | 'in-progress' | 'review' | 'done';
  project?: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  createdAt: string;
  isUserTask?: boolean;
}

const columns = [
  { id: 'recurring', title: 'Recurring', color: 'bg-purple-500' },
  { id: 'backlog', title: 'Backlog', color: 'bg-gray-500' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-500' },
  { id: 'review', title: 'Review', color: 'bg-yellow-500' },
  { id: 'done', title: 'Done', color: 'bg-green-500' },
];

export function TasksKanban() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => {
        setTasks(data.tasks || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const tasksByColumn = columns.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => t.status === col.id);
    return acc;
  }, {} as Record<string, Task[]>);

  const stats = {
    thisWeek: tasks.filter(t => {
      const created = new Date(t.createdAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return created > weekAgo && t.status === 'done';
    }).length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    total: tasks.length,
    completion: tasks.length > 0 
      ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100)
      : 0,
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="text-gray-500 text-center py-8">Loading tasks...</div>;
  }

  return (
    <div>
      {/* Stats Bar */}
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-white">{stats.thisWeek}</span>
          <span className="text-sm text-gray-400">This week</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-blue-400">{stats.inProgress}</span>
          <span className="text-sm text-gray-400">In progress</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-white">{stats.total}</span>
          <span className="text-sm text-gray-400">Total</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-green-400">{stats.completion}%</span>
          <span className="text-sm text-gray-400">Completion</span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(column => (
          <div key={column.id} className="flex-shrink-0 w-72">
            {/* Column Header */}
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${column.color}`} />
              <span className="text-sm font-medium text-white">{column.title}</span>
              <span className="text-xs text-gray-500">{tasksByColumn[column.id]?.length || 0}</span>
              <button className="ml-auto text-gray-500 hover:text-white text-lg">+</button>
            </div>

            {/* Tasks */}
            <div className="space-y-2 min-h-[200px]">
              {tasksByColumn[column.id]?.length === 0 ? (
                <div className="text-xs text-gray-600 italic py-4 text-center">
                  No tasks
                </div>
              ) : (
                tasksByColumn[column.id]?.map(task => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border ${
                      column.id === 'in-progress' 
                        ? 'bg-blue-900/30 border-blue-700' 
                        : column.id === 'done'
                        ? 'bg-green-900/20 border-green-800'
                        : 'bg-gray-800 border-gray-700'
                    } hover:border-gray-600 transition cursor-pointer`}
                  >
                    {/* Priority dot */}
                    {task.priority && (
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} mb-2`} />
                    )}
                    
                    {/* Title */}
                    <h4 className="text-sm font-medium text-white mb-1 line-clamp-2">
                      {task.title}
                    </h4>
                    
                    {/* Description */}
                    {task.description && (
                      <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-2">
                      {task.project && (
                        <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded">
                          {task.project}
                        </span>
                      )}
                      {task.isUserTask && (
                        <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                          📥 Inbox
                        </span>
                      )}
                      <span className="text-xs text-gray-500 ml-auto">
                        {getTimeAgo(task.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
