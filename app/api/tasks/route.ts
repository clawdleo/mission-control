import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';

const USER_TASKS_FILE = '/tmp/mission-control-tasks.json';

export async function GET() {
  const tasks: any[] = [];

  // Load user-submitted tasks from Mission Control
  if (existsSync(USER_TASKS_FILE)) {
    try {
      const userTasks = JSON.parse(readFileSync(USER_TASKS_FILE, 'utf8'));
      for (const task of userTasks) {
        tasks.push({
          id: task.id,
          title: task.task,
          description: null,
          status: task.status === 'done' ? 'done' : 'backlog',
          project: null,
          priority: task.priority,
          createdAt: task.createdAt,
          isUserTask: true,
        });
      }
    } catch (e) {
      console.error('Error loading user tasks:', e);
    }
  }

  // Add system/recurring tasks
  const systemTasks = [
    {
      id: 'sys-1',
      title: 'Morning Briefing',
      description: 'Daily check-in and priorities review',
      status: 'recurring',
      project: 'Operations',
      priority: 'medium',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sys-2',
      title: 'Heartbeat Check',
      description: 'System health monitoring',
      status: 'recurring',
      project: 'Operations',
      priority: 'low',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sys-3',
      title: 'Create @escapethecubicle accounts',
      description: 'Instagram and TikTok accounts for carousel business',
      status: 'backlog',
      project: 'Carousel Business',
      priority: 'critical',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'sys-4',
      title: 'Design first carousel in Canva',
      description: 'Pick from 7 ready titles and create first post',
      status: 'backlog',
      project: 'Carousel Business',
      priority: 'high',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'sys-5',
      title: 'Mission Control Dashboard Rebuild',
      description: 'Complete overhaul with sidebar, analytics, ideas',
      status: 'done',
      project: 'Mission Control',
      priority: 'high',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'sys-6',
      title: 'Notion PARA Restructure',
      description: 'Organize workspace into Projects/Areas/Resources/Archives',
      status: 'done',
      project: 'Operations',
      priority: 'medium',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'sys-7',
      title: 'Weather Edge Position Analysis',
      description: 'Feb 24 settlements: +$1,201 paper',
      status: 'done',
      project: 'Trading',
      priority: 'high',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'sys-8',
      title: 'Trello Email System Deprecation',
      description: 'Removed work email integration',
      status: 'done',
      project: 'Operations',
      priority: 'low',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'sys-9',
      title: 'Build Ideas Dashboard',
      description: 'Reddit problems scraping and build trigger',
      status: 'in-progress',
      project: 'Mission Control',
      priority: 'high',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sys-10',
      title: 'Build Kanban Task Board',
      description: 'Trello-style task management',
      status: 'in-progress',
      project: 'Mission Control',
      priority: 'high',
      createdAt: new Date().toISOString(),
    },
  ];

  return NextResponse.json({ tasks: [...tasks, ...systemTasks] });
}
