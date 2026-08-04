# 📸 Visual AI Agent - Complete Setup & Usage Guide

## ✅ Prerequisites Check

Before starting, verify these are running:

```bash
# Check if servers are running:
# Backend should be on: http://localhost:5000
# Dashboard should be on: http://localhost:5173
```

If not running:
```bash
# Terminal 1 - Backend
cd c:\Users\HP\sde\server
npm run dev

# Terminal 2 - Dashboard  
cd c:\Users\HP\sde\dashboard
npm run dev
```

---

## 🚀 STEP 1: Install Chrome Extension

### 1.1 Open Chrome Extensions Page

**Option A:** Type in address bar:
```
chrome://extensions/
```

**Option B:** Click menu (⋮) → More Tools → Extensions

### 1.2 Enable Developer Mode

- Look for **"Developer mode"** toggle in the top-right
- Turn it **ON** (should turn blue)

### 1.3 Load the Extension

1. Click **"Load unpacked"** button (top-left)
2. Navigate to: `c:\Users\HP\sde\extension\dist`
3. Click **"Select Folder"**

### 1.4 Verify Installation

You should see:
- Extension card with icon 🤖
- Title: "Visual AI Agent"
- Status: Enabled (blue toggle)
- ID: (some random string)

### 1.5 Pin the Extension (Optional but Recommended)

1. Click the puzzle piece icon in Chrome toolbar
2. Find "Visual AI Agent"
3. Click the pin icon to keep it visible

---

## 🎯 STEP 2: Create User Account

### 2.1 Open Dashboard

1. Open new browser tab
2. Go to: **http://localhost:5173**

### 2.2 Register New Account

1. Click **"Register"** link at bottom
2. Enter your email (e.g., `test@example.com`)
3. Enter password (e.g., `password123`)
4. Click **"Register Admin Account"**
5. You'll be logged in automatically

---

## ▶️ STEP 3: Start Monitoring Session

### 3.1 Open Extension Popup

- Click the Visual AI Agent icon in Chrome toolbar
- A popup window should appear

### 3.2 Start Monitoring

1. In the popup, click **"Start Monitoring"** button
2. You should see:
   - Button changes to "Stop Monitoring"
   - Status shows "Active"
   - Screenshot counter starts at 0

### 3.3 Grant Permissions (If Prompted)

If Chrome asks for permissions:
- Click **"Allow"**
- Required permissions:
  - `activeTab` - To capture current tab
  - `storage` - To save settings
  - `tabCapture` - To take screenshots

---

## 📸 STEP 4: Verify Screenshots Are Capturing

### 4.1 Browse Some Websites

Open 3-5 different websites in the same tab:
```
1. https://www.google.com
2. https://github.com
3. https://stackoverflow.com  
4. https://www.youtube.com
5. https://www.reddit.com
```

**Stay on each page for 10-15 seconds** to allow screenshots to capture.

### 4.2 Check Extension Popup

Click the extension icon again:
- Screenshot counter should be increasing: 1, 2, 3, 4, 5...
- Each count = one screenshot captured

### 4.3 Check Browser Console (Debug)

1. Right-click the extension icon
2. Select **"Inspect popup"** (or "Manage Extension" → "Inspect views: popup.html")
3. Look at Console tab for messages:
   ```
   ✓ Screenshot captured
   ✓ Uploaded to server
   ✓ Session active
   ```

---

## 📊 STEP 5: View Captured Data in Dashboard

### 5.1 Open Dashboard

Go to: **http://localhost:5173**

### 5.2 Check Overview Page

Should show:
- **Total Sessions:** 1 (or more)
- **Screenshots:** Should match counter from extension
- **Active Monitoring Session** card with:
  - Session ID
  - Start time
  - Screenshots captured
  - **"🛑 Stop Recording Session"** button

### 5.3 View Sessions Log

1. Click **"⏱️ Sessions Log"** in sidebar
2. Should show table with your active session:
   - Session ID
   - Start Time
   - Status: ACTIVE
   - Screenshot Interval: 10s

### 5.4 View Activity Timeline

1. Click **"📅 Activity Timeline"** in sidebar
2. Should show activities with:
   - Timestamps
   - Page titles (Google Search, GitHub, etc.)
   - AI-generated summaries
   - Detected text

### 5.5 View Screenshots

1. Click **"🖼️ Screenshot Viewer"** in sidebar
2. Should show:
   - Screenshot carousel with images
   - **◀ Previous** and **Next ▶** buttons to navigate
   - Capture count (1 of X)
   - Metadata (timestamp, URL, confidence)

---

## ⏹️ STEP 6: Stop Monitoring

### Option A: Stop from Extension
1. Click extension icon
2. Click **"Stop Monitoring"** button
3. Status changes to "Inactive"

### Option B: Stop from Dashboard
1. Go to Dashboard Overview page
2. In "Active Monitoring Session" card
3. Click **"🛑 Stop Recording Session"** button

---

## 🔍 STEP 7: Verify Everything Works

### Checklist:

