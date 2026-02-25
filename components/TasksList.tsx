import { getAllData } from "@/lib/data";
import { getSubmittedTasks } from "@/lib/analytics-data";

export async function TasksList() {
  const { tasks } = await getAllData();
  const submittedTasks = await getSubmittedTasks();

  const priorityColors: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400',
    high: 'bg-orange-500/20 text-orange-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    low: 'bg-gray-500/20 text-gray-400',
  };

  const statusColors: Record<string, string> = {
    todo: 'bg-gray-500/20 text-gray-400',
    'in-progress': 'bg-blue-500/20 text-blue-400',
    blocked: 'bg-red-500/20 text-red-400',
    done: 'bg-green-500/20 text-green-400',
    pending: 'bg-yellow-500/20 text-yellow-400',
  };

  // Combine system tasks and user-submitted tasks
  const allTasks = [
    ...submittedTasks.map((t: any) => ({
      id: t.id,
      title: t.task,
      priority: t.priority,
      status: t.status,
      project: 'user-submitted',
      deadline: t.createdAt,
      isUserTask: true,
    })),
    ...tasks,
  ];

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg divide-y divide-gray-700">
      {allTasks.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No tasks. Click "+ New Task" to add one!
        </div>
      ) : (
        allTasks.map((task: any) => (
          <div
            key={task.id}
            className="p-4 hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded capitalize ${
                      priorityColors[task.priority] || priorityColors.medium
                    }`}
                  >
                    {task.priority}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded capitalize ${
                      statusColors[task.status] || statusColors.todo
                    }`}
                  >
                    {task.status?.replace('-', ' ') || 'pending'}
                  </span>
                  {task.isUserTask && (
                    <span className="px-2 py-1 text-xs font-medium rounded bg-purple-500/20 text-purple-400">
                      📥 Inbox
                    </span>
                  )}
                  {task.project && !task.isUserTask && (
                    <span className="text-xs text-gray-500">
                      {task.project}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-medium text-white">
                  {task.title}
                </h3>
                {task.deadline && (
                  <p className="text-xs text-gray-400 mt-1">
                    {task.isUserTask ? 'Submitted: ' : 'Due: '}
                    {new Date(task.deadline).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
