# Railway Deployment Guide

## Quick Deploy to Railway

### Option 1: Deploy via GitHub (Recommended)

1. **Push your code to GitHub** (if not already done)
   ```bash
   git push origin claude/check-api-deployment-011CUq1Shgp5863y4YSrUbhv
   ```

2. **Go to Railway** (https://railway.app)
   - Sign up or log in with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your `polymarketdata` repository
   - Railway will automatically detect the configuration and deploy

3. **Your API will be available at:**
   - Railway will provide a public URL like: `https://your-app.railway.app`

### Option 2: Deploy via Railway CLI

1. **Install Railway CLI:**
   ```bash
   npm i -g @railway/cli
   # or
   brew install railway
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Initialize and deploy:**
   ```bash
   railway init
   railway up
   ```

4. **Get your deployment URL:**
   ```bash
   railway domain
   ```

## Configuration Files

- **Procfile**: Defines how Railway starts your app
- **railway.toml**: Railway-specific configuration
- **requirements.txt**: Python dependencies (already configured with gunicorn)

## Environment Variables

Railway automatically provides:
- `PORT`: The port your app should listen on

No additional environment variables needed!

## API Endpoints

Once deployed, your API will have these endpoints:

- `GET /` - Web interface
- `GET /health` - Health check
- `POST /fetch_markets` - Fetch top 50 markets by volume
- `POST /fetch_events` - Fetch top 50 events by volume
- `GET /download/<filename>` - Download generated CSV files

## Example Usage

```bash
# Health check
curl https://your-app.railway.app/health

# Fetch markets
curl -X POST https://your-app.railway.app/fetch_markets \
  -H "Content-Type: application/json" \
  -d '{"start_date": "2024-01-01", "end_date": "2024-12-31"}'

# Fetch events
curl -X POST https://your-app.railway.app/fetch_events \
  -H "Content-Type: application/json"
```

## Troubleshooting

If deployment fails:
1. Check Railway logs in the dashboard
2. Ensure all dependencies are in requirements.txt
3. Verify the app binds to `0.0.0.0:$PORT`
