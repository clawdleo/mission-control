import { ProjectsGrid } from "@/components/ProjectsGrid";
import { SystemsStatus } from "@/components/SystemsStatus";
import { TasksKanban } from "@/components/TasksKanban";
import { Sidebar } from "@/components/Sidebar";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Sidebar />
      
      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white">
              Mission Control
            </h1>
            <p className="text-gray-400 mt-1">
              Executive command center
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>

        <div className="space-y-8">
          {/* Projects Section */}
          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              Projects
            </h2>
            <ProjectsGrid />
          </section>

          {/* Systems Section */}
          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              Systems
            </h2>
            <SystemsStatus />
          </section>

          {/* Tasks Section */}
          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              Tasks
            </h2>
            <TasksKanban />
          </section>
        </div>
      </div>
    </div>
  );
}
