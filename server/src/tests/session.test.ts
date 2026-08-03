import request from 'supertest';
import app from '../app';
import { connectTestDB, clearTestDB, disconnectTestDB } from './dbHandler';
import Session from '../database/models/Session';

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

describe('Session API Integration Tests', () => {
  const credentials = {
    email: 'sessionuser@example.com',
    password: 'password123',
  };

  let jwtToken: string;

  beforeEach(async () => {
    // Register user to obtain active auth token
    const res = await request(app)
      .post('/api/auth/register')
      .send(credentials);
    jwtToken = res.body.token;
  });

  test('POST /api/sessions/start - Should start a session successfully', async () => {
    const res = await request(app)
      .post('/api/sessions/start')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.session.status).toBe('active');
    expect(res.body.session.startTime).toBeDefined();

    // Verify session in db
    const activeSession = await Session.findOne({ status: 'active' });
    expect(activeSession).toBeTruthy();
    expect(activeSession?._id.toString()).toBe(res.body.session._id);
  });

  test('POST /api/sessions/end - Should end active session successfully', async () => {
    // Start session
    const startRes = await request(app)
      .post('/api/sessions/start')
      .set('Authorization', `Bearer ${jwtToken}`);
    const sessionId = startRes.body.session._id;

    // End session
    const endRes = await request(app)
      .post('/api/sessions/end')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ sessionId });

    expect(endRes.status).toBe(200);
    expect(endRes.body.success).toBe(true);
    expect(endRes.body.session.status).toBe('ended');
    expect(endRes.body.session.endTime).toBeDefined();
    expect(endRes.body.session.duration).toBeDefined();

    // Verify ended session in db
    const sessionInDb = await Session.findById(sessionId);
    expect(sessionInDb?.status).toBe('ended');
    expect(sessionInDb?.endTime).toBeTruthy();
  });

  test('GET /api/sessions - Should return paginated sessions list', async () => {
    // Create multiple mock sessions
    await request(app)
      .post('/api/sessions/start')
      .set('Authorization', `Bearer ${jwtToken}`);

    const res = await request(app)
      .get('/api/sessions')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.sessions).toBeInstanceOf(Array);
    expect(res.body.sessions.length).toBe(1);
    expect(res.body.pagination.total).toBe(1);
  });
});
