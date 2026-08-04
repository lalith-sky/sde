# 👁️ Visual AI Agent

A full-stack browser monitoring system. The Chrome Extension captures screenshots of your browser every 10 seconds, the backend analyzes them with Google Gemini AI, and the React dashboard shows all activity data.

---

## How It Works

```
Chrome Extension  →  captures screenshot every 10s
        ↓
Backend (Node.js)  →  AI analysis + saved to MongoDB
        ↓
Dashboard (React)  →  view sessions, activities, screenshots
```

---

## 1. Start the System

**Terminal 1 — Backend**
```bash
cd server
npm install
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 — Dashboard**
```bash
cd dashboard
npm install
npm run dev
# Runs on http://localhost:5173
```

Open http://localhost:5173, click Register, create an account.

---

## 2. Getting Real Screenshots (Chrome Extension)

### Build the extension
```bash
cd extension
npm install
npm run build
```

### Install in Chrome
1. Open Chrome → type in address bar: `chrome://extensions/`
2. Turn ON **Developer mode** (toggle, top-right)
3. Click **Load unpacked**
4. Select the folder: `extension/dist`
5. Extension appears with 👁️ icon in Chrome toolbar

### Login in the extension
1. Click the 👁️ icon in Chrome toolbar
2. Enter the same email + password you used in the dashboard
3. Make sure Server URL is `http://localhost:5000`
4. Click **Login & Link Extension**

### Start monitoring
1. Click **🟢 Start Monitoring Session**
2. Status shows **Monitoring Active**
3. Browse any website — screenshot taken every 10 seconds
4. Popup shows **Last Screen Captured: [time]** updating live

> ⚠️ Cannot capture `chrome://` pages. Use regular websites like google.com, github.com, youtube.com

### View results in dashboard
- **Screenshot Viewer** → actual images with ◀ ▶ navigation
- **Activity Timeline** → AI summary of each captured page
- **Sessions Log** → session with screenshot count + duration
- **Overview** → total stats

### Stop monitoring
Click �️ icon → **🔴 Stop Monitoring Session**

---

## 3. Demo Data (No Extension Needed)

To test the dashboard without the extension:
```bash
cd server
node seedData.js
# Creates 5 sessions + 34 activities with placeholder screenshots
```
Then refresh the dashboard.

---

## 4. Dashboard Pages

| Page | What it Shows |
|------|---------------|
| Overview | Total sessions, screenshots, active session card |
| Sessions Log | Table of all sessions with start/end times |
| Activity Timeline | Every page captured with AI summary + timestamp |
| Screenshot Viewer | Carousel of captured images (◀ ▶ to navigate) |
| Metrics & Charts | Usage analytics |
| Settings | Screenshot interval, Gemini API key, capture mode |

---

## 5. Configuration

**Change screenshot interval**
- Default: every 10 seconds
- Change in extension popup before starting (or via Settings page)

**Add Gemini AI key for real analysis**
1. Go to https://makersuite.google.com → create API key
2. Dashboard → Settings → Gemini API Key → paste → Save
3. Without a key, mock analysis is used (still works)

**Environment variables** (`server/.env`)
```
MONGO_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-secret-key
GEMINI_API_KEY=optional
PORT=5000
```

---

## 6. Project Structure

```
extension/
  src/background/background.ts  ← captures screenshot, sends to server
  src/popup/Popup.tsx            ← login + start/stop UI
  src/content/content.ts         ← injected into web pages
  dist/                          ← built output, load this in Chrome

server/
  src/controllers/               ← route handlers
  src/routes/                    ← API endpoint definitions
  src/database/models/           ← MongoDB schemas
  src/services/aiService.ts      ← Google Gemini AI integration
  src/middleware/                ← JWT auth, rate limiting
  uploads/                       ← screenshot images saved here
  seedData.js                    ← demo data generator

dashboard/
  src/App.tsx                    ← all 6 pages in one file
  src/index.css                  ← dark theme (#0a0b0f + green #00e5a0)
  src/services/api.ts            ← API client (all fetch calls)
```

---

## 7. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login, returns JWT |
| GET | /api/auth/me | Get current user |
| POST | /api/sessions/start | Start monitoring session |
| POST | /api/sessions/end | Stop monitoring session |
| GET | /api/sessions | List all sessions |
| POST | /api/activities/analyze | Upload screenshot + AI analyze |
| GET | /api/activities | List activities with filters |
| GET | /api/activities/timeline | Get timeline for a session |
| GET | /api/screenshots/:id | Get screenshot image |
| GET | /api/dashboard/stats | Overview stats |
| GET | /api/settings | Get user settings |
| POST | /api/settings | Save user settings |

---

## 8. Tech Stack

| Layer | Technology |
|-------|-----------|
| Extension | Chrome Manifest V3, React, TypeScript |
| Backend | Node.js, Express, TypeScript, JWT |
| Database | MongoDB Atlas, Mongoose |
| AI | Google Gemini Vision API |
| Dashboard | React, TypeScript, Vite |
| Logging | Winston |
| Deploy | Docker, docker-compose |

---

## 9. Troubleshooting

| Problem | Fix |
|---------|-----|
| Dashboard shows "Page 1 of 0" | Run `node seedData.js` OR logout and login again (JWT expired) |
| Screenshot Viewer shows placeholders | Use the Chrome extension — placeholders are demo data only |
| Extension "Start Monitoring" does nothing | Make sure backend is running on port 5000 |
| Can't install extension | Enable Developer mode in `chrome://extensions/` |
| Capture fails on some pages | Can't capture `chrome://` pages — use real websites |
| Login fails in extension | Check Server URL is exactly `http://localhost:5000` |
| "Not authorized" errors | JWT expired — logout and login in dashboard + extension |

---

## 10. Docker (Optional)

```bash
docker-compose up --build
# MongoDB on port 27017
# Backend on port 5000
# Dashboard on port 3000
```

---

**GitHub:** https://github.com/lalith-sky/sde
