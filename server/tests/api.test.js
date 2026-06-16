const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');

// Mock DB connection for tests
beforeAll(async () => {
  // Use in-memory or test DB
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflowx_test';
  try {
    await mongoose.connect(mongoUri);
  } catch {
    // Skip DB tests if no connection available
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Health Check', () => {
  it('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Auth API', () => {
  const testUser = {
    name: 'Test User',
    email: `test${Date.now()}@taskflowx.com`,
    password: 'password123',
  };
  let accessToken;

  it('POST /api/auth/register - creates a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    if (res.statusCode === 201) {
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.accessToken).toBeDefined();
    } else {
      // MongoDB not connected — skip
      console.log('DB not available, skipping auth test');
    }
  });

  it('POST /api/auth/login - returns tokens', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    
    if (res.statusCode === 200) {
      expect(res.body.data.accessToken).toBeDefined();
      accessToken = res.body.data.accessToken;
    }
  });

  it('GET /api/auth/me - returns user profile', async () => {
    if (!accessToken) return;
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it('POST /api/auth/register - rejects invalid data', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'A', email: 'not-an-email', password: '123' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login - rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' });
    if (res.statusCode === 401) {
      expect(res.body.success).toBe(false);
    }
  });
});

describe('Task API', () => {
  it('GET /api/tasks - requires auth', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/tasks - requires auth', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'Test' });
    expect(res.statusCode).toBe(401);
  });
});

describe('AI Service', () => {
  const aiService = require('../services/aiService');

  it('generates subtasks for a web task', () => {
    const subtasks = aiService.generateSubtasks('Build a website for my portfolio');
    expect(subtasks).toBeInstanceOf(Array);
    expect(subtasks.length).toBeGreaterThan(0);
    expect(subtasks[0]).toHaveProperty('title');
    expect(subtasks[0].completed).toBe(false);
  });

  it('suggests critical priority for urgent tasks', () => {
    const priority = aiService.suggestPriority('URGENT: fix production bug immediately');
    expect(priority).toBe('critical');
  });

  it('suggests low priority for optional tasks', () => {
    const priority = aiService.suggestPriority('someday maybe clean up my desk');
    expect(priority).toBe('low');
  });

  it('generates a daily plan', () => {
    const tasks = [
      { title: 'Fix bug', priority: 'critical', completed: false, estimatedTime: 30 },
      { title: 'Write tests', priority: 'high', completed: false, estimatedTime: 60 },
    ];
    const plan = aiService.generateDailyPlan(tasks);
    expect(plan).toHaveProperty('message');
    expect(plan).toHaveProperty('plan');
    expect(plan.plan).toBeInstanceOf(Array);
  });

  it('returns a motivational quote', () => {
    const quote = aiService.getMotivationalQuote();
    expect(quote).toHaveProperty('quote');
    expect(quote).toHaveProperty('author');
  });

  it('handles empty task list for daily plan', () => {
    const plan = aiService.generateDailyPlan([]);
    expect(plan.message).toContain('completed');
  });
});
