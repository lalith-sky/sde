# Visual AI Dashboard - Testing Instructions

## 🎯 Current Status

Your dashboard is **RUNNING and UPDATED** with debugging features!

- ✅ Backend Server: http://localhost:5000
- ✅ Dashboard: http://localhost:5173
- ✅ MongoDB: Connected
- ✅ All TypeScript compiled successfully
- ✅ Debug logging enabled
- ✅ Visual indicators added

---

## 🔍 How to Test if Buttons Are Working

### Step 1: Open the Dashboard

Open your browser and go to:
```
http://localhost:5173
```

### Step 2: Look for the Green "SYSTEM ONLINE" Badge

You should see a **green badge in the top-right corner** that says "SYSTEM ONLINE"

✅ If you see it → React is running and rendering correctly

### Step 3: Open Browser Console

Press **F12** (or right-click → Inspect → Console tab)

You should immediately see:
```
🚀 Visual AI Dashboard loaded successfully!
Current tab: overview
User: null
```

### Step 4: Test the Login Switch Button

On the login page, you'll see text: **"Need an account?"** followed by a **Register** button

1. Click the **"Register"** button
2. The page should change to show "Create Account"
3. Check the console - you should see:
   ```
   🔄 Switching auth mode: register
   ```

4. Click **"Sign In"** to switch back
5. Console should show:
   ```
   🔄 Switching auth mode: login
   ```

✅ **If you see these console messages, your buttons ARE working!**

### Step 5: Test Login

1. Click "Register" button at bottom
2. Enter email: `test@example.com`
3. Enter password: `password123`
4. Click **"Register Account"** button
5. Console should show:
   ```
   🔐 Login attempt: {email: "test@example.com", isReg: true}
   ```

6. If registration succeeds, you'll see the main dashboard

### Step 6: Test Navigation (After Login)

Once logged in, you'll see the sidebar with navigation buttons:
- Overview
- Sessions Log
- Activity Timeline
- Screenshot Viewer
- Metrics & Charts
- Preferences Settings

1. Click on **"Sessions Log"**
2. Console should show:
   ```
   🔘 Navigation clicked: sessions
   Current tab: sessions
   ```

3. Try clicking other navigation items
4. Each click should show similar console messages

---

## ❌ Troubleshooting

### Problem: Page is blank or not loading

**Solution:**
1. Press `Ctrl+Shift+R` (hard refresh) to clear cache
2. Check console for error messages
3. Verify the dev server is running (check terminal)

### Problem: "SYSTEM ONLINE" badge not visible

**Solution:**
1. The React app is not loading properly
2. Check browser console for errors (press F12)
3. Look for error messages in red
4. Share the error messages with me

### Problem: Can see the page but no console messages when clicking

**Solution 1: Cache Issue**
```
1. Open DevTools (F12)
2. Right-click the browser refresh button
3. Select "Empty Cache and Hard Reload"
```

**Solution 2: JavaScript Disabled**
```
1. Open browser Settings
2. Search for "JavaScript"
3. Ensure JavaScript is enabled
```

**Solution 3: Network Issue**
```
1. Open DevTools (F12)
2. Go to "Network" tab
3. Reload page
4. Check if all files loaded (status 200)
5. Look for any red/failed requests
```

### Problem: Buttons look clickable but nothing happens

**Solution:**
1. Open console (F12)
2. Check for JavaScript errors
3. Try clicking the "Register/Sign In" toggle button
4. If you see console logs, the buttons ARE working
5. The issue might be that you're expecting different behavior

---

## 📊 What Should Work:

### ✅ Login/Register Page:
- Toggle between Login/Register modes
- Form input fields should accept text
- Submit button should attempt authentication
- Error messages should display if authentication fails

### ✅ Main Dashboard (After Login):
- Sidebar navigation switches between different pages
- Each page shows different content
- Overview page shows stats, system health, recent activity
- Sessions page shows a table
- Timeline page shows activity entries
- Settings page has form inputs and toggles

---

## 🐛 If Buttons STILL Don't Work:

### Share These Details:

1. **Browser & Version:**
   - What browser? (Chrome, Firefox, Edge, etc.)
   - Version number?

2. **Console Output:**
   - Press F12
   - Take a screenshot of the Console tab
   - Share any error messages (especially red ones)

3. **Network Tab:**
   - Press F12
   - Go to "Network" tab
   - Reload the page
   - Take a screenshot showing all loaded files

4. **Visual State:**
   - Take a screenshot of what you see on the page
   - Note: Can you see the "SYSTEM ONLINE" badge?

5. **What Happens:**
   - Which button are you clicking?
   - What do you expect to happen?
   - What actually happens? (nothing, error, etc.)

---

## 🎨 Expected Behavior:

### Login Page:
- Dark background (#0a0b0f)
- Green "SYSTEM ONLINE" badge top-right
- Robot emoji logo
- Email and password fields
- "Sign In →" or "Register Account" button
- "Register" or "Sign In" toggle link at bottom

### Main Dashboard:
- Dark theme with green accents
- Left sidebar with navigation
- Top bar showing "Agent Terminal" and "SERVER CONNECTION: ACTIVE"
- Main content area changes based on selected tab
- Clicking navigation items switches the view

---

## 💡 Quick Test Checklist:

- [ ] Open http://localhost:5173
- [ ] See "SYSTEM ONLINE" badge? (top-right, green)
- [ ] Open console (F12)
- [ ] See "🚀 Visual AI Dashboard loaded successfully!"?
- [ ] Click "Register" button at bottom
- [ ] See "🔄 Switching auth mode" in console?
- [ ] Form inputs accept text?
- [ ] Can submit the form?

**If ALL checkboxes are ✅ → Everything is working correctly!**

---

## 🚀 Ready to Use:

Once you confirm buttons work:
1. Register a new account
2. Login with your credentials
3. Explore the different tabs
4. Install the Chrome extension (in `/extension` folder)
5. Start monitoring sessions

---

## Need Help?

Share:
1. Screenshot of browser page
2. Screenshot of console (F12)
3. Any error messages
4. What specifically is not working
