import { Sidebar } from "@/components/Sidebar";
import { getAnalyticsData, getTaskProgress } from "@/lib/analytics-data";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AnalyticsPage() {
  const stats = await getAnalyticsData();
  const taskProgress = await getTaskProgress();

  return (
    <div className="min-h-screen bg-gray-900">
      <Sidebar />
      
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-4xl">🦁</span>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
              Agent Health Monitor
            </h1>
          </div>
          
        </div>

        {/* Status Banner */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div>
                <h2 className="text-lg font-semibold text-white">
                  🦁 Leo is {stats.isActive ? 'active' : 'idle'}
                </h2>
                <p className="text-gray-400 text-sm">
                  {stats.pendingTasks > 0 
                    ? `${stats.pendingTasks} task${stats.pendingTasks > 1 ? 's' : ''} pending`
                    : 'All tasks complete'}
                </p>
              </div>
            </div>
            <div className="text-right text-gray-400 text-sm">
              {stats.pendingTasks > 0 ? 'Processing...' : 'Waiting for next task'}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center">
            <div className="text-gray-400 text-sm uppercase tracking-wider mb-2">
              Tasks Completed
            </div>
            <div className="text-3xl font-bold text-cyan-400">
              {stats.tasksCompleted}
            </div>
            <div className="text-gray-500 text-sm mt-1">
              {stats.pendingTasks} remaining
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center">
            <div className="text-gray-400 text-sm uppercase tracking-wider mb-2">
              Total Work Time
            </div>
            <div className="text-3xl font-bold text-cyan-400">
              {stats.totalWorkTime}
            </div>
            <div className="text-gray-500 text-sm mt-1">
              {stats.totalSessions} sessions
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center">
            <div className="text-gray-400 text-sm uppercase tracking-wider mb-2">
              Cost Savings
            </div>
            <div className="text-3xl font-bold text-green-400">
              ${stats.costSavings}
            </div>
            <div className="text-gray-500 text-sm mt-1">
              $0 (local inference)
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center">
            <div className="text-gray-400 text-sm uppercase tracking-wider mb-2">
              Tool Calls
            </div>
            <div className="text-3xl font-bold text-cyan-400">
              {stats.toolCalls}
            </div>
            <div className="text-gray-500 text-sm mt-1">
              read {stats.reads} · write {stats.writes} · exec {stats.execs}
            </div>
          </div>
        </div>

        {/* Task Progress */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>📋</span> Task Progress
          </h3>
          
          <div className="space-y-3">
            {taskProgress.map((task) => (
              <div 
                key={task.id}
                className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className={task.status === 'done' ? 'text-green-500' : 'text-yellow-500'}>
                    {task.status === 'done' ? '✅' : '⏳'}
                  </span>
                  <span className="text-white">
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                    🦁 Leo
                  </span>
                  <span className="text-gray-500 text-sm">
                    {task.date}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    task.status === 'done' 
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {task.status === 'done' ? 'Done' : 'In Progress'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
