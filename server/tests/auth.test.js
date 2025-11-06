// server/tests/auth.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const User = require('../../src/models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany();
});

describe('POST /api/auth/register', () => {
  it('should register a new user', async () => {
    const userData = {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123'
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('username', userData.username);
    expect(res.body.user).toHaveProperty('email', userData.email);
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('should return 400 for duplicate email', async () => {
    const userData = {
      username: 'user1',
      email: 'duplicate@example.com',
      password: 'password123'
    };

    await User.create(userData);

    const res = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Email already exists');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('should login with valid credentials', async () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(credentials);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', credentials.email);
  });

  it('should return 401 for invalid password', async () => {
    const credentials = {
      email: 'test@example.com',
      password: 'wrongpassword'
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(credentials);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Invalid credentials');
  });
});