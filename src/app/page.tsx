"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ActivityFeed } from "@/components/features/ActivityFeed";
import { CalendarView } from "@/components/features/CalendarView";
import { GlobalSearch } from "@/components/features/GlobalSearch";
import { Dashboard } from "@/components/features/Dashboard";

type View = "dashboard" | "activity" | "calendar" | "search";

export default function Home() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) setCurrentView("search");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onSearch={handleSearch} />
        <main className="flex-1 overflow-auto p-6">
          {currentView === "dashboard" && <Dashboard />}
          {currentView === "activity" && <ActivityFeed />}
          {currentView === "calendar" && <CalendarView />}
          {currentView === "search" && <GlobalSearch initialQuery={searchQuery} />}
        </main>
      </div>
    </div>
  );
}
