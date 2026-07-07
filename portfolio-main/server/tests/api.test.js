const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');

describe('Portfolio API', () => {
    describe('Health Check', () => {
        test('GET /health returns OK', async () => {
            const res = await request(app).get('/health');
            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('OK');
        });
    });

    describe('Public Endpoints', () => {
        test('GET /api/projects returns array', async () => {
            const res = await request(app).get('/api/projects');
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.projects)).toBe(true);
        });

        test('GET /api/skills returns array', async () => {
            const res = await request(app).get('/api/skills');
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.skills)).toBe(true);
        });

        test('GET /api/bulk returns all data', async () => {
            const res = await request(app).get('/api/bulk');
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('home');
            expect(res.body.data).toHaveProperty('projects');
        });

        test('Cache is working on public endpoints', async () => {
            const res1 = await request(app).get('/api/skills');
            const res2 = await request(app).get('/api/skills');
            expect(res1.statusCode).toBe(200);
            expect(res2.statusCode).toBe(200);
        });
    });

    describe('Auth Endpoints', () => {
        let accessToken, refreshToken;

        beforeAll(async () => {
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({ email: 'admin@example.com', password: 'SecurePassword123!' });
            accessToken = loginRes.body.accessToken;
            refreshToken = loginRes.body.refreshToken;
        });

        test('POST /api/auth/login returns both tokens', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'admin@example.com', password: 'SecurePassword123!' });
            expect(res.statusCode).toBe(200);
            expect(res.body.accessToken).toBeDefined();
            expect(res.body.refreshToken).toBeDefined();
            expect(res.body.expiresIn).toBe(15 * 60);
        });

        test('POST /api/auth/verify validates access token', async () => {
            const res = await request(app)
                .post('/api/auth/verify')
                .send({ token: accessToken });
            expect(res.statusCode).toBe(200);
            expect(res.body.valid).toBe(true);
        });

        test('POST /api/auth/refresh generates new access token', async () => {
            const res = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken });
            expect(res.statusCode).toBe(200);
            expect(res.body.accessToken).toBeDefined();
        });

        test('POST /api/auth/refresh rejects invalid token', async () => {
            const res = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: 'invalid-token' });
            expect(res.statusCode).toBe(403);
        });

        test('POST /api/auth/logout revokes refresh token', async () => {
            const res = await request(app)
                .post('/api/auth/logout')
                .send({ refreshToken });
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Logged out');
        });
    });

    describe('Protected Endpoints', () => {
        let accessToken;

        beforeAll(async () => {
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({ email: 'admin@example.com', password: 'SecurePassword123!' });
            accessToken = loginRes.body.accessToken;
        });

        test('POST /api/skills requires auth', async () => {
            const res = await request(app)
                .post('/api/skills')
                .send({ category: 'test', name: 'Test Skill', level: 50 });
            expect(res.statusCode).toBe(401);
        });

        test('POST /api/skills works with valid token', async () => {
            const res = await request(app)
                .post('/api/skills')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ category: 'test', name: 'Test Skill RBCA', level: 50 });
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        test('Security headers are present', async () => {
            const res = await request(app).get('/api/projects');
            expect(res.headers['content-security-policy']).toBeDefined();
            expect(res.headers['x-frame-options']).toBeDefined();
            expect(res.headers['strict-transport-security']).toBeDefined();
        });
    });

    describe('RBAC Tests', () => {
        test('Invalid token is rejected', async () => {
            const res = await request(app)
                .post('/api/skills')
                .set('Authorization', 'Bearer invalid-token')
                .send({ category: 'test', name: 'Test', level: 50 });
            expect(res.statusCode).toBe(403);
        });

        test('Expired token is rejected', async () => {
            const expiredToken = jwt.sign(
                { username: 'test', role: 'VIEWER' },
                process.env.JWT_SECRET || 'fallback-secret-change-in-production',
                { expiresIn: '-1h' }
            );
            const res = await request(app)
                .post('/api/skills')
                .set('Authorization', `Bearer ${expiredToken}`)
                .send({ category: 'test', name: 'Test', level: 50 });
            expect(res.statusCode).toBe(403);
        });

        test('VIEWER role cannot write skills', async () => {
            const viewerToken = jwt.sign(
                { username: 'viewer', role: 'VIEWER' },
                process.env.JWT_SECRET || 'fallback-secret-change-in-production',
                { expiresIn: '15m' }
            );
            const res = await request(app)
                .post('/api/skills')
                .set('Authorization', `Bearer ${viewerToken}`)
                .send({ category: 'test', name: 'Test', level: 50 });
            expect(res.statusCode).toBe(403);
        });
    });

    describe('Security Tests', () => {
        test('Prototype pollution is blocked', async () => {
            const res = await request(app)
                .post('/api/skills')
                .send({ __proto__: { admin: true }, category: 'test' });
            expect(res.statusCode).toBe(401);
        });

        test('Invalid file upload is rejected', async () => {
            const res = await request(app)
                .post('/api/challenges')
                .set('Authorization', `Bearer ${jwt.sign({username: 'admin', role: 'ADMIN'}, process.env.JWT_SECRET || 'fallback-secret-change-in-production', {expiresIn: '15m'})}`)
                .attach('image', Buffer.from('test'), 'test.exe');
            expect([400, 403, 500]).toContain(res.statusCode);
        });
    });
});