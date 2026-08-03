# 🏗️ Architecture Documentation

## System Architecture Overview

Visual AI Agent follows a modern three-tier architecture with microservices design principles.

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                              │
│                                                                 │
│  ┌──────────────┐         ┌──────────────┐                    │
│  │   Chrome     │         │   Web        │                    │
│  │  Extension   │         │  Dashboard   │                    │
│  │  (React UI)  │         │  (React SPA) │                    │
│  └──────┬───────┘         └──────┬───────┘                    │
└─────────┼──────────────────────────┼──────────────────────────┘
          │                          │
          │         HTTPS/REST API   │
          └───────────┬──────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Express.js Backend Server                     │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │  API Gateway (Routes & Middleware)                 │ │  │
│  │  │  • Authentication (JWT)                            │ │  │
│  │  │  • Rate Limiting                                   │ │  │
│  │  │  • Security Headers (Helmet)                       │ │  │
│  │  │  • CORS                                            │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │  Controllers (Business Logic)                      │ │  │
│  │  │  • Auth      • Sessions    • Activities           │ │  │
│  │  │  • Screenshots  • Settings  • Dashboard           │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │  Services (Core Features)                          │ │  │
│  │  │  • AI Service (Gemini Vision)                     │ │  │
│  │  │  • File Upload Service                            │ │  │
│  │  │  • Logging Service                                │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                               │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              MongoDB Database                            │  │
│  │                                                          │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐             │  │
│  │  │  Users   │  │ Sessions │  │Activities│             │  │
│  │  └──────────┘  └──────────┘  └──────────┘             │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐             │  │
│  │  │Screenshots│  │ Settings │  │   Logs   │             │  │
│  │  └──────────┘  └──────────┘  └──────────┘             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              File System Storage                         │  │
│  │              (Screenshots & Logs)                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### 1. Chrome Extension (Frontend)

```
extension/
├── Popup UI (React)
│   ├── Authentication
│   ├── Session Control
│   └── Status Display
│
├── Background Worker
│   ├── Alarm Management
│   ├── Screenshot Capture
│   ├── API Communication
│   └── State Management
│
└── Content Script
    └── DOM Interaction
```

**Technology Stack:**
- React 18 + TypeScript
- Chrome Extension API (Manifest V3)
- Local Storage API
- Vite Build Tool

**Key Features:**
- Service Worker for background tasks
- Message passing between components
- Persistent state management
- Real-time UI updates

---

### 2. Backend API (Application Server)

```
server/
├── Routes Layer
│   ├── Auth Routes
│   ├── Session Routes
│   ├── Activity Routes
│   ├── Screenshot Routes
│   ├── Settings Routes
│   └── Dashboard Routes
│
├── Middleware Layer
│   ├── Authentication (JWT)
│   ├── Rate Limiting
│   ├── Validation
│   └── Error Handling
│
├── Controller Layer
│   ├── Request Validation
│   ├── Business Logic
│   └── Response Formatting
│
├── Service Layer
│   ├── AI Processing
│   ├── File Management
│   └── Logging
│
└── Data Access Layer
    ├── Mongoose Models
    └── Database Queries
```

**Technology Stack:**
- Node.js 20 + TypeScript
- Express.js Framework
- Mongoose ODM
- Winston Logger
- Multer (File Upload)
- JWT Authentication
- Google Generative AI

**Design Patterns:**
- MVC (Model-View-Controller)
- Repository Pattern
- Middleware Pattern
- Dependency Injection

---

### 3. Dashboard (Web Frontend)

```
dashboard/
├── Pages
│   ├── Login/Register
│   ├── Dashboard Overview
│   ├── Sessions List
│   ├── Activity Timeline
│   ├── Screenshot Viewer
│   ├── Analytics
│   └── Settings
│
├── Components
│   ├── Navigation
│   ├── Cards & Panels
│   ├── Forms
│   ├── Tables
│   └── Charts
│
└── Services
    └── API Client
```

**Technology Stack:**
- React 18 + TypeScript
- Vite Build Tool
- Custom CSS (Glassmorphism)
- Fetch API

**Architecture Pattern:**
- Component-based architecture
- State management with hooks
- Service layer for API calls
- Responsive design

---

## Data Flow

### Screenshot Capture & Analysis Flow

```
1. USER ACTION
   │
   ├─> Extension: User clicks "Start Monitoring"
   │
2. SESSION START
   │
   ├─> Backend: POST /api/sessions/start
   │   └─> MongoDB: Create Session document
   │   └─> Return: Session ID
   │
3. PERIODIC CAPTURE (Background Worker)
   │
   ├─> Chrome API: tabs.captureVisibleTab()
   │   └─> Convert to Blob
   │
4. UPLOAD & ANALYZE
   │
   ├─> Backend: POST /api/activities/analyze
   │   ├─> Multer: Save file to disk
   │   ├─> MongoDB: Create Screenshot document
   │   ├─> AI Service: analyzeScreen()
   │   │   ├─> Option A: Gemini Vision API
   │   │   └─> Option B: Mock Analysis
   │   ├─> MongoDB: Create Activity document
   │   └─> Link: Activity ↔ Screenshot
   │
5. DASHBOARD DISPLAY
   │
   └─> Frontend: Poll or refresh
       └─> Backend: GET /api/activities
           └─> MongoDB: Query Activities
               └─> Return: Activities with populated screenshots
```

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────┐         ┌───────────┐
│  Users   │────────>│ Settings  │
└────┬─────┘         └───────────┘
     │
     │ 1:N
     │
