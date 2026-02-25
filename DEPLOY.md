# Deployment Guide

## Current Status

Mission Control is built and ready. Code is pushed to GitHub at:
**https://github.com/clawdleo/mission-control**

## Option 1: Render (Recommended)

The existing `mission-control` service on Render is configured as a static site. To deploy the new Node.js app:

1. Go to https://dashboard.render.com
2. Delete the existing `mission-control` static site
3. Click "New +" → "Web Service"
4. Connect to GitHub repo: `clawdleo/mission-control`
5. Use these settings:
   - **Name**: mission-control
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for faster builds)

Auto-deploy is enabled - pushes to `master` will trigger rebuilds.

## Option 2: Run Locally

```bash
cd /home/clawd/clawd/projects/mission-control
npm install
npm run build
npm start
```

Access at http://localhost:3000

## Option 3: Vercel (Alternative)

```bash
npm install -g vercel
cd /home/clawd/clawd/projects/mission-control
vercel --prod
```

## Data Sources

Mission Control reads from:
- `/home/clawd/clawd/projects/kalshi-bot/weather-state.json`
- `/home/clawd/clawd/projects/trading-bot/trader_state.json`
- `openclaw cron list --json`

Make sure these paths are accessible on the deployment machine.

## Next Steps

1. Deploy to Render (requires adding payment info first)
2. Test all data sources are working
3. Add more projects to the dashboard
4. Implement ROI decision support logic
