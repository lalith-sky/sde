import request from 'supertest';
import app from '../app';
import { connectTestDB, clearTestDB, disconnectTestDB } from './dbHandler';
import User from '../database/models/User';

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

describe('Authentication API Integration Tests', () => {
  const testUser = {
    email: 'testuser@example.com',
    password: 'password123',
  };

  test('POST /api/auth/register - Should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email.toLowerCase());
    
    // Assert in database
    const userInDb = await User.findOne({ email: testUser.email });
    expect(userInDb).toBeTruthy();
    expect(userInDb?.role).toBe('user');
  });

  test('POST /api/auth/register - Should return 400 for duplicate email registration', async () => {
    // Register first user
    await request(app).post('/api/auth/register').send(testUser);

    // Register second user with same details
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already exists');
  });

  test('POST /api/auth/login - Should login user successfully with valid credentials', async () => {
    // Register test user
    await request(app).post('/api/auth/register').send(testUser);

    // Login test user
    const res = await request(app)
      .post('/api/auth/login')
      .send(testUser);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email.toLowerCase());
  });

  test('POST /api/auth/login - Should fail login with incorrect password', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid credentials');
  });
});
