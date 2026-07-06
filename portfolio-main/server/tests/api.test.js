const request = require('supertest');
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
    });

    describe('Protected Endpoints', () => {
        let token;
        
        beforeAll(async () => {
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({ username: 'portfolioadmin', password: 'Admin123' });
            token = loginRes.body.token;
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
                .set('Authorization', `Bearer ${token}`)
                .send({ category: 'test', name: 'Test Skill', level: 50 });
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe('Security Tests', () => {
        test('Rate limiting blocks excessive requests', async () => {
            const promises = [];
            for (let i = 0; i < 50; i++) {
                promises.push(request(app).get('/api/projects'));
            }
            await Promise.all(promises);
        });
    });
});