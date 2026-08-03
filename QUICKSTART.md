# 🚀 Quick Start Guide - Visual AI Agent

Get up and running in 5 minutes!

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 20+ installed (`node --version`)
- ✅ npm installed (`npm --version`)
- ✅ Git installed (`git --version`)

## Option 1: Local Development (Recommended for Testing)

### Step 1: Clone & Install

```bash
# Clone the repository
git clone https://github.com/lalith-sky/sde.git
cd sde

# Install backend dependencies
cd server
npm install

# Install dashboard dependencies
cd ../dashboard
npm install

# Install extension dependencies
cd ../extension
npm install
cd ..
```

### Step 2: Install & Start MongoDB

**Windows:**
```bash
# Download MongoDB from https://www.mongodb.com/try/download/community
# Install and start MongoDB service
net start MongoDB
```

**Mac (with Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community@6.0
brew services start mongodb-community@6.0
```

**Linux:**
```bash
sudo systemctl start mongod
```

### Step 3: Configure Environment

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/visual-ai-agent
JWT_SECRET=change_this_to_secure_random_string
GEMINI_API_KEY=optional_your_gemini_key
NODE_ENV=development
```

### Step 4: Start All Services

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# ✅ Server running on http://localhost:5000
```

**Terminal 2 - Dashboard:**
```bash
cd dashboard
npm run dev
# ✅ Dashboard running on http://localhost:5173
```

**Terminal 3 - Build Extension:**
```bash
cd extension
npm run build
# ✅ Extension built in extension/dist/
```

### Step 5: Load Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `extension/dist` folder
5. ✅ Extension loaded!

### Step 6: First Use

1. **Open Dashboard**: http://localhost:5173
2. **Register Account**: Click "Need an account? Register"
   - Email: `admin@test.com`
   - Password: `password123`
3. **Login to Extension**:
   - Click extension icon in Chrome toolbar
   - Backend URL: `http://localhost:5000`
   - Login with same credentials
4. **Start Monitoring**:
   - Set interval (default: 10 seconds)
   - Click "🟢 Start Monitoring Session"
5. **View Dashboard**: Refresh dashboard to see activity!

---

## Option 2: Docker Deployment (Production-Ready)

### Prerequisites
- Docker Desktop installed
- Docker Compose installed

### One Command Start

```bash
# Clone repository
git clone https://github.com/lalith-sky/sde.git
cd sde

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

**Services Available:**
- 🗄️ MongoDB: `localhost:27017`
- 🚀 Backend API: `http://localhost:5000`
- 📊 Dashboard: `http://localhost:80`

### Load Extension

```bash
# Build extension locally (Docker doesn't build extension)
cd extension
npm install
npm run build

# Load in Chrome as described in Option 1, Step 5
```

### Stop Services

```bash
docker-compose down
```

---

## Testing the Setup

### 1. Backend Health Check
```bash
curl http://localhost:5000
# Should return: {"message":"Visual AI Agent Backend API running successfully"}
```

### 2. Register Test User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 3. Extension Test
- Click extension icon
- Should show login form
- Enter credentials and connect

---

## Common Issues & Solutions

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
mongosh
# or
mongo

# If not running, start it:
# Windows: net start MongoDB
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Port Already in Use
```bash
# Kill process on port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

### Extension Not Capturing
1. Check backend is running (http://localhost:5000)
2. Verify you're logged in
3. Check session is active (green indicator)
4. Look at browser console (F12) for errors
5. Try refreshing the page

### Build Errors
```bash
# Clear cache and reinstall
cd server  # or dashboard or extension
rm -rf node_modules package-lock.json
npm install
```

---

## Next Steps

1. ✅ **Get Gemini API Key** (Optional but recommended):
   - Visit: https://makersuite.google.com/app/apikey
   - Add to `server/.env` or Dashboard Settings

2. ✅ **Explore Dashboard Features**:
   - 📊 Overview - Real-time metrics
   - ⏱️ Sessions Log - All monitoring sessions
   - 📅 Activity Timeline - Search & filter
   - 🖼️ Screenshot Viewer - Visual carousel
   - 📈 Analytics - Domain usage charts
   - ⚙️ Settings - Configure preferences

3. ✅ **Customize Settings**:
   - Screenshot interval (5-3600 seconds)
   - AI confidence threshold
   - Personal Gemini API key

---

## Development Tips

### Backend Dev Mode
```bash
cd server
npm run dev  # Auto-restarts on file changes
```

### Dashboard Dev Mode
```bash
cd dashboard
npm run dev  # Hot reload enabled
```

### Extension Development
```bash
cd extension
npm run dev  # Watch mode
# Reload extension in chrome://extensions/ after changes
```

### Run Tests
```bash
cd server
npm test
```

---

## Production Deployment

### Environment Variables for Production

```env
NODE_ENV=production
MONGO_URI=mongodb://username:password@production-host:27017/dbname
JWT_SECRET=STRONG_RANDOM_SECRET_KEY_HERE
GEMINI_API_KEY=your_production_api_key
```

### Security Checklist
- [ ] Change JWT_SECRET to strong random string
- [ ] Use HTTPS/SSL certificates
- [ ] Set MongoDB authentication
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Regular backups
- [ ] Monitor logs

---

## Support & Resources

- 📖 **Full Documentation**: [README.md](./README.md)
- 🐛 **Report Issues**: https://github.com/lalith-sky/sde/issues
- 💡 **Feature Requests**: Open a GitHub issue
- 📧 **Questions**: Create a discussion on GitHub

---

## Architecture Overview

```
Chrome Extension → Backend API → MongoDB
                ↓
           AI Service (Gemini)
                ↓
          React Dashboard
```

**Happy Monitoring! 👁️✨**
