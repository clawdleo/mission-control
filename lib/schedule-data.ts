import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ScheduledTask {
  id: string;
  name: string;
  schedule: string;
  nextRun: Date;
  lastRun?: Date;
  status: 'enabled' | 'disabled';
  color: string;
  type: 'recurring' | 'always-running';
  interval?: string;
}

// Color palette for tasks
const colors = [
  'bg-blue-500',
  'bg-green-500', 
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-red-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-cyan-500',
];

// Parse cron expression to human readable
function parseCronToHuman(expr: string): string {
  const parts = expr.split(' ');
  if (parts.length < 5) return expr;
  
  const [min, hour, day, month, dow] = parts;
  
  // Every X minutes
  if (min.startsWith('*/')) {
    return `Every ${min.slice(2)} min`;
  }
  
  // Specific time
  if (!min.includes('*') && !hour.includes('*')) {
    const h = parseInt(hour);
    const m = parseInt(min);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${displayHour}:${m.toString().padStart(2, '0')} ${ampm}`;
  }
  
  return expr;
}

// Get day of week from cron (0=Sun, 1=Mon, etc.)
function getCronDays(dow: string): number[] {
  if (dow === '*') return [0, 1, 2, 3, 4, 5, 6];
  if (dow.includes('-')) {
    const [start, end] = dow.split('-').map(Number);
    const days = [];
    for (let i = start; i <= end; i++) days.push(i);
    return days;
  }
  if (dow.includes(',')) {
    return dow.split(',').map(Number);
  }
  return [parseInt(dow)];
}

export async function getScheduledTasks(): Promise<ScheduledTask[]> {
  const tasks: ScheduledTask[] = [];
  
  try {
    const { stdout } = await execAsync('openclaw cron list --json 2>/dev/null');
    const cronsData = JSON.parse(stdout);
    const crons = Array.isArray(cronsData) ? cronsData : (cronsData.jobs || []);
    
    let colorIndex = 0;
    
    for (const cron of crons) {
      if (!cron.enabled) continue;
      
      const expr = cron.schedule?.expr || '';
      const parts = expr.split(' ');
      
      // Determine if it's "always running" (frequent intervals)
      const isAlwaysRunning = parts[0]?.startsWith('*/') && parseInt(parts[0].slice(2)) <= 30;
      
      tasks.push({
        id: cron.id,
        name: cron.name,
        schedule: expr,
        nextRun: new Date(Date.now() + (cron.state?.nextRunMs || 0)),
        lastRun: cron.state?.lastRunAtMs ? new Date(cron.state.lastRunAtMs) : undefined,
        status: cron.enabled ? 'enabled' : 'disabled',
        color: colors[colorIndex % colors.length],
        type: isAlwaysRunning ? 'always-running' : 'recurring',
        interval: isAlwaysRunning ? parseCronToHuman(expr) : undefined,
      });
      
      colorIndex++;
    }
  } catch (e) {
    console.error('Error getting crons:', e);
  }
  
  return tasks;
}

export interface CalendarEvent {
  id: string;
  name: string;
  time: string;
  color: string;
  day: number; // 0=Sun, 6=Sat
}

export async function getWeeklyCalendar(): Promise<CalendarEvent[]> {
  const events: CalendarEvent[] = [];
  
  try {
    const { stdout } = await execAsync('openclaw cron list --json 2>/dev/null');
    const cronsData = JSON.parse(stdout);
    const crons = Array.isArray(cronsData) ? cronsData : (cronsData.jobs || []);
    
    let colorIndex = 0;
    
    for (const cron of crons) {
      if (!cron.enabled) continue;
      
      const expr = cron.schedule?.expr || '';
      const parts = expr.split(' ');
      if (parts.length < 5) continue;
      
      const [min, hour, , , dow] = parts;
      
      // Skip frequent interval jobs (they go in "always running")
      if (min.startsWith('*/') && parseInt(min.slice(2)) <= 30) continue;
      
      const days = getCronDays(dow);
      const time = parseCronToHuman(expr);
      const color = colors[colorIndex % colors.length];
      
      for (const day of days) {
        events.push({
          id: `${cron.id}-${day}`,
          name: cron.name,
          time,
          color,
          day,
        });
      }
      
      colorIndex++;
    }
  } catch (e) {
    console.error('Error building calendar:', e);
  }
  
  // Sort by time
  events.sort((a, b) => a.time.localeCompare(b.time));
  
  return events;
}

export interface NextUpTask {
  id: string;
  name: string;
  timeUntil: string;
  color: string;
}

export async function getNextUpTasks(): Promise<NextUpTask[]> {
  const tasks: NextUpTask[] = [];
  
  try {
    const { stdout } = await execAsync('openclaw cron list --json 2>/dev/null');
    const cronsData = JSON.parse(stdout);
    const crons = Array.isArray(cronsData) ? cronsData : (cronsData.jobs || []);
    
    const now = Date.now();
    let colorIndex = 0;
    
    for (const cron of crons) {
      if (!cron.enabled) continue;
      
      // Calculate next run based on schedule info
      let nextRunMs = 0;
      
      // Use the "next" field if available from cron list
      if (cron.state?.nextRunMs) {
        nextRunMs = cron.state.nextRunMs;
      } else {
        // Estimate based on schedule
        continue;
      }
      
      const msUntil = nextRunMs;
      let timeUntil: string;
      
      if (msUntil < 60000) {
        timeUntil = `In ${Math.round(msUntil / 1000)} sec`;
      } else if (msUntil < 3600000) {
        timeUntil = `In ${Math.round(msUntil / 60000)} min`;
      } else if (msUntil < 86400000) {
        timeUntil = `In ${Math.round(msUntil / 3600000)} hours`;
      } else {
        timeUntil = `In ${Math.round(msUntil / 86400000)} days`;
      }
      
      tasks.push({
        id: cron.id,
        name: cron.name,
        timeUntil,
        color: colors[colorIndex % colors.length],
      });
      
      colorIndex++;
    }
    
    // Sort by next run time
    tasks.sort((a, b) => {
      const aMs = parseTimeUntil(a.timeUntil);
      const bMs = parseTimeUntil(b.timeUntil);
      return aMs - bMs;
    });
    
  } catch (e) {
    console.error('Error getting next up:', e);
  }
  
  return tasks.slice(0, 8);
}

function parseTimeUntil(str: string): number {
  const match = str.match(/In (\d+) (\w+)/);
  if (!match) return Infinity;
  const [, num, unit] = match;
  const n = parseInt(num);
  switch (unit) {
    case 'sec': return n * 1000;
    case 'min': return n * 60000;
    case 'hours': return n * 3600000;
    case 'days': return n * 86400000;
    default: return Infinity;
  }
}