┌────▼─────┐
│ Sessions │
└────┬─────┘
     │
     │ 1:N
     │
┌────▼──────┐        ┌─────────────┐
│Activities │───────>│ Screenshots │
└───────────┘   1:1  └─────────────┘

┌──────┐
│ Logs │ (Independent audit trail)
└──────┘
```

### Collection Schemas

**Users**
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

**Sessions**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, indexed),
  status: String (enum: ['active', 'ended']),
  startTime: Date,
  endTime: Date,
  duration: Number,
  screenshotInterval: Number,
  createdAt: Date
}
```

**Activities**
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

---

## Security Architecture

### Authentication Flow

```
1. User Login
   │
   ├─> Frontend: Email + Password
   │
2. Backend Validation
   │
   ├─> Find user by email
   ├─> bcrypt.compare(password, hash)
   ├─> Generate JWT token
   │   └─> Payload: { id, role }
   │   └─> Expiry: 7 days
   │
3. Token Storage
   │
   ├─> Extension: chrome.storage.local
   ├─> Dashboard: localStorage
   │
4. Protected Requests
   │
   ├─> Header: Authorization: Bearer <token>
   ├─> Middleware: Verify JWT
   ├─> Attach user to request
   │
5. Token Validation
   │
   └─> jwt.verify(token, secret)
       ├─> Valid: Continue
       └─> Invalid: 401 Unauthorized
```

### Security Layers

1. **Transport Security**
   - HTTPS (Production)
   - Secure headers (Helmet)
   - CORS policies

2. **Authentication**
   - JWT tokens (7-day expiry)
   - bcrypt hashing (10 rounds)
   - No plain-text passwords

3. **Authorization**
   - Role-based access (User/Admin)
   - Resource ownership checks
   - Session validation

4. **Input Validation**
   - Request sanitization
   - File type validation
   - Size limits (5MB)

5. **Rate Limiting**
   - 200 req/15min (general)
   - 30 req/15min (auth)

---

## Scalability Considerations

### Current Architecture
- Monolithic backend
- Single database instance
- File system storage

### Future Scaling Options

1. **Horizontal Scaling**
   ```
   Load Balancer
        │
   ┌────┼────┐
   │    │    │
   API  API  API (Multiple instances)
   ```

2. **Database Scaling**
   - MongoDB Replica Set
   - Sharding for large datasets
   - Read replicas

3. **Storage Scaling**
   - Cloud storage (S3, GCS)
   - CDN for screenshots
   - Distributed file system

4. **Microservices**
   - Separate AI processing service
   - Dedicated file upload service
   - Analytics service

---

## Technology Decisions

### Why TypeScript?
- Type safety
- Better IDE support
- Reduced runtime errors
- Enhanced maintainability

### Why MongoDB?
- Flexible schema
- Document-based (natural fit for JSON data)
- Excellent Node.js support
- Easy horizontal scaling

### Why React?
- Component reusability
- Large ecosystem
- Virtual DOM performance
- Hooks for state management

### Why Express?
- Minimalist and flexible
- Large middleware ecosystem
- TypeScript support
- Proven at scale

### Why Docker?
- Consistent environments
- Easy deployment
- Service isolation
- Simple scaling

---

## Performance Optimization

### Backend
- Database indexing on frequently queried fields
- Pagination for large datasets
- Efficient queries (lean(), select())
- File streaming for large downloads
- Rate limiting to prevent abuse

### Frontend
- Code splitting
- Lazy loading
- Image optimization
- Caching strategies
- Debounced searches

### Database
- Compound indexes
- Text indexes for search
- Connection pooling
- Query optimization

---

## Monitoring & Logging

### Application Logs
- Winston logger
- Multiple transports (console, file)
- Log levels (error, warn, info, debug)
- Structured logging

### Database Logs
- Audit trail in Logs collection
- User actions tracking
- Error logging

### Metrics to Monitor
- API response times
- Error rates
- Database query performance
- File upload success rate
- Active user sessions

---

## Deployment Architecture

### Docker Compose Setup

```
┌─────────────────────────────────────────┐
│           Docker Host                   │
│                                         │
│  ┌────────────┐    ┌────────────┐     │
│  │  MongoDB   │<───│  Backend   │     │
│  │  Container │    │  Container │     │
│  │  (Port 27017)   │ (Port 5000)│     │
│  └────────────┘    └────────────┘     │
│                           │            │
│                    ┌──────▼──────┐    │
│                    │  Dashboard  │    │
│                    │  Container  │    │
│                    │  (Port 80)  │    │
│                    └─────────────┘    │
│                                       │
│  Volumes:                             │
│  • mongo_data                         │
│  • uploads_data                       │
│  • logs_data                          │
└───────────────────────────────────────┘
```

---

For more details, see:
- [README.md](./README.md) - Complete documentation
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API reference
- [SECURITY.md](./SECURITY.md) - Security policies
