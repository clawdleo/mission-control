import { getAllData } from "@/lib/data";

export async function ProjectsGrid() {
  const { projects } = await getAllData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <div
          key={project.id}
          className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-white">
                {project.name}
              </h3>
              <p className="text-sm text-gray-400 capitalize">
                {project.type}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Health Indicator */}
              <div
                className={`w-2 h-2 rounded-full ${
                  project.health === 'healthy'
                    ? 'bg-green-500'
                    : project.health === 'warning'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
              />
              {/* Status Badge */}
              <span
                className={`px-2 py-1 text-xs font-medium rounded ${
                  project.status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : project.status === 'paused'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-300'
                    : project.status === 'maintenance'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : project.status === 'disabled'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {project.status}
              </span>
            </div>
          </div>

          {/* Metrics */}
          <div className="space-y-2 mb-4">
            {project.metrics.revenue !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Balance</span>
                <span className="font-medium text-white">
                  ${project.metrics.revenue.toFixed(2)}
                </span>
              </div>
            )}
            {project.metrics.pnl !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">P&L</span>
                <span
                  className={`font-medium ${
                    project.metrics.pnl >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {project.metrics.pnl >= 0 ? '+' : ''}${project.metrics.pnl.toFixed(2)}
                </span>
              </div>
            )}
            {project.metrics.progress !== undefined && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Progress</span>
                  <span className="font-medium text-white">
                    {project.metrics.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${project.metrics.progress}%` }}
                  />
                </div>
              </div>
            )}
            {project.metrics.uptime !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Trades</span>
                <span className="font-medium text-white">
                  {project.metrics.uptime}
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          {project.nextMilestone && (
            <div className="pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-400">
                Next: {project.nextMilestone}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
