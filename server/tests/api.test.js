import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/lib/prisma.js';

describe('OpenFeedback Backend API Tests', () => {
  let createdPublicToken;
  let createdAdminToken;
  let createdFeedbackId;
  let secondPublicToken;
  let secondAdminToken;
  let secondFeedbackId;

  before(async () => {
    const { ensureDatabaseRunning } = await import('../scripts/start-db.js');
    await ensureDatabaseRunning();
  });

  after(async () => {
    // Cleanup created test forms
    if (createdPublicToken) {
      await prisma.feedback.deleteMany({
        where: { form: { publicToken: createdPublicToken } }
      });
      await prisma.form.deleteMany({
        where: { publicToken: createdPublicToken }
      });
    }
    if (secondPublicToken) {
      await prisma.feedback.deleteMany({
        where: { form: { publicToken: secondPublicToken } }
      });
      await prisma.form.deleteMany({
        where: { publicToken: secondPublicToken }
      });
    }
    await prisma.$disconnect();
  });

  describe('Health Check', () => {
    it('GET /api/health should return 200 and status ok', async () => {
      const res = await request(app).get('/api/health');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.status, 'ok');
    });
  });

  describe('Form Creation (POST /api/forms)', () => {
    it('should create a form with a valid title', async () => {
      const res = await request(app)
        .post('/api/forms')
        .send({ title: 'Quarterly Team Feedback' });

      assert.strictEqual(res.status, 201);
      assert.ok(res.body.id);
      assert.strictEqual(res.body.title, 'Quarterly Team Feedback');
      assert.ok(res.body.publicToken);
      assert.ok(res.body.adminToken);

      // Verify tokens are random and not predictable numbers
      assert.ok(typeof res.body.publicToken === 'string');
      assert.ok(res.body.publicToken.length >= 8);
      assert.ok(res.body.adminToken.length >= 32);

      createdPublicToken = res.body.publicToken;
      createdAdminToken = res.body.adminToken;
    });

    it('should reject form creation with empty title', async () => {
      const res = await request(app)
        .post('/api/forms')
        .send({ title: '   ' });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.error, 'Title is required');
    });

    it('should reject form creation when title is missing', async () => {
      const res = await request(app)
        .post('/api/forms')
        .send({});

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.error, 'Title is required');
    });

    it('should reject form creation when title exceeds 200 characters', async () => {
      const longTitle = 'a'.repeat(201);
      const res = await request(app)
        .post('/api/forms')
        .send({ title: longTitle });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.error, 'Title cannot exceed 200 characters');
    });
  });

  describe('Public Form Retrieval (GET /api/forms/:publicToken)', () => {
    it('should retrieve public form without exposing admin token or feedback', async () => {
      const res = await request(app).get(`/api/forms/${createdPublicToken}`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.title, 'Quarterly Team Feedback');
      assert.strictEqual(res.body.publicToken, createdPublicToken);

      // Strictly verify no private data is exposed
      assert.strictEqual(res.body.adminToken, undefined);
      assert.strictEqual(res.body.id, undefined);
      assert.strictEqual(res.body.feedback, undefined);
    });

    it('should return 404 for invalid public token', async () => {
      const res = await request(app).get('/api/forms/non-existent-token-xyz');
      assert.strictEqual(res.status, 404);
      assert.ok(res.body.error);
    });
  });

  describe('Feedback Submission (POST /api/forms/:publicToken/feedback)', () => {
    it('should submit valid feedback with positive category', async () => {
      const res = await request(app)
        .post(`/api/forms/${createdPublicToken}/feedback`)
        .send({
          message: 'The presentation was insightful and concise!',
          category: 'positive'
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.message, 'Feedback submitted successfully');
    });

    it('should submit valid feedback without category (optional)', async () => {
      const res = await request(app)
        .post(`/api/forms/${createdPublicToken}/feedback`)
        .send({
          message: 'General comment on the overall structure.'
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.message, 'Feedback submitted successfully');
    });

    it('should reject feedback with empty message', async () => {
      const res = await request(app)
        .post(`/api/forms/${createdPublicToken}/feedback`)
        .send({
          message: '   ',
          category: 'positive'
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.error, 'Feedback message must be at least 3 characters long');
    });

    it('should reject feedback with message shorter than 3 characters', async () => {
      const res = await request(app)
        .post(`/api/forms/${createdPublicToken}/feedback`)
        .send({
          message: 'hi'
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.error, 'Feedback message must be at least 3 characters long');
    });

    it('should reject feedback with invalid category', async () => {
      const res = await request(app)
        .post(`/api/forms/${createdPublicToken}/feedback`)
        .send({
          message: 'Great job!',
          category: 'exceptional'
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.error, 'Category must be one of: positive, improvement, general');
    });

    it('should return 404 when submitting feedback to non-existent form', async () => {
      const res = await request(app)
        .post('/api/forms/does-not-exist/feedback')
        .send({
          message: 'Testing feedback'
        });

      assert.strictEqual(res.status, 404);
    });
  });

  describe('Management Dashboard (GET /api/manage/:adminToken)', () => {
    it('should return dashboard data and statistics with valid admin token', async () => {
      const res = await request(app).get(`/api/manage/${createdAdminToken}`);
      assert.strictEqual(res.status, 200);
      assert.ok(res.body.form);
      assert.strictEqual(res.body.form.title, 'Quarterly Team Feedback');
      assert.strictEqual(res.body.form.publicToken, createdPublicToken);

      // Verify stats
      assert.ok(res.body.stats);
      assert.strictEqual(res.body.stats.total, 2);
      assert.strictEqual(res.body.stats.positive, 1);
      assert.strictEqual(res.body.stats.improvement, 0);
      assert.strictEqual(res.body.stats.general, 0);

      // Verify feedback list
      assert.ok(Array.isArray(res.body.feedback));
      assert.strictEqual(res.body.feedback.length, 2);

      // Save a feedback ID for deletion test
      createdFeedbackId = res.body.feedback[0].id;

      // Verify admin token is NOT leaked in the response
      assert.strictEqual(res.body.adminToken, undefined);
      assert.strictEqual(res.body.form.adminToken, undefined);
    });

    it('should return 404 for invalid admin token', async () => {
      const res = await request(app).get('/api/manage/fake-admin-token-1234');
      assert.strictEqual(res.status, 404);
      assert.ok(res.body.error);
    });
  });

  describe('Feedback Deletion and Isolation (DELETE /api/manage/:adminToken/feedback/:feedbackId)', () => {
    before(async () => {
      // Create a second form to test cross-form deletion prevention
      const res = await request(app)
        .post('/api/forms')
        .send({ title: 'Second Form' });

      secondPublicToken = res.body.publicToken;
      secondAdminToken = res.body.adminToken;

      // Submit feedback to second form
      await request(app)
        .post(`/api/forms/${secondPublicToken}/feedback`)
        .send({ message: 'Feedback on second form' });

      const secondDashboard = await request(app).get(`/api/manage/${secondAdminToken}`);
      secondFeedbackId = secondDashboard.body.feedback[0].id;
    });

    it('should prevent deleting feedback belonging to another form', async () => {
      // Attempt to delete second form's feedback using first form's admin token
      const res = await request(app).delete(
        `/api/manage/${createdAdminToken}/feedback/${secondFeedbackId}`
      );

      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.body.error, 'Feedback not found or does not belong to this form');
    });

    it('should successfully delete feedback belonging to the form', async () => {
      const res = await request(app).delete(
        `/api/manage/${createdAdminToken}/feedback/${createdFeedbackId}`
      );

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.message, 'Feedback deleted successfully');

      // Verify total feedback is now 1
      const dashboard = await request(app).get(`/api/manage/${createdAdminToken}`);
      assert.strictEqual(dashboard.body.stats.total, 1);
    });

    it('should return 404 when trying to delete already deleted feedback', async () => {
      const res = await request(app).delete(
        `/api/manage/${createdAdminToken}/feedback/${createdFeedbackId}`
      );

      assert.strictEqual(res.status, 404);
    });
  });

  describe('Form Updating (PATCH /api/manage/:adminToken)', () => {
    it('should update the feedback form title with valid admin token', async () => {
      const res = await request(app)
        .patch(`/api/manage/${createdAdminToken}`)
        .send({ title: 'Updated Team Feedback Title' });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.message, 'Feedback page updated successfully');
      assert.strictEqual(res.body.form.title, 'Updated Team Feedback Title');

      // Verify dashboard reflects updated title
      const dashboard = await request(app).get(`/api/manage/${createdAdminToken}`);
      assert.strictEqual(dashboard.body.form.title, 'Updated Team Feedback Title');
    });

    it('should reject updating title with empty string', async () => {
      const res = await request(app)
        .patch(`/api/manage/${createdAdminToken}`)
        .send({ title: '   ' });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.error, 'Title is required');
    });

    it('should reject updating title with over 200 characters', async () => {
      const res = await request(app)
        .patch(`/api/manage/${createdAdminToken}`)
        .send({ title: 'x'.repeat(201) });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.error, 'Title cannot exceed 200 characters');
    });

    it('should return 404 when updating with invalid admin token', async () => {
      const res = await request(app)
        .patch('/api/manage/invalid-token-12345')
        .send({ title: 'New Title' });

      assert.strictEqual(res.status, 404);
    });
  });

  describe('Privacy & Security Checks', () => {
    it('database should not contain IP addresses or sender identity fields', async () => {
      const feedbackInDb = await prisma.feedback.findFirst({
        where: { form: { publicToken: secondPublicToken } }
      });

      assert.ok(feedbackInDb);
      const keys = Object.keys(feedbackInDb);
      assert.ok(!keys.includes('ip'));
      assert.ok(!keys.includes('ipAddress'));
      assert.ok(!keys.includes('sender'));
      assert.ok(!keys.includes('email'));
      assert.ok(!keys.includes('userId'));
      assert.ok(!keys.includes('user'));
    });
  });
});
