import { getAllData } from "@/lib/data";

export async function SystemsStatus() {
  const { systems } = await getAllData();

  return (
    <div className="bg-gray-800 bg-gray-800 border border-gray-700 border-gray-700 rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-900 bg-gray-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 text-gray-400 uppercase tracking-wider">
              System
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 text-gray-400 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 text-gray-400 uppercase tracking-wider">
              Health
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 text-gray-400 uppercase tracking-wider">
              Last Check
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {systems.map((system) => (
            <tr key={system.id} className="hover:bg-gray-900 dark:hover:bg-gray-700 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-white">
                {system.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-gray-400 capitalize">
                {system.type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded capitalize ${
                    system.status === 'running'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : system.status === 'stopped'
                      ? 'bg-gray-100 text-gray-800 bg-gray-700 dark:text-gray-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}
                >
                  {system.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      system.health === 'healthy'
                        ? 'bg-green-500'
                        : system.health === 'degraded'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <span className="text-sm text-gray-900 text-white capitalize">
                    {system.health}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-gray-400">
                {new Date(system.lastCheck).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
