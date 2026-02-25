import { getScheduledTasks } from "@/lib/schedule-data";

export async function AlwaysRunning() {
  const tasks = await getScheduledTasks();
  const alwaysRunning = tasks.filter(t => t.type === 'always-running');

  if (alwaysRunning.length === 0) return null;

  return (
    <div className="bg-gray-800 bg-gray-800 border border-gray-700 border-gray-700 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-yellow-500">⚡</span>
        <h2 className="text-lg font-medium text-gray-900 text-white">
          Always Running
        </h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {alwaysRunning.map((task) => (
          <div
            key={task.id}
            className={`${task.color} text-white px-3 py-2 rounded-lg text-sm`}
          >
            <span className="font-medium">{task.name}</span>
            <span className="ml-2 opacity-80">• {task.interval}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
