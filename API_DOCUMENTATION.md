# 📡 API Documentation

Complete REST API documentation for Visual AI Agent backend.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All endpoints return JSON with the following structure:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Endpoints

### Authentication

#### Register User
Create a new user account.

**Endpoint:** `POST /auth/register`  
**Authentication:** None  
**Rate Limit:** 30 requests per 15 minutes

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "role": "user"  // optional: "user" or "admin", default: "user"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "user"
  }
}
```

**Errors:**
- `400` - Email or password missing
- `400` - User already exists

---

#### Login
Authenticate and receive JWT token.

**Endpoint:** `POST /auth/login`  
**Authentication:** None  
**Rate Limit:** 30 requests per 15 minutes

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "user"
  }
}
```

**Errors:**
- `400` - Email or password missing
- `401` - Invalid credentials
- `403` - Account suspended

---

#### Get Current User
Retrieve authenticated user's profile.

**Endpoint:** `GET /auth/me`  
**Authentication:** Required  

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "user",
    "status": "active",
    "createdAt": "2024-08-03T10:30:00.000Z"
  }
}
```

**Errors:**
- `401` - Not authorized
- `404` - User not found

---

### Sessions

#### Start Monitoring Session
Start a new monitoring session.

**Endpoint:** `POST /sessions/start`  
**Authentication:** Required  

**Request Body:** None (uses user's settings for interval)

**Response:** `201 Created`
```json
{
  "success": true,
  "session": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "status": "active",
    "startTime": "2024-08-03T10:30:00.000Z",
    "screenshotInterval": 10,
    "createdAt": "2024-08-03T10:30:00.000Z"
  }
}
```

**Notes:**
- Automatically ends any existing active session
- Uses screenshot interval from user settings

---

#### End Monitoring Session
Stop an active monitoring session.

**Endpoint:** `POST /sessions/end`  
**Authentication:** Required  

**Request Body:**
```json
{
  "sessionId": "507f1f77bcf86cd799439011"  // optional
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "session": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "status": "ended",
    "startTime": "2024-08-03T10:30:00.000Z",
    "endTime": "2024-08-03T11:30:00.000Z",
    "duration": 3600,  // seconds
    "screenshotInterval": 10
  }
}
```

**Notes:**
- If `sessionId` not provided, ends the user's latest active session
- Calculates duration automatically

---

#### List Sessions
Get paginated list of sessions.

**Endpoint:** `GET /sessions`  
**Authentication:** Required  

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page

**Example:** `GET /sessions?page=1&limit=10`

**Response:** `200 OK`
```json
{
  "success": true,
  "sessions": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": {
        "_id": "507f191e810c19729de860ea",
        "email": "user@example.com"
      },
      "status": "ended",
      "startTime": "2024-08-03T10:30:00.000Z",
      "endTime": "2024-08-03T11:30:00.000Z",
      "duration": 3600,
      "screenshotInterval": 10
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

**Notes:**
- Regular users see only their sessions
- Admins see all sessions

---

### Activities

#### Analyze Screenshot
Upload and analyze a screenshot using AI.

**Endpoint:** `POST /activities/analyze`  
**Authentication:** Required  
**Content-Type:** `multipart/form-data`

**Form Data:**
- `screenshot` (file, required) - Image file (max 5MB)
- `sessionId` (string, required) - Active session ID
- `pageTitle` (string, required) - Browser tab title
- `url` (string, required) - Current page URL

**Response:** `201 Created`
```json
{
  "success": true,
  "activity": {
    "_id": "507f1f77bcf86cd799439011",
    "sessionId": "507f191e810c19729de860ea",
    "userId": "507f191e810c19729de860eb",
    "timestamp": "2024-08-03T10:35:00.000Z",
    "pageTitle": "GitHub - Repository",
    "url": "https://github.com/username/repo",
    "summary": "User is reviewing code changes in a GitHub repository",
    "detectedTexts": [
      "Pull Requests",
      "Issues",
      "Code",
      "Commits"
    ],
    "confidence": 0.95,
    "screenshotId": "507f191e810c19729de860ec"
  }
}
```

**Errors:**
- `400` - Missing required fields
- `404` - Session not found

---

#### List Activities
Get filtered and paginated activities.

**Endpoint:** `GET /activities`  
**Authentication:** Required  

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `sessionId` (string, optional) - Filter by session
- `q` (string, optional) - Text search query
- `startDate` (ISO date, optional) - Start date filter
- `endDate` (ISO date, optional) - End date filter

**Example:** `GET /activities?page=1&limit=10&sessionId=507f1f77bcf86cd799439011&q=github`

**Response:** `200 OK`
```json
{
  "success": true,
  "activities": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "sessionId": "507f191e810c19729de860ea",
      "userId": "507f191e810c19729de860eb",
      "timestamp": "2024-08-03T10:35:00.000Z",
      "pageTitle": "GitHub - Repository",
      "url": "https://github.com/username/repo",
      "summary": "User is reviewing code changes",
      "detectedTexts": ["Pull Requests", "Code"],
      "confidence": 0.95,
      "screenshotId": {
        "_id": "507f191e810c19729de860ec",
        "filename": "screenshot-123456789.jpg"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```

