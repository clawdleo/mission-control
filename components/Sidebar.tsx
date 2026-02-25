'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const [showTaskModal, setShowTaskModal] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/', icon: '🏠' },
    { name: 'Schedule', href: '/schedule', icon: '📅' },
    { name: 'Team', href: '/team', icon: '👥' },
    { name: 'Ideas', href: '/ideas', icon: '💡' },
    { name: 'Analytics', href: '/analytics', icon: '📊' },
  ];

  return (
    <>
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Logo/Avatar */}
        <div className="p-6 border-b border-gray-800">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl">
            🦁
          </div>
          <div className="text-center mt-3">
            <h2 className="text-white font-semibold">Leo</h2>
            <div className="flex items-center justify-center gap-1 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-400">Active</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  pathname === item.href
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <div className="text-xs text-gray-500 uppercase tracking-wider px-4 mb-2">
              Quick Access
            </div>
            <div className="space-y-1">
              <a href="https://www.notion.so" target="_blank" className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition">
                <span>📓</span>
                <span className="text-sm">Notion</span>
              </a>
              <a href="https://github.com/clawdleo" target="_blank" className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition">
                <span>🐙</span>
                <span className="text-sm">GitHub</span>
              </a>
              <a href="https://dashboard.render.com" target="_blank" className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition">
                <span>🚀</span>
                <span className="text-sm">Render</span>
              </a>
            </div>
          </div>
        </nav>

        {/* New Task Button */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => setShowTaskModal(true)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <span className="text-lg">+</span>
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal onClose={() => setShowTaskModal(false)} />
      )}
    </>
  );
}

function TaskModal({ onClose }: { onClose: () => void }) {
  const [task, setTask] = useState('');
  const [priority, setPriority] = useState('medium');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;

    setSending(true);
    try {
      const res = await fetch('/api/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, priority }),
      });
      
      if (res.ok) {
        setSent(true);
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (e) {
      console.error('Failed to send task:', e);
    }
    setSending(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">New Task for Leo</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        {sent ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-green-400">Task sent to Leo!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">
                What do you need?
              </label>
              <textarea
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Describe the task..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                rows={4}
                autoFocus
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">
                Priority
              </label>
              <div className="flex gap-2">
                {['low', 'medium', 'high', 'critical'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-3 py-1 rounded text-sm capitalize transition ${
                      priority === p
                        ? p === 'critical' ? 'bg-red-500 text-white'
                        : p === 'high' ? 'bg-orange-500 text-white'
                        : p === 'medium' ? 'bg-yellow-500 text-black'
                        : 'bg-gray-500 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={sending || !task.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition"
            >
              {sending ? 'Sending...' : 'Send to Leo'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
