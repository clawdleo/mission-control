import { getAllData } from "@/lib/data";

export async function TasksList() {
  const { tasks } = await getAllData();

  const priorityColors = {
    critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  const statusColors = {
    todo: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    blocked: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    done: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded capitalize ${
                    priorityColors[task.priority]
                  }`}
                >
                  {task.priority}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded capitalize ${
                    statusColors[task.status]
                  }`}
                >
                  {task.status.replace('-', ' ')}
                </span>
                {task.project && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {task.project}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {task.title}
              </h3>
              {task.deadline && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Due: {new Date(task.deadline).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
