import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'fs';

const IDEAS_FILE = '/tmp/mission-control-ideas.json';
const BUILD_QUEUE_FILE = '/tmp/leo-build-queue.txt';

function getIdeas() {
  if (!existsSync(IDEAS_FILE)) {
    return [];
  }
  try {
    return JSON.parse(readFileSync(IDEAS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveIdeas(ideas: any[]) {
  writeFileSync(IDEAS_FILE, JSON.stringify(ideas, null, 2));
}

export async function POST(request: Request) {
  try {
    const { ideaId } = await request.json();
    
    const ideas = getIdeas();
    const idea = ideas.find((i: any) => i.id === ideaId);
    
    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }
    
    // Update status to building
    const updatedIdeas = ideas.map((i: any) => 
      i.id === ideaId ? { ...i, status: 'building' } : i
    );
    saveIdeas(updatedIdeas);
    
    // Add to build queue for Leo to process
    const buildTask = {
      ideaId: idea.id,
      title: idea.title,
      description: idea.description,
      source: idea.source,
      requestedAt: new Date().toISOString(),
    };
    
    const queueEntry = `[${new Date().toISOString()}] BUILD REQUEST: ${idea.title}\nDescription: ${idea.description}\nSource: ${idea.source}\nIdea ID: ${idea.id}\n---\n`;
    
    appendFileSync(BUILD_QUEUE_FILE, queueEntry);
    
    // Also write to a JSON file for structured processing
    const buildQueueJson = '/tmp/leo-build-queue.json';
    let queue: any[] = [];
    if (existsSync(buildQueueJson)) {
      try {
        queue = JSON.parse(readFileSync(buildQueueJson, 'utf8'));
      } catch {}
    }
    queue.push(buildTask);
    writeFileSync(buildQueueJson, JSON.stringify(queue, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Build request queued for Leo',
      idea: { ...idea, status: 'building' }
    });
  } catch (error) {
    console.error('Error processing build request:', error);
    return NextResponse.json({ error: 'Failed to queue build' }, { status: 500 });
  }
}
