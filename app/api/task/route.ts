import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, existsSync, readFileSync } from 'fs';

const TASKS_FILE = '/tmp/mission-control-tasks.json';

export async function POST(request: NextRequest) {
  try {
    const { task, priority } = await request.json();

    if (!task) {
      return NextResponse.json({ error: 'Task is required' }, { status: 400 });
    }

    // Load existing tasks
    let tasks: any[] = [];
    if (existsSync(TASKS_FILE)) {
      try {
        tasks = JSON.parse(readFileSync(TASKS_FILE, 'utf8'));
      } catch (e) {
        tasks = [];
      }
    }

    // Add new task
    const newTask = {
      id: Date.now().toString(),
      task,
      priority,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    tasks.push(newTask);

    // Save tasks
    writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));

    // Also write to a simple notification file that Leo checks
    const notificationFile = '/tmp/leo-task-notification.txt';
    const notification = `[${new Date().toISOString()}] NEW TASK (${priority}): ${task}\n`;
    const existingNotifications = existsSync(notificationFile) 
      ? readFileSync(notificationFile, 'utf8') 
      : '';
    writeFileSync(notificationFile, notification + existingNotifications);

    return NextResponse.json({ success: true, task: newTask });
  } catch (error) {
    console.error('Error saving task:', error);
    return NextResponse.json({ error: 'Failed to save task' }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!existsSync(TASKS_FILE)) {
      return NextResponse.json({ tasks: [] });
    }
    
    const tasks = JSON.parse(readFileSync(TASKS_FILE, 'utf8'));
    return NextResponse.json({ tasks });
  } catch (error) {
    return NextResponse.json({ tasks: [] });
  }
}
