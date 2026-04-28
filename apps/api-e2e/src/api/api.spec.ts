import axios from 'axios';

const BASE = process.env['API_BASE_URL'] ?? 'http://localhost:3000/api';

describe('Auth API (E2E)', () => {
  it('POST /auth/login — should reject invalid credentials', async () => {
    try {
      await axios.post(`${BASE}/auth/login`, {
        email: 'nobody@example.com',
        password: 'wrong',
      });
      fail('Expected 401');
    } catch (err: unknown) {
      const e = err as { response?: { status: number } };
      expect(e.response?.status).toBe(401);
    }
  });

  it('POST /auth/login — should return a token for valid credentials', async () => {
    const res = await axios.post(`${BASE}/auth/login`, {
      email: 'owner@acme.com',
      password: 'Password123!',
    });
    expect(res.status).toBe(201);
    expect(res.data.accessToken).toBeTruthy();
    expect(res.data.user.role).toBe('owner');
  });

  it('GET /tasks — should require authentication', async () => {
    try {
      await axios.get(`${BASE}/tasks`);
      fail('Expected 401');
    } catch (err: unknown) {
      const e = err as { response?: { status: number } };
      expect(e.response?.status).toBe(401);
    }
  });
});
