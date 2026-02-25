import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

function parseCronToHuman(expr: string): string {
  const parts = expr.split(' ');
  if (parts.length < 5) return expr;
  
  const [min, hour] = parts;
  
  if (min.startsWith('*/')) {
    return `Every ${min.slice(2)} min`;
  }
  
  if (!min.includes('*') && !hour.includes('*')) {
    const h = parseInt(hour);
    const m = parseInt(min);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${displayHour}:${m.toString().padStart(2, '0')} ${ampm}`;
  }
  
  return expr;
}

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

export async function GET() {
  const events: any[] = [];
  
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
      
      const [min, , , , dow] = parts;
      
      // Skip frequent interval jobs
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
  
  events.sort((a, b) => a.time.localeCompare(b.time));
  
  return NextResponse.json({ events });
}
