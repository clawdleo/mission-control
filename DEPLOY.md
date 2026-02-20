# Deploy Mission Control to Render

## Quick Deploy (5 minutes)

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com/
   - Log in with your account

2. **Create New Static Site**
   - Click "New +" button (top right)
   - Select "Static Site"

3. **Connect GitHub Repository**
   - Select `clawdleo/mission-control` from the list
   - Or connect the repo if not already connected

4. **Configure Settings**
   - **Name:** `mission-control` (or whatever you prefer)
   - **Branch:** `master`
   - **Build Command:** (leave empty or use `echo "Static site"`)
   - **Publish Directory:** `.` (root directory)
   
5. **Deploy!**
   - Click "Create Static Site"
   - Render will auto-deploy from the render.yaml config
   - Wait ~1 minute for deployment

6. **Get Your URL**
   - Will be: `https://mission-control.onrender.com` (or similar)
   - Add to TOOLS.md for future reference

## Auto-Deploy Setup

Once connected, any `git push` to master will auto-deploy. No manual steps needed.

## Troubleshooting

If it doesn't work:
- Make sure `index.html` is in the root directory ✅
- Check that `render.yaml` exists ✅
- Verify the repo is public on GitHub ✅

Everything is ready - just connect it in the Render dashboard!
