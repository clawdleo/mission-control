import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const IDEAS_FILE = '/tmp/mission-control-ideas.json';

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
    
    // Mark as removed instead of deleting (for history)
    const updatedIdeas = ideas.map((i: any) => 
      i.id === ideaId ? { ...i, status: 'removed' } : i
    );
    
    saveIdeas(updatedIdeas);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing idea:', error);
    return NextResponse.json({ error: 'Failed to remove idea' }, { status: 500 });
  }
}
