import { ProjectsGrid } from "@/components/ProjectsGrid";
import { SystemsStatus } from "@/components/SystemsStatus";
import { TasksList } from "@/components/TasksList";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Mission Control
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Executive command center
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Projects Section */}
          <section>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Projects
            </h2>
            <ProjectsGrid />
          </section>

          {/* Systems Section */}
          <section>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Systems
            </h2>
            <SystemsStatus />
          </section>

          {/* Tasks Section */}
          <section>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Tasks
            </h2>
            <TasksList />
          </section>
        </div>
      </main>
    </div>
  );
}
