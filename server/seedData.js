const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/visual-ai-agent';

// Define schemas inline
const UserSchema = new mongoose.Schema({
  email: String,
  password: String
});

const SessionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  startTime: Date,
  endTime: Date,
  duration: Number,
  status: String,
  screenshotInterval: Number,
  captureMode: String
});

const ScreenshotSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  sessionId: mongoose.Schema.Types.ObjectId,
  timestamp: Date,
  imageUrl: String,
  fileName: String,
  fileSize: Number,
  mimeType: String
});

const ActivitySchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  sessionId: mongoose.Schema.Types.ObjectId,
  screenshotId: mongoose.Schema.Types.ObjectId,
  timestamp: Date,
  pageTitle: String,
  url: String,
  summary: String,
  detectedTexts: [String],
  confidence: Number
});

const User = mongoose.model('User', UserSchema);
const Session = mongoose.model('Session', SessionSchema);
const Screenshot = mongoose.model('Screenshot', ScreenshotSchema);
const Activity = mongoose.model('Activity', ActivitySchema);

async function seedDemoData() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ email: 'nothing@gmail.com' });
    if (!user) {
      console.log('❌ User not found. Please login first.');
      process.exit(1);
    }
    console.log('✅ Found user:', user.email);

    const userId = user._id;

    console.log('🗑️  Clearing existing demo data...');
    await Session.deleteMany({ userId });
    await Activity.deleteMany({ userId });
    await Screenshot.deleteMany({ userId });

    console.log('📦 Creating demo sessions...');

    const sessions = [];
    for (let i = 0; i < 5; i++) {
      const startTime = new Date(Date.now() - (i + 1) * 3600000);
      const endTime = i < 2 ? null : new Date(startTime.getTime() + 1800000);
      const duration = endTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : null;

      const session = await Session.create({
        userId,
        startTime,
        endTime,
        duration,
        status: i < 2 ? 'active' : 'ended',
        screenshotInterval: 10,
        captureMode: 'active_tab'
      });
      sessions.push(session);
      console.log(`  ✓ Session ${i + 1}: ${session.status}`);
    }

    console.log('📸 Creating demo screenshots and activities...');

    let totalActivities = 0;
    let totalScreenshots = 0;

    for (const session of sessions) {
      const activityCount = Math.floor(Math.random() * 10) + 5;

      for (let i = 0; i < activityCount; i++) {
        const timestamp = new Date(session.startTime.getTime() + i * 15000);

        const screenshot = await Screenshot.create({
          userId,
          sessionId: session._id,
          timestamp,
          imageUrl: `/uploads/demo-screenshot-${session._id}-${i}.png`,
          fileName: `demo-screenshot-${session._id}-${i}.png`,
          fileSize: Math.floor(Math.random() * 500000) + 100000,
          mimeType: 'image/png'
        });
        totalScreenshots++;

        const pages = [
          { title: 'Google Search - AI Agents', url: 'https://www.google.com/search?q=ai+agents', summary: 'Searching for information about AI agents and automation' },
          { title: 'GitHub - Visual AI Agent', url: 'https://github.com/user/visual-ai-agent', summary: 'Reviewing Visual AI Agent repository code and documentation' },
          { title: 'Stack Overflow - React Questions', url: 'https://stackoverflow.com/questions/tagged/react', summary: 'Reading React.js development questions and solutions' },
          { title: 'VS Code - App.tsx', url: 'vscode://file/project/src/App.tsx', summary: 'Editing main application component in Visual Studio Code' },
          { title: 'MongoDB Atlas Dashboard', url: 'https://cloud.mongodb.com/dashboard', summary: 'Managing database collections and monitoring performance' },
          { title: 'YouTube - AI Tutorial', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', summary: 'Watching advanced AI development tutorial video' },
          { title: 'npm Documentation', url: 'https://docs.npmjs.com/', summary: 'Reading package manager documentation for dependencies' },
          { title: 'Discord - Dev Community', url: 'https://discord.com/channels/server', summary: 'Discussing project architecture in developer community' },
          { title: 'Figma - Dashboard UI', url: 'https://www.figma.com/file/dashboard-ui', summary: 'Designing user interface mockups in Figma' },
          { title: 'LinkedIn Feed', url: 'https://www.linkedin.com/feed/', summary: 'Browsing professional network and industry updates' }
        ];

        const page = pages[Math.floor(Math.random() * pages.length)];
        const detectedTexts = ['Login', 'Dashboard', 'Submit', 'Search', 'Profile', 'Settings', 'Home', 'Logout'];
        const confidence = 0.85 + Math.random() * 0.14;

        await Activity.create({
          userId,
          sessionId: session._id,
          screenshotId: screenshot._id,
          timestamp,
          pageTitle: page.title,
          url: page.url,
          summary: page.summary,
          detectedTexts: detectedTexts.slice(0, Math.floor(Math.random() * 4) + 2),
          confidence
        });
        totalActivities++;
      }
    }

    console.log(`✅ Created ${sessions.length} sessions`);
    console.log(`✅ Created ${totalScreenshots} screenshots`);
    console.log(`✅ Created ${totalActivities} activities`);
    console.log('🎉 Demo data seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

seedDemoData();
