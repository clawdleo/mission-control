'use client';

import { useState, useEffect } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarEvent {
  id: string;
  name: string;
  time: string;
  color: string;
  day: number;
}

export function ScheduleCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [viewMode, setViewMode] = useState<'week' | 'today'>('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/schedule')
      .then(res => res.json())
      .then(data => {
        setEvents(data.events || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const today = new Date().getDay();

  // Group events by day
  const eventsByDay: Record<number, CalendarEvent[]> = {};
  for (let i = 0; i < 7; i++) {
    eventsByDay[i] = events.filter(e => e.day === i);
  }

  const daysToShow = viewMode === 'today' ? [today] : [0, 1, 2, 3, 4, 5, 6];

  if (loading) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center text-gray-500">
        Loading schedule...
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-white">
          {viewMode === 'today' ? "Today's Schedule" : 'Weekly Schedule'}
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 text-sm rounded transition ${
              viewMode === 'week' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            Week
          </button>
          <button 
            onClick={() => setViewMode('today')}
            className={`px-3 py-1 text-sm rounded transition ${
              viewMode === 'today' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            Today
          </button>
        </div>
      </div>

      <div className={`grid gap-2 ${viewMode === 'today' ? 'grid-cols-1' : 'grid-cols-7'}`}>
        {daysToShow.map((dayIndex) => (
          <div key={dayIndex} className={viewMode === 'today' ? '' : 'min-h-[200px]'}>
            {/* Day Header */}
            <div className={`text-sm font-medium mb-2 ${
              dayIndex === today 
                ? 'text-blue-400' 
                : 'text-gray-400'
            }`}>
              {DAYS[dayIndex]} {dayIndex === today && '(Today)'}
            </div>

            {/* Events */}
            <div className="space-y-1">
              {eventsByDay[dayIndex]?.map((event) => (
                <div
                  key={event.id}
                  className={`${event.color} text-white p-2 rounded text-xs`}
                >
                  <div className="font-medium truncate">{event.name}</div>
                  <div className="opacity-80">{event.time}</div>
                </div>
              ))}
              {eventsByDay[dayIndex]?.length === 0 && (
                <div className="text-xs text-gray-600 italic p-2">
                  No scheduled tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