---

#### Get Activity Timeline
Get chronological activities for a session.

**Endpoint:** `GET /activities/timeline`  
**Authentication:** Required  

**Query Parameters:**
- `sessionId` (string, required) - Session ID

**Example:** `GET /activities/timeline?sessionId=507f1f77bcf86cd799439011`

**Response:** `200 OK`
```json
{
  "success": true,
  "session": {
    "_id": "507f1f77bcf86cd799439011",
    "startTime": "2024-08-03T10:30:00.000Z",
    "endTime": "2024-08-03T11:30:00.000Z",
    "status": "ended"
  },
  "activities": [
    // Array of activities in chronological order
  ]
}
```

**Errors:**
- `400` - sessionId required
- `403` - Unauthorized access to session
- `404` - Session not found

---

### Screenshots

#### Get Screenshot File
Retrieve a screenshot image file.

**Endpoint:** `GET /screenshots/:id`  
**Authentication:** Required  

**Response:** Image file (JPEG/PNG)

**Errors:**
- `403` - Unauthorized access
- `404` - Screenshot not found
- `404` - Physical file not found

---

#### List Screenshots
Get paginated screenshot metadata.

**Endpoint:** `GET /screenshots`  
**Authentication:** Required  

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `sessionId` (string, optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "screenshots": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "sessionId": "507f191e810c19729de860ea",
      "filename": "screenshot-123456789.jpg",
      "filepath": "/app/uploads/screenshot-123456789.jpg",
      "mimeType": "image/jpeg",
      "size": 245760,
      "createdAt": "2024-08-03T10:35:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

---

### Settings

#### Get User Settings
Retrieve current user's settings.

**Endpoint:** `GET /settings`  
**Authentication:** Required  

**Response:** `200 OK`
```json
{
  "success": true,
  "settings": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "screenshotInterval": 10,
    "captureMode": "active_tab",
    "aiConfidenceThreshold": 0.7,
    "geminiApiKey": "",
    "createdAt": "2024-08-03T10:30:00.000Z"
  }
}
```

**Notes:**
- Settings are auto-created on first access if not exists

---

#### Update Settings
Update user preferences.

**Endpoint:** `POST /settings`  
**Authentication:** Required  

**Request Body:**
```json
{
  "screenshotInterval": 15,
  "captureMode": "active_tab",
  "aiConfidenceThreshold": 0.8,
  "geminiApiKey": "your_api_key_here"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "settings": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "screenshotInterval": 15,
    "captureMode": "active_tab",
    "aiConfidenceThreshold": 0.8,
    "geminiApiKey": "your_api_key_here"
  }
}
```

---

### Dashboard

#### Get Dashboard Statistics
Retrieve comprehensive dashboard analytics.

**Endpoint:** `GET /dashboard/stats`  
**Authentication:** Required  

**Response:** `200 OK`
```json
{
  "success": true,
  "stats": {
    "totalSessions": 25,
    "totalDuration": 90000,  // seconds
    "totalScreenshots": 450,
    "totalActivities": 450,
    "activeSession": {
      "id": "507f1f77bcf86cd799439011",
      "startTime": "2024-08-03T10:30:00.000Z",
      "screenshotInterval": 10
    },
    "topDomains": [
      {
        "domain": "github.com",
        "count": 125
      },
      {
        "domain": "stackoverflow.com",
        "count": 89
      }
    ]
  },
  "recentActivityFeed": [
    // Last 10 activities
  ],
  "systemLogs": [
    // Last 10 system logs
  ]
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## Rate Limiting

- **General API:** 200 requests per 15 minutes per IP
- **Auth endpoints:** 30 requests per 15 minutes per IP

Rate limit headers included in responses:
```
RateLimit-Limit: 200
RateLimit-Remaining: 150
RateLimit-Reset: 1234567890
```

---

## Examples

### Complete Flow Example

```javascript
// 1. Register
const registerRes = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securepass123'
  })
});
const { token } = await registerRes.json();

// 2. Start Session
const sessionRes = await fetch('http://localhost:5000/api/sessions/start', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
const { session } = await sessionRes.json();

// 3. Upload Screenshot
const formData = new FormData();
formData.append('screenshot', imageFile);
formData.append('sessionId', session._id);
formData.append('pageTitle', 'GitHub');
formData.append('url', 'https://github.com');

const analyzeRes = await fetch('http://localhost:5000/api/activities/analyze', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

// 4. Get Activities
const activitiesRes = await fetch('http://localhost:5000/api/activities?page=1&limit=10', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { activities } = await activitiesRes.json();
```

---

## Postman Collection

Import the API into Postman:

```json
{
  "info": {
    "name": "Visual AI Agent API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

---

For more information, see the [README.md](./README.md) and [QUICKSTART.md](./QUICKSTART.md).
