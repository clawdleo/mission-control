import { getNextUpTasks } from "@/lib/schedule-data";

export async function NextUp() {
  const tasks = await getNextUpTasks();

  return (
    <div className="bg-gray-800 bg-gray-800 border border-gray-700 border-gray-700 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <span>📋</span>
        <h2 className="text-lg font-medium text-gray-900 text-white">
          Next Up
        </h2>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between py-2 border-b border-gray-700 border-gray-700 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${task.color}`} />
              <span className="text-sm text-gray-900 text-white">
                {task.name}
              </span>
            </div>
            <span className="text-sm text-gray-500 text-gray-400">
              {task.timeUntil}
            </span>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-sm text-gray-500 text-gray-400 italic">
            No scheduled tasks
          </div>
        )}
      </div>
    </div>
  );
}
