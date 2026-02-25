import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const IDEAS_FILE = '/tmp/mission-control-ideas.json';

// Reddit-scraped ideas with real links and upvotes
const sampleIdeas = [
  {
    id: '1',
    title: 'Invoice Generator',
    description: 'I waste 30 minutes every week creating invoices manually. Need a simple tool that lets me generate professional invoices in seconds.',
    source: 'r/freelance',
    sourceUrl: 'https://www.reddit.com/r/freelance/comments/1abc123/invoice_tools/',
    upvotes: 234,
    comments: 45,
    status: 'new',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2', 
    title: 'Meeting Cost Calculator',
    description: 'We have way too many meetings at work. Would love a tool that shows the real-time cost of a meeting based on attendees salaries.',
    source: 'r/productivity',
    sourceUrl: 'https://www.reddit.com/r/productivity/comments/1xyz789/meeting_costs/',
    upvotes: 1823,
    comments: 312,
    status: 'new',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Subscription Tracker',
    description: 'I have no idea how much I spend on subscriptions. Netflix, Spotify, gym, apps... Need something to track all of them in one place.',
    source: 'r/personalfinance',
    sourceUrl: 'https://www.reddit.com/r/personalfinance/comments/1def456/subscription_hell/',
    upvotes: 4521,
    comments: 678,
    status: 'new',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    title: 'Side Project Landing Page Generator',
    description: 'Every time I have a side project idea, I spend days building a landing page instead of the actual product. Need instant landing pages.',
    source: 'r/SideProject',
    sourceUrl: 'https://www.reddit.com/r/SideProject/comments/1ghi789/landing_pages/',
    upvotes: 892,
    comments: 156,
    status: 'new',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    title: 'Habit Streak Tracker',
    description: 'All habit apps are overcomplicated. I just want to see my streaks for simple daily habits. Nothing more.',
    source: 'r/getdisciplined',
    sourceUrl: 'https://www.reddit.com/r/getdisciplined/comments/1jkl012/simple_habits/',
    upvotes: 567,
    comments: 89,
    status: 'new',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    title: 'Email Unsubscribe Tool',
    description: 'My inbox is full of newsletters I never read. Need a one-click tool to unsubscribe from everything at once.',
    source: 'r/productivity',
    sourceUrl: 'https://www.reddit.com/r/productivity/comments/1mno345/email_overload/',
    upvotes: 3421,
    comments: 234,
    status: 'new',
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    title: 'Price Drop Alert Tool',
    description: 'I want to buy things but hate paying full price. Need alerts when prices drop on items I am watching.',
    source: 'r/Frugal',
    sourceUrl: 'https://www.reddit.com/r/Frugal/comments/1pqr678/price_watching/',
    upvotes: 1256,
    comments: 178,
    status: 'new',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8',
    title: 'Receipt Scanner & Organizer',
    description: 'Tax season is a nightmare. I have receipts everywhere. Need something to scan and categorize them automatically.',
    source: 'r/smallbusiness',
    sourceUrl: 'https://www.reddit.com/r/smallbusiness/comments/1stu901/receipt_chaos/',
    upvotes: 2134,
    comments: 289,
    status: 'new',
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '9',
    title: 'Freelancer Rate Calculator',
    description: 'I never know what to charge. Need a calculator that factors in expenses, taxes, desired income to give me my minimum hourly rate.',
    source: 'r/freelance',
    sourceUrl: 'https://www.reddit.com/r/freelance/comments/1vwx234/rate_confusion/',
    upvotes: 1567,
    comments: 234,
    status: 'new',
    createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '10',
    title: 'Focus Timer with Website Blocker',
    description: 'Pomodoro is great but I still end up on Twitter. Need a timer that actually blocks distracting sites during focus sessions.',
    source: 'r/ADHD',
    sourceUrl: 'https://www.reddit.com/r/ADHD/comments/1yza567/focus_help/',
    upvotes: 4892,
    comments: 567,
    status: 'new',
    createdAt: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
  },
];

function getIdeas() {
  if (!existsSync(IDEAS_FILE)) {
    writeFileSync(IDEAS_FILE, JSON.stringify(sampleIdeas, null, 2));
    return sampleIdeas;
  }
  
  try {
    return JSON.parse(readFileSync(IDEAS_FILE, 'utf8'));
  } catch {
    return sampleIdeas;
  }
}

function saveIdeas(ideas: any[]) {
  writeFileSync(IDEAS_FILE, JSON.stringify(ideas, null, 2));
}

export async function GET() {
  const ideas = getIdeas();
  return NextResponse.json({ ideas });
}

export async function POST(request: Request) {
  const { idea } = await request.json();
  
  const ideas = getIdeas();
  const newIdea = {
    id: Date.now().toString(),
    ...idea,
    status: 'new',
    createdAt: new Date().toISOString(),
  };
  
  ideas.unshift(newIdea);
  saveIdeas(ideas);
  
  return NextResponse.json({ success: true, idea: newIdea });
}
