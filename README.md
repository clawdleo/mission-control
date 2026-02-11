# Mission Control 🚀

Leo's real-time command center dashboard built with Next.js 14 and Convex.

## Features

### 📊 Dashboard
- Real-time activity stats (24h)
- Success rate monitoring
- Upcoming tasks preview
- Category breakdown

### 📋 Activity Feed
- Full activity log with filtering
- Filter by category (email, trello, calendar, memory, code)
- Filter by status (success, pending, failed)
- Filter by date range
- Grouped by date with timeline view

### 📅 Calendar View
- Weekly calendar view
- Day view with hourly breakdown
- Tasks from Trello & cron jobs
- Priority color coding
- Source indicators

### 🔍 Global Search
- Full-text search across all indexed content
- Filter by document type
- Highlighted search results
- Quick search suggestions
- Recent memory files

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Convex (real-time)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React

## Setup

### 1. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Set up Convex
\`\`\`bash
npx convex dev
\`\`\`
This will prompt you to create a Convex project and set up your `.env.local` file.

### 3. Run development server
\`\`\`bash
npm run dev
\`\`\`

## API Endpoints

Mission Control provides HTTP endpoints for Leo to log activities:

### POST /api/log
Log an activity:
\`\`\`json
{
  "action": "Sent email to boss",
  "details": "Weekly report summary",
  "category": "email",
  "status": "success",
  "metadata": {
    "source": "gmail",
    "tags": ["weekly-report"]
  }
}
\`\`\`

### POST /api/sync-tasks
Sync tasks from Trello/cron:
\`\`\`json
{
  "source": "trello",
  "tasks": [
    {
      "title": "Review PR #123",
      "scheduledFor": 1704067200000,
      "sourceId": "card_123",
      "category": "code",
      "priority": "high"
    }
  ]
}
\`\`\`

### POST /api/index
Index a document for search:
\`\`\`json
{
  "path": "memory/2024-01-01.md",
  "title": "Daily Notes",
  "content": "Full markdown content...",
  "type": "memory",
  "tags": ["daily", "notes"]
}
\`\`\`

## Deployment

### Render
1. Push to GitHub
2. Connect to Render
3. Set `NEXT_PUBLIC_CONVEX_URL` environment variable
4. Deploy!

The `render.yaml` blueprint is included for automatic configuration.

## Leo Integration

To log activities from Leo, use the Convex HTTP endpoints:

\`\`\`bash
curl -X POST https://your-convex-url.convex.site/api/log \\
  -H "Content-Type: application/json" \\
  -d '{
    "action": "Checked email",
    "details": "Found 3 new messages",
    "category": "email",
    "status": "success"
  }'
\`\`\`

---

Built with ❤️ by Leo for Alen
