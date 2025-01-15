import { expect } from 'chai';
import request from 'supertest';
import express from 'express';
import { errorsRoutes } from '../src/routes/errorsRoutes.js';
import { errorHandler } from '../src/errors/errors.js';
import { getErrorsService } from '../src/config/service.js';
import { validateBody, valid } from '../src/middlewares/validationMiddleware.js';
import sinon from 'sinon';
import schemas from '../src/utils/schemas.js';

describe('GET /api/errors', () => {
  let app;
  let getAllErrorsStub;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(validateBody(schemas));
    app.use(valid);
    getAllErrorsStub = sinon.stub(getErrorsService, 'getAllErrors');
    app.use('/api', errorsRoutes);
    app.use(errorHandler);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return all errors from the database', async () => {
    const mockErrors = [
      { id: 1, message: 'Error 1', created_at: '2025-01-15T10:00:00Z' },
      { id: 2, message: 'Error 2', created_at: '2025-01-15T10:05:00Z' },
    ];

    getAllErrorsStub.resolves(mockErrors);

    const response = await request(app).get('/api/errors');
    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal(mockErrors);
  });

  it('should return an empty array if no errors are found', async () => {
    getAllErrorsStub.resolves([]);

    const response = await request(app).get('/api/errors');
    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal([]);
  });

  it('should handle database errors gracefully', async () => {
    const error = new Error('Database connection error');
    getAllErrorsStub.rejects(error);

    const response = await request(app).get('/api/errors');
    expect(response.status).to.equal(500);
  });

  it('should throw an error when no validation schema is provided for GET with body', async () => {
    const response = await request(app)
      .get('/api/errors')
      .send({ invalid: 'data' });

    expect(response.status).to.equal(500);
    expect(response.body).to.have.property(
      'text',
      'For GET request with body, no validation schema provided'
    );
  });
});
