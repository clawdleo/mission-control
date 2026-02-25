import { ScheduleCalendar } from "@/components/ScheduleCalendar";
import { AlwaysRunning } from "@/components/AlwaysRunning";
import { NextUp } from "@/components/NextUp";
import { Sidebar } from "@/components/Sidebar";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Sidebar />
      
      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white">
              Scheduled Tasks
            </h1>
            <p className="text-gray-400 mt-1">
              Leo's automated routines
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Always Running */}
          <AlwaysRunning />

          {/* Weekly Calendar */}
          <ScheduleCalendar />

          {/* Next Up */}
          <NextUp />
        </div>
      </div>
    </div>
  );
}