- [ ] Extension installed and shows in Chrome toolbar
- [ ] User account created in dashboard
- [ ] "Start Monitoring" button works in extension
- [ ] Screenshot counter increases over time
- [ ] Dashboard Overview shows active session
- [ ] Sessions Log shows the session in table
- [ ] Activity Timeline shows captured activities
- [ ] Screenshot Viewer shows actual images
- [ ] "Stop Monitoring" ends the session

---

## ❌ Troubleshooting

### Problem 1: Extension Not Appearing

**Solution:**
```bash
# Rebuild extension
cd c:\Users\HP\sde\extension
npm run build

# Then reload in Chrome:
# Go to chrome://extensions/
# Click refresh icon on extension card
```

### Problem 2: "Start Monitoring" Does Nothing

**Solution:**
1. Check backend is running: http://localhost:5000
2. Check browser console for errors (F12)
3. Verify you're logged in to dashboard

### Problem 3: Screenshot Counter Stays at 0

**Solution:**
1. Check Chrome permissions:
   - Go to `chrome://extensions/`
   - Click "Details" on Visual AI Agent
   - Verify all permissions are granted
2. Check backend logs for upload errors

### Problem 4: Screenshots Not Showing in Dashboard

**Solution:**
1. Check if files are being saved:
   ```bash
   dir c:\Users\HP\sde\uploads
   ```
2. Verify MongoDB connection:
   - Check `server/.env` has correct MONGO_URI
   - Check backend logs for database errors
3. Refresh dashboard (Ctrl+R)

### Problem 5: Dashboard Shows "Page 1 of 0"

**Solution:**
1. Sign out and sign back in (JWT token expired)
2. Check backend is returning data:
   - Open browser DevTools (F12)
   - Go to Network tab
   - Look for API calls to `/api/activities`, `/api/sessions`
   - Check response shows data

---

## 📁 Where Are Screenshots Stored?

**Location:** `c:\Users\HP\sde\server\uploads\`

Each screenshot is saved as:
```
screenshot-[userId]-[timestamp].png
```

Example:
```
c:\Users\HP\sde\server\uploads\screenshot-6a720b21-1733337600000.png
```

---

## 🎨 How to Check If Screenshots Are Actually Capturing

### Method 1: Check Uploads Folder
```bash
cd c:\Users\HP\sde\server\uploads
dir
```

Should show multiple `.png` files.

### Method 2: Check MongoDB
The screenshots are logged in MongoDB `screenshots` collection with:
- `userId`
- `sessionId`
- `imageUrl` (path to file)
- `timestamp`

### Method 3: Check Backend Logs
Look for messages like:
```
[info]: POST /api/upload - Screenshot uploaded successfully
[info]: POST /api/analyze - AI analysis completed
```

---

## ⚙️ Configuration

### Change Screenshot Interval

**In Dashboard:**
1. Go to **"⚙️ Preferences Settings"**
2. Find **"Screenshot Interval (seconds)"**
3. Change value (default: 10)
4. Click **"Save Configurations"**

**In Extension:**
- Edit `extension/src/background/background.ts`
- Change `SCREENSHOT_INTERVAL` constant
- Rebuild: `npm run build`

---

## 🎯 Expected Behavior

### After 1 Minute of Monitoring:
- **Screenshots captured:** ~6 (one every 10 seconds)
- **Activities created:** ~6 (one per screenshot)
- **Dashboard Overview:** Shows 6 screenshots count
- **Sessions Log:** 1 active session
- **Activity Timeline:** 6 activity entries
- **Screenshot Viewer:** 6 images in carousel

---

## 🚀 Quick Test Sequence

**5-Minute End-to-End Test:**

```
1. [0:00] Build extension: npm run build
2. [0:30] Load extension in Chrome
3. [1:00] Register account in dashboard
4. [1:30] Click "Start Monitoring" in extension
5. [2:00] Visit Google.com (wait 15 sec)
6. [2:15] Visit GitHub.com (wait 15 sec)
7. [2:30] Visit YouTube.com (wait 15 sec)
8. [2:45] Check extension popup - should show ~3 screenshots
9. [3:00] Open dashboard - check Overview page
10. [3:30] Check Sessions Log - see active session
11. [4:00] Check Activity Timeline - see 3 activities
12. [4:30] Check Screenshot Viewer - see 3 images
13. [5:00] Click "Stop Monitoring" ✅ DONE!
```

---

## 📞 Need Help?

If you're stuck:

1. **Check Backend Logs:**
   ```
   Look at terminal where `npm run dev` is running in server folder
   ```

2. **Check Browser Console:**
   ```
   Press F12 → Console tab
   Look for red errors
   ```

3. **Check Extension Console:**
   ```
   Right-click extension icon → Inspect popup
   Look for errors
   ```

4. **Share Error Messages:**
   - Screenshot of console errors
   - Backend log errors
   - What step failed

---

## ✅ Success Criteria

You know it's working when:

✅ Extension popup shows increasing screenshot count
✅ Dashboard Overview shows active session
✅ Activity Timeline shows your browsing history
✅ Screenshot Viewer displays actual images
✅ You can navigate between screenshots with arrows
✅ Stopping monitoring updates the session status

---

**Ready to test? Follow Step 1 and let me know when you reach Step 3!**
