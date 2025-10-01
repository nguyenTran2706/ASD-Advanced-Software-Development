// test/enquiries.test.js
process.env.NODE_ENV = 'test';

const request = require('supertest');
const express = require('express');
const path = require('path');

// Mock the database module
jest.mock('../database', () => ({
  run: jest.fn((sql, params, callback) => {
    // Simulate successful insert with lastID
    callback.call({ lastID: 1 }, null);
  }),
  all: jest.fn((sql, params, callback) => {
    callback(null, []);
  })
}));

const db = require('../database');

// Quiet logs during test
const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

// Load enquiries router
let enquiriesRouter;
try {
  enquiriesRouter = require(path.join(__dirname, '..', 'backend', 'enquiries.js'));
} catch (_) {
  enquiriesRouter = require(path.join(__dirname, '..', 'enquiries.js'));
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/enquiries', enquiriesRouter);

afterAll(() => {
  logSpy.mockRestore();
  errSpy.mockRestore();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Enquiries API', () => {
  it('POST /api/enquiries creates a booking (inspection)', async () => {
    const res = await request(app)
      .post('/api/enquiries')
      .send({
        property_id: 1,
        name: 'Adrian William',
        email: 'student@test.com',
        phone: '0412345678',
        message: 'Book inspection for Saturday'
      })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.property_id).toBe(1);
    expect(res.body.name).toBe('Adrian William');
    expect(res.body.email).toBe('student@test.com');
    expect(res.body.message).toBe('Book inspection for Saturday');
    
    // Verify database was called correctly
    expect(db.run).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO enquiries'),
      [1, 'Adrian William', 'student@test.com', '0412345678', 'Book inspection for Saturday'],
      expect.any(Function)
    );
  });

  it('POST /api/enquiries works without phone number', async () => {
    const res = await request(app)
      .post('/api/enquiries')
      .send({
        property_id: 2,
        name: 'Jane Smith',
        email: 'jane@test.com',
        message: 'Interested in this property'
      })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(201);
    expect(res.body.phone).toBeNull();
  });

  it('POST /api/enquiries rejects missing required fields', async () => {
    const res = await request(app)
      .post('/api/enquiries')
      .send({
        name: 'Test User',
        email: 'test@test.com'
        // missing property_id and message
      })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('required');
  });

  it('POST /api/enquiries handles database errors', async () => {
    // Mock database error
    db.run.mockImplementationOnce((sql, params, callback) => {
      callback(new Error('Database connection failed'));
    });

    const res = await request(app)
      .post('/api/enquiries')
      .send({
        property_id: 1,
        name: 'Test User',
        email: 'test@test.com',
        message: 'Test message'
      })
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  it('GET /api/enquiries returns all enquiries', async () => {
    const mockEnquiries = [
      {
        id: 1,
        property_id: 1,
        name: 'John Doe',
        email: 'john@test.com',
        phone: '0412345678',
        message: 'Test enquiry',
        created_at: '2025-01-01T00:00:00.000Z'
      }
    ];

    db.all.mockImplementationOnce((sql, params, callback) => {
      callback(null, mockEnquiries);
    });

    const res = await request(app).get('/api/enquiries');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockEnquiries);
    expect(db.all).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM enquiries'),
      [],
      expect.any(Function)
    );
  });
});