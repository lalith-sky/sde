# 👁️ Visual AI Agent - Chrome Extension

> **Production-Quality Full Stack Visual AI Agent for browser activity monitoring, analysis, and insights**

A comprehensive Chrome Extension (Manifest V3) that captures browser screenshots, analyzes them using AI (Google Gemini), and provides detailed activity tracking through a modern React dashboard. Built with TypeScript, Node.js, Express, MongoDB, and Docker.

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Configuration](#-configuration)
- [Usage Guide](#-usage-guide)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Docker Deployment](#-docker-deployment)
- [Development](#-development)
- [Testing](#-testing)
- [Security](#-security)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Chrome Extension
- ✅ **Manifest V3** - Latest Chrome extension standard
- 🔒 **Secure Permissions** - Explicit user consent for tab capture
- ⏱️ **Configurable Intervals** - Screenshot capture every 5-3600 seconds
- 🎯 **Active Tab Only** - Captures only the current active browser tab
- 🚫 **Smart Skip** - Automatically skips chrome:// and system pages
- 📊 **Real-time Status** - Live monitoring indicators in popup
- 💾 **Local Storage** - Persists session state across browser restarts
- 🔐 **JWT Authentication** - Secure token-based auth with backend

### AI Processing
- 🤖 **Google Gemini Vision** - Advanced multimodal AI analysis
- 📸 **OCR & Text Detection** - Extracts visible text from screenshots
- 📝 **Activity Summarization** - Generates human-readable summaries
- 🎯 **Page Classification** - Identifies page type and context
- ⚡ **Mock Fallback** - Context-aware mock analysis when API unavailable
- 🔑 **Per-User API Keys** - Support for personal Gemini API keys

### Backend API
- 🚀 **Express.js + TypeScript** - Type-safe REST API
- 🔒 **JWT Authentication** - Secure user authentication
- 📁 **File Upload** - Multer-based screenshot handling
- 🛡️ **Rate Limiting** - Protection against abuse
- 🔐 **Helmet Security** - HTTP security headers
- 📊 **Audit Logging** - Database-persisted system logs
- ⚠️ **Input Validation** - Request data sanitization
- 🌐 **CORS Enabled** - Cross-origin resource sharing

### Dashboard
- ⚛️ **React 18 + TypeScript** - Modern frontend framework
- 📊 **Real-time Analytics** - Live metrics and statistics
- 📅 **Activity Timeline** - Chronological browsing history
- 🖼️ **Screenshot Carousel** - Gallery view with thumbnails
- 🔍 **Advanced Filtering** - Search, date range, session filters
- 📈 **Visual Charts** - Domain usage analytics
- ⚙️ **Settings Management** - User preferences configuration
- 🎨 **Glassmorphism UI** - Modern, premium design
- 📱 **Responsive Layout** - Adaptive to screen sizes

### Database
- 🗄️ **MongoDB** - NoSQL document database
- 📑 **Mongoose ODM** - Schema validation and relationships
- 🔗 **Indexed Queries** - Optimized database performance
- 🔍 **Full-Text Search** - Activity content search
- 📊 **Aggregation Pipelines** - Complex analytics queries

### DevOps
- 🐳 **Docker Compose** - Multi-container orchestration
- 📦 **Multi-stage Builds** - Optimized container images
- 🔄 **Volume Persistence** - Data and logs persistence
- 🌐 **Nginx Reverse Proxy** - Production-grade frontend serving
- 🔧 **Environment Variables** - Configuration management

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CHROME BROWSER                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Chrome Extension (Manifest V3)            │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  │  │
│  │  │   Popup    │  │ Background │  │  Content   │  │  │
│  │  │   (React)  │  │   Worker   │  │   Script   │  │  │
│  │  └─────┬──────┘  └──────┬─────┘  └─────┬──────┘  │  │
│  │        │                │               │         │  │
│  │        └────────────────┴───────────────┘         │  │
│  │                    Chrome API                     │  │
│  │              (tabs, alarms, storage)              │  │
│  └──────────────────────┬───────────────────────────┘  │
└─────────────────────────┼──────────────────────────────┘
                          │ HTTPS/REST API
                          ▼
        ┌─────────────────────────────────────┐
        │      Backend Server (Express)       │
        │  ┌───────────────────────────────┐  │
        │  │    Controllers & Routes       │  │
        │  │  • Auth   • Sessions          │  │
        │  │  • Upload • Activities        │  │
        │  │  • Screenshots • Dashboard    │  │
        │  └────────────┬──────────────────┘  │
        │               │                     │
        │  ┌────────────▼──────────────────┐  │
        │  │      AI Service Layer         │  │
        │  │  • Gemini Vision API          │  │
        │  │  • OCR & Analysis             │  │
        │  │  • Mock Fallback              │  │
        │  └────────────┬──────────────────┘  │
        │               │                     │
        │  ┌────────────▼──────────────────┐  │
        │  │    Middleware & Utils         │  │
        │  │  • JWT Auth  • Rate Limit    │  │
        │  │  • Logging   • Validation     │  │
        │  └────────────┬──────────────────┘  │
        └───────────────┼─────────────────────┘
                        │
                        ▼
        ┌─────────────────────────────────────┐
        │       MongoDB Database              │
        │  ┌───────────────────────────────┐  │
        │  │  Collections:                 │  │
        │  │  • Users                      │  │
        │  │  • Sessions                   │  │
        │  │  • Activities                 │  │
        │  │  • Screenshots                │  │
        │  │  • Settings                   │  │
        │  │  • Logs                       │  │
        │  └───────────────────────────────┘  │
        └─────────────────────────────────────┘
                        ▲
                        │
        ┌───────────────┴─────────────────────┐
        │     React Dashboard (Vite)          │
        │  ┌───────────────────────────────┐  │
        │  │  Pages:                       │  │
        │  │  • Login/Register             │  │
        │  │  • Dashboard Overview         │  │
        │  │  • Sessions Log               │  │
        │  │  • Activity Timeline          │  │
        │  │  • Screenshot Viewer          │  │
        │  │  • Analytics Charts           │  │
        │  │  • Settings                   │  │
        │  └───────────────────────────────┘  │
        └─────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **Chrome Extension**: React 18, TypeScript, Vite
- **Dashboard**: React 18, TypeScript, Vite
- **Styling**: Custom CSS with Glassmorphism design

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Language**: TypeScript
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer
- **Security**: Helmet, CORS, bcryptjs
- **Logging**: Winston
- **AI**: Google Generative AI (Gemini)

### Database
- **Database**: MongoDB 6.0
- **ODM**: Mongoose

### DevOps
- **Containerization**: Docker, Docker Compose
- **Web Server**: Nginx (for dashboard)
- **Process Management**: Node.js native

### Development Tools
- **Build Tool**: Vite
- **Testing**: Jest, Supertest
- **Linting**: ESLint
- **Package Manager**: npm

---

## 📁 Project Structure

```
visual-ai-agent/
├── server/                     # Backend Express API
│   ├── src/
│   │   ├── controllers/        # Route controllers
│   │   │   ├── activityController.ts
│   │   │   ├── authController.ts
│   │   │   ├── dashboardController.ts
│   │   │   ├── screenshotController.ts
│   │   │   ├── sessionController.ts
│   │   │   └── settingsController.ts
│   │   ├── database/
│   │   │   ├── models/         # Mongoose schemas
│   │   │   │   ├── Activity.ts
│   │   │   │   ├── Log.ts
│   │   │   │   ├── Screenshot.ts
│   │   │   │   ├── Session.ts
│   │   │   │   ├── Settings.ts
│   │   │   │   └── User.ts
│   │   │   └── connection.ts   # MongoDB connection
│   │   ├── middleware/         # Express middleware
│   │   │   ├── authMiddleware.ts
│   │   │   └── rateLimiter.ts
│   │   ├── routes/             # API routes
│   │   │   ├── activityRoutes.ts
│   │   │   ├── authRoutes.ts
│   │   │   ├── dashboardRoutes.ts
│   │   │   ├── screenshotRoutes.ts
│   │   │   ├── sessionRoutes.ts
│   │   │   └── settingsRoutes.ts
│   │   ├── services/           # Business logic
│   │   │   └── aiService.ts    # Gemini AI integration
│   │   ├── utils/              # Utilities
│   │   │   ├── auth.ts         # JWT & bcrypt helpers
│   │   │   ├── dbLogger.ts     # Database logging
│   │   │   └── logger.ts       # Winston logger
│   │   ├── tests/              # Jest tests
│   │   ├── app.ts              # Express app setup
│   │   └── index.ts            # Server entry point
│   ├── .env                    # Environment variables
│   ├── Dockerfile              # Production container
│   ├── package.json
│   └── tsconfig.json
│
├── extension/                  # Chrome Extension
│   ├── src/
│   │   ├── background/
│   │   │   └── background.ts   # Service worker
│   │   ├── content/
│   │   │   └── content.ts      # Content script
│   │   └── popup/
│   │       ├── Popup.tsx       # Popup UI
│   │       ├── Popup.css
│   │       └── index.tsx
│   ├── public/
│   │   └── manifest.json       # Extension manifest
│   ├── package.json
│   └── vite.config.ts
│
├── dashboard/                  # React Dashboard
│   ├── src/
│   │   ├── services/
│   │   │   └── api.ts          # API client
│   │   ├── App.tsx             # Main component
│   │   ├── index.css           # Global styles
│   │   └── main.tsx            # Entry point
│   ├── Dockerfile              # Nginx container
│   ├── package.json
│   └── vite.config.ts
│
├── uploads/                    # Screenshot storage
├── logs/                       # Application logs
├── docker-compose.yml          # Docker orchestration
└── README.md                   # This file
```

---

## 📋 Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **MongoDB** 6.0+ ([Download](https://www.mongodb.com/try/download/community))
- **Docker** (optional, for containerized deployment)
- **Chrome Browser** (for extension)
- **Google Gemini API Key** (optional, for AI features)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/visual-ai-agent.git
cd visual-ai-agent
```

### 2. Backend Setup

```bash
cd server
npm install

# Configure environment variables
# Edit .env file and add your MongoDB URI and JWT secret
```

**server/.env:**
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/visual-ai-agent
JWT_SECRET=your_super_secret_key_here_change_in_production
GEMINI_API_KEY=your_gemini_api_key_optional
NODE_ENV=development
```

### 3. Dashboard Setup

```bash
cd ../dashboard
npm install
```

### 4. Extension Setup

```bash
cd ../extension
npm install
```

---

## ⚙️ Configuration

### Get Gemini API Key (Optional)

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to `server/.env` or set in Dashboard Settings

**Note:** If no API key is provided, the system uses intelligent mock analysis.

---

## 🎮 Usage Guide

### Running Locally (Development)

#### 1. Start MongoDB

```bash
# If MongoDB is not running, start it:
mongod
```

#### 2. Start Backend Server

```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

#### 3. Start Dashboard

```bash
cd dashboard
npm run dev
# Dashboard runs on http://localhost:5173
```

#### 4. Build & Load Extension

```bash
cd extension
npm run build
```

**Load in Chrome:**
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `extension/dist` folder

### First Time Setup

1. **Create Account**
   - Open Dashboard at http://localhost:5173
   - Click "Register" 
   - Enter email and password
   - Click "Register Admin Account"

2. **Configure Extension**
   - Click extension icon in Chrome toolbar
   - Enter backend URL: `http://localhost:5000`
   - Login with your credentials
   - Set screenshot interval (default: 10 seconds)

3. **Start Monitoring**
   - Click "🟢 Start Monitoring Session"
   - Extension captures screenshots periodically
   - View real-time data in Dashboard

---

## 🐳 Docker Deployment

### Quick Start with Docker Compose

```bash
# Set your Gemini API key (optional)
export GEMINI_API_KEY=your_api_key_here

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

**Services:**
- MongoDB: `localhost:27017`
- Backend: `localhost:5000`
- Dashboard: `localhost:80`

### Production Deployment

```bash
# Build and run in production mode
docker-compose up -d --build

# Scale backend (optional)
docker-compose up -d --scale backend=3
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "role": "user"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": { "id": "...", "email": "...", "role": "user" }
}
```

#### Get Profile
```http
GET /auth/me
Authorization: Bearer <token>
```

### Session Endpoints

#### Start Session
```http
POST /sessions/start
Authorization: Bearer <token>

Response:
{
  "success": true,
  "session": { "_id": "...", "status": "active", ... }
}
```

#### End Session
```http
POST /sessions/end
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionId": "session_id_here"
}
```

#### List Sessions
```http
GET /sessions?page=1&limit=10
Authorization: Bearer <token>
```

### Activity Endpoints

#### Analyze Screenshot
```http
POST /activities/analyze
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- screenshot: (file)
- sessionId: (string)
- pageTitle: (string)
- url: (string)
```

#### Get Activities
```http
GET /activities?page=1&limit=10&sessionId=xxx&q=search&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

#### Get Timeline
```http
GET /activities/timeline?sessionId=xxx
Authorization: Bearer <token>
```

### Screenshot Endpoints

#### Get Screenshot File
```http
GET /screenshots/:id
Authorization: Bearer <token>
```

### Settings Endpoints

#### Get Settings
```http
GET /settings
Authorization: Bearer <token>
```

#### Update Settings
```http
POST /settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "screenshotInterval": 10,
  "captureMode": "active_tab",
  "aiConfidenceThreshold": 0.7,
  "geminiApiKey": "optional_key"
}
```

### Dashboard Endpoints

#### Get Dashboard Stats
```http
GET /dashboard/stats
Authorization: Bearer <token>
```

---

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  password: String (hashed),
  role: String (enum: ['user', 'admin']),
  status: String (enum: ['active', 'suspended']),
  createdAt: Date
}
```

### Sessions Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, indexed),
  status: String (enum: ['active', 'ended']),
  startTime: Date,
  endTime: Date,
  duration: Number (seconds),
  screenshotInterval: Number,
  createdAt: Date
}
```

### Activities Collection
```javascript
{
  _id: ObjectId,
  sessionId: ObjectId (ref: Session, indexed),
  userId: ObjectId (ref: User, indexed),
  timestamp: Date,
  pageTitle: String (text indexed),
  url: String (text indexed),
  summary: String (text indexed),
  detectedTexts: [String] (text indexed),
  confidence: Number,
  screenshotId: ObjectId (ref: Screenshot),
  createdAt: Date
}
```

### Screenshots Collection
```javascript
{
  _id: ObjectId,
  sessionId: ObjectId (ref: Session, indexed),
  activityId: ObjectId (ref: Activity),
  filename: String,
  filepath: String,
  mimeType: String,
  size: Number,
  createdAt: Date
}
```

### Settings Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, unique, indexed),
  screenshotInterval: Number,
  captureMode: String (enum: ['active_tab', 'desktop']),
  aiConfidenceThreshold: Number,
  geminiApiKey: String,
  createdAt: Date
}
```

### Logs Collection
```javascript
{
  _id: ObjectId,
  level: String (enum: ['info', 'warn', 'error', 'debug']),
  message: String,
  meta: Mixed,
  timestamp: Date
}
```

---

## 🧪 Testing

### Backend Tests

```bash
cd server
npm test

# Run specific test
npm test -- auth.test.ts

# Coverage report
npm test -- --coverage
```

### Test Files
- `server/src/tests/auth.test.ts` - Authentication tests
- `server/src/tests/session.test.ts` - Session management tests

---

## 🔐 Security

### Implemented Security Features

1. **JWT Authentication** - Secure token-based auth with 7-day expiration
2. **Password Hashing** - bcrypt with salt rounds
3. **Rate Limiting** - 200 requests per 15 minutes
4. **Helmet** - Security headers (XSS, clickjacking protection)
5. **CORS** - Cross-origin resource sharing controls
6. **Input Validation** - Request data sanitization
7. **File Upload Limits** - 5MB max per screenshot
8. **Role-Based Access** - User/Admin permissions
9. **Account Suspension** - Admin can suspend accounts
10. **Request Logging** - All API requests logged

### Security Best Practices

- Change `JWT_SECRET` in production
- Use HTTPS in production
- Set strong MongoDB credentials
- Regularly update dependencies
- Monitor logs for suspicious activity
- Implement backup strategy

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongosh

# If not, start MongoDB service
# Windows:
net start MongoDB

# Linux/Mac:
sudo systemctl start mongod
```

### Extension Not Capturing

1. Check extension permissions
2. Verify backend is running
3. Check browser console for errors
4. Ensure you're logged in
5. Verify session is active

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
npm run build -- --force
```

### Docker Issues

```bash
# Reset Docker environment
docker-compose down -v
docker-compose up -d --build

# View logs
docker-compose logs -f backend
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Coding Standards

- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Meaningful commit messages
- Document complex logic

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- Google Gemini AI for vision capabilities
- MongoDB for database
- React community for amazing tools
- Chrome Extensions documentation

---

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review troubleshooting section

---

**Built with ❤️ using TypeScript, React, Node.js, and AI**
