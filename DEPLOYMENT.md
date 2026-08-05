# 🚀 Visual AI Agent - Deployment Guide

Complete guide to deploy your Visual AI Agent application to production.

---

## 📋 Table of Contents

1. [Quick Deploy Options](#quick-deploy-options)
2. [Docker Deployment (Recommended)](#docker-deployment)
3. [Cloud Platform Deployment](#cloud-platform-deployment)
4. [Manual VPS Deployment](#manual-vps-deployment)
5. [Environment Variables](#environment-variables)
6. [Chrome Extension Publishing](#chrome-extension-publishing)

---

## 🎯 Quick Deploy Options

### Option 1: Docker Compose (Easiest)
**Best for:** Quick production deployment with all services together
**Time:** 5-10 minutes
**Cost:** $5-20/month (VPS)

### Option 2: Render + Vercel (Free Tier Available)
**Best for:** Separate frontend/backend deployment
**Time:** 15-20 minutes
**Cost:** Free tier available

### Option 3: AWS/DigitalOcean (Scalable)
**Best for:** Production-grade, scalable deployment
**Time:** 30-60 minutes
**Cost:** $10-50/month

---

## 🐳 Docker Deployment (Recommended)

### Prerequisites
- Docker installed
- Docker Compose installed
- Domain name (optional but recommended)

### Step 1: Update docker-compose.yml

```yaml
version: '3.8'

services:
  # Backend API Server
  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - MONGO_URI=${MONGO_URI}
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped

  # Frontend Dashboard
  dashboard:
    build:
      context: ./dashboard
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=https://your-domain.com
    depends_on:
      - server
    restart: unless-stopped

volumes:
  uploads:
```

### Step 2: Create Production Environment File

Create `.env.production` in the root:

```bash
# MongoDB Connection (Use MongoDB Atlas for production)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/visual-ai-agent?retryWrites=true&w=majority

# JWT Secret (Generate a strong secret)
JWT_SECRET=your-super-secure-random-string-min-32-chars

# Node Environment
NODE_ENV=production

# Server Port
PORT=5000

# Optional: Gemini API Key
GEMINI_API_KEY=your-gemini-api-key-here
```

### Step 3: Build and Deploy

```bash
# Build all Docker images
docker-compose build

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Step 4: Access Your Application

- **Dashboard**: http://your-server-ip or http://your-domain.com
- **API**: http://your-server-ip:5000

---

## ☁️ Cloud Platform Deployment

### Option A: Render.com (Free Tier)

#### Deploy Backend (Node.js API)

1. **Go to [render.com](https://render.com)** and sign in with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `visual-ai-agent-api`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install && npm run build`
   - **Start Command**: `cd server && npm start`
   - **Instance Type**: Free or Starter ($7/month)

5. **Add Environment Variables**:
   ```
   NODE_ENV=production
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=your-secret-here
   PORT=5000
   ```

6. Click **"Create Web Service"**

7. Copy your backend URL: `https://visual-ai-agent-api.onrender.com`

#### Deploy Frontend (React Dashboard)

1. **Go to [vercel.com](https://vercel.com)** or use Render again
2. Click **"Add New Project"**
3. Import from GitHub
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `dashboard`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Add Environment Variable**:
   ```
   VITE_API_URL=https://visual-ai-agent-api.onrender.com
   ```

6. Deploy!

7. Your dashboard will be live at: `https://your-project.vercel.app`

---

### Option B: Railway.app (Easy + Free Tier)

1. **Go to [railway.app](https://railway.app)**
2. Sign in with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository
5. Railway auto-detects both services
6. Add environment variables
7. Deploy!

---

### Option C: Heroku

#### Backend Deployment

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create visual-ai-agent-api

# Set environment variables
heroku config:set MONGO_URI="mongodb+srv://..."
heroku config:set JWT_SECRET="your-secret"
heroku config:set NODE_ENV=production

# Create Procfile in root
echo "web: cd server && npm start" > Procfile

# Deploy
git push heroku master
```

#### Frontend Deployment

Deploy to Vercel (see Option A above) or Netlify

---

## 🖥️ Manual VPS Deployment (DigitalOcean/AWS/Linode)

### Step 1: Setup VPS

```bash
# SSH into your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install PM2 (Process Manager)
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install Git
apt install -y git
```

### Step 2: Clone and Setup

```bash
# Clone repository
cd /var/www
git clone https://github.com/lalith-sky/sde.git
cd sde

# Setup backend
cd server
npm install
npm run build

# Setup frontend
cd ../dashboard
npm install
npm run build

# Create .env file
cd ../server
nano .env
# Add your environment variables
```

### Step 3: Start with PM2

```bash
# Start backend
cd /var/www/sde/server
pm2 start dist/index.js --name "visual-ai-api"

# Save PM2 configuration
pm2 save
pm2 startup

# Check status
pm2 status
pm2 logs visual-ai-api
```

### Step 4: Configure Nginx

```bash
# Create Nginx config
nano /etc/nginx/sites-available/visual-ai-agent
```

Add this configuration:

```nginx
# Backend API
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend Dashboard
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    root /var/www/sde/dashboard/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart Nginx:

```bash
# Enable site
ln -s /etc/nginx/sites-available/visual-ai-agent /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

### Step 5: Setup SSL with Let's Encrypt

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d your-domain.com -d www.your-domain.com -d api.your-domain.com

# Auto-renewal is setup automatically
certbot renew --dry-run
```

---

## 🌍 Environment Variables

### Production Environment Variables

Create `.env` in `server/` directory:

```bash
# Required
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=generate-a-strong-random-32-char-secret-here

# Optional but recommended
GEMINI_API_KEY=your-gemini-api-key
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Rate Limiting (optional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Generate Secure JWT Secret

```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 32
```

---

## 📦 Chrome Extension Publishing

### Step 1: Prepare Extension

```bash
cd extension
npm run build

# Zip the dist folder
cd dist
zip -r ../visual-ai-agent-extension.zip .
```

### Step 2: Create Chrome Web Store Account

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay one-time $5 registration fee
3. Click **"New Item"**

### Step 3: Upload Extension

1. Upload `visual-ai-agent-extension.zip`
2. Fill in details:
   - **Name**: Visual AI Agent Monitor
   - **Description**: (use description from manifest.json)
   - **Category**: Productivity
   - **Language**: English
3. Add screenshots (1280x800 or 640x400)
4. Add promotional images
5. Set privacy policy URL
6. Submit for review (usually takes 1-3 days)

### Step 4: Update Extension Backend URL

Before publishing, update the default backend URL in `extension/src/popup/Popup.tsx`:

```typescript
const DEFAULT_SERVER_URL = 'https://api.your-domain.com'; // Change this
```

---

## 🔍 Post-Deployment Checklist

### Backend Health Check

```bash
curl https://api.your-domain.com/
# Should return: {"message":"Visual AI Agent Backend API running successfully"}
```

### Frontend Test
- Visit https://your-domain.com
- Login should work
- Dashboard should load data

### Extension Test
- Install extension
- Update server URL in settings
- Start monitoring session
- Verify screenshots appear in dashboard

---

## 📊 Monitoring & Maintenance

### Setup Monitoring (Optional)

```bash
# Install monitoring tools
pm2 install pm2-logrotate

# Setup alerts
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### Backup Strategy

```bash
# MongoDB backup (if self-hosted)
mongodump --uri="mongodb+srv://..." --out=/backups/$(date +%Y%m%d)

# Code backup (already on GitHub)
git push origin master
```

### Update Deployment

```bash
# Pull latest code
cd /var/www/sde
git pull origin master

# Rebuild backend
cd server
npm install
npm run build
pm2 restart visual-ai-api

# Rebuild frontend
cd ../dashboard
npm install
npm run build
```

---

## 💰 Cost Estimates

### Free Tier Option
- **Backend**: Render.com (Free tier - spins down after inactivity)
- **Frontend**: Vercel (Free tier - unlimited bandwidth)
- **Database**: MongoDB Atlas (Free tier - 512MB)
- **Total**: $0/month ⚠️ (Limited resources)

### Budget Option
- **VPS**: DigitalOcean Droplet ($6/month)
- **Database**: MongoDB Atlas (Free tier)
- **Domain**: Namecheap ($10/year)
- **Total**: ~$7/month

### Production Option
- **VPS**: DigitalOcean ($24/month) or AWS EC2
- **Database**: MongoDB Atlas Dedicated ($57/month)
- **CDN**: Cloudflare (Free)
- **Total**: ~$80/month

---

## 🆘 Troubleshooting

### Common Issues

**Issue: Can't connect to database**
- Check MONGO_URI is correct
- Whitelist IP address in MongoDB Atlas

**Issue: CORS errors**
- Update ALLOWED_ORIGINS in .env
- Check API URL in dashboard

**Issue: Extension can't connect**
- Update server URL in extension settings
- Check HTTPS is enabled

**Issue: High memory usage**
- Limit screenshot upload size
- Clean old uploads regularly
- Use PM2 cluster mode

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Render Deployment Guide](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/)
- [Chrome Extension Publishing](https://developer.chrome.com/docs/webstore/publish/)

---

## 🎉 You're Ready!

Choose your deployment method and follow the steps above. For most users, I recommend:

1. **For Testing**: Docker Compose locally
2. **For Free Hosting**: Render + Vercel
3. **For Production**: VPS with Nginx + PM2

Good luck with your deployment! 🚀
