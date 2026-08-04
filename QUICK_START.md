# ⚡ Quick Start - 3 Minutes to Working Extension

## 🎯 Goal: Get screenshots capturing in 3 minutes

---

## ✅ Step 1: Install Extension (30 seconds)

1. Open Chrome
2. Type: `chrome://extensions/` in address bar
3. Toggle **"Developer mode"** ON (top-right)
4. Click **"Load unpacked"**
5. Select folder: `c:\Users\HP\sde\extension\dist`
6. Done! You'll see the extension card

---

## ✅ Step 2: Login to Dashboard (30 seconds)

1. Open: http://localhost:5173
2. If no account:
   - Click "Register"
   - Email: `test@example.com`
   - Password: `password123`
   - Click "Register Admin Account"
3. If have account:
   - Enter credentials
   - Click "Sign In to Dashboard"

---

## ✅ Step 3: Start Monitoring (10 seconds)

1. Click the extension icon (🤖) in Chrome toolbar
2. Click **"Start Monitoring"** button
3. See counter: "Screenshots: 0"

---

## ✅ Step 4: Browse & Wait (1 minute)

Visit these sites (stay 10+ seconds on each):
1. https://www.google.com
2. https://github.com
3. https://www.youtube.com

Check extension popup - counter should increase: 1, 2, 3...

---

## ✅ Step 5: View in Dashboard (30 seconds)

1. Go to dashboard: http://localhost:5173
2. Click "📊 Overview"
   - See active session
   - See screenshot count
3. Click "🖼️ Screenshot Viewer"
   - See captured images
   - Use ◀ ▶ to navigate

---

## ✅ Step 6: Stop Monitoring (10 seconds)

Click extension icon → Click "Stop Monitoring"

---

## 🎉 DONE!

**You now have a working Visual AI monitoring system!**

---

## 🔍 Verify It Worked:

### ✅ Extension Popup Shows:
- Status: Active → Inactive
- Screenshots: 3+ captured

### ✅ Dashboard Overview Shows:
- Total Sessions: 1+
- Screenshots: 3+
- Active session card (or recently ended)

### ✅ Screenshot Viewer Shows:
- Actual images from your browsing
- Can navigate with arrows
- Shows timestamps and URLs

---

## ❌ If It's Not Working:

### Extension doesn't install?
```bash
cd c:\Users\HP\sde\extension
npm run build
```
Then try loading again.

### Dashboard won't login?
Check backend is running:
```bash
cd c:\Users\HP\sde\server
npm run dev
```
Should see: "Server running on port 5000"

### Screenshots not appearing?
1. Click extension icon
2. Check counter is increasing
3. If stuck at 0:
   - Check browser console (F12) for errors
   - Make sure you're on a real website (not chrome:// pages)

---

## 📖 For Full Details:

See: `EXTENSION_SETUP_GUIDE.md`

---

## 🚀 Next Steps:

Once working, try:
1. Browse 10+ different sites
2. Check Activity Timeline - see AI summaries
3. Adjust screenshot interval in Settings
4. Stop and start new sessions
5. Review analytics page

---

**Ready? Start with Step 1! 🚀**
