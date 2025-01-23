import { expect } from 'chai';
import sinon from 'sinon';
import OrdersService from '../src/services/OrdersService.js';
import PostgresConnection from '../src/databases/postgres/PostgresConnection.js';
import { getError } from '../src/errors/errors.js';

describe('OrdersService', () => {
  let service, dbStub;

  beforeEach(() => {
    dbStub = sinon.createStubInstance(PostgresConnection);
    sinon.stub(PostgresConnection.prototype, 'query').callsFake(dbStub.query);
    service = new OrdersService('mockConnectionString');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return all orders if no filters are provided', async () => {
    const mockOrders = [
      { id: 1, spot_id: 1, value: 100, timestamp: '2025-01-01', is_closed: false },
      { id: 2, spot_id: 2, value: 200, timestamp: '2025-01-02', is_closed: true },
    ];
    dbStub.query.resolves({ rows: mockOrders });

    const result = await service.getOrders({});
    expect(result).to.deep.equal(mockOrders);
    expect(dbStub.query.calledOnce).to.be.true;
  });

  it('should return orders filtered by is_closed', async () => {
    const mockOrders = [
      { id: 1, spot_id: 1, value: 100, timestamp: '2025-01-01', is_closed: false },
    ];
    dbStub.query.resolves({ rows: mockOrders });

    const result = await service.getOrders({ is_closed: 'false' });
    expect(result).to.deep.equal(mockOrders);
    expect(dbStub.query.calledOnce).to.be.true;
    expect(dbStub.query.firstCall.args[0]).to.include('AND is_closed = $1');
    expect(dbStub.query.firstCall.args[1]).to.deep.equal([false]);
  });

  it('should return orders filtered by date', async () => {
    const mockOrders = [
      { id: 1, spot_id: 1, value: 100, timestamp: '2025-01-01', is_closed: false },
    ];
    dbStub.query.resolves({ rows: mockOrders });

    const result = await service.getOrders({ date: '2025-01-01' });
    expect(result).to.deep.equal(mockOrders);
    expect(dbStub.query.calledOnce).to.be.true;
    expect(dbStub.query.firstCall.args[0]).to.include('AND DATE(timestamp) = $1');
    expect(dbStub.query.firstCall.args[1]).to.deep.equal(['2025-01-01']);
  });

  it('should return orders filtered by id', async () => {
    const mockOrder = { id: 1, spot_id: 1, value: 100, timestamp: '2025-01-01', is_closed: false };
    dbStub.query.resolves({ rows: [mockOrder] });

    const result = await service.getOrders({ id: 1 });
    expect(result).to.deep.equal([mockOrder]);
    expect(dbStub.query.calledOnce).to.be.true;
    expect(dbStub.query.firstCall.args[0]).to.include('AND id = $1');
    expect(dbStub.query.firstCall.args[1]).to.deep.equal([1]);
  });

  it('should throw an error if no orders are found', async () => {
    dbStub.query.resolves({ rows: [] });

    try {
      await service.getOrders({ is_closed: 'true' });
      expect.fail('Expected method to throw an error, but it did not.');
    } catch (error) {
      expect(error).to.deep.equal(getError(404, 'No orders found'));
    }
  });

  it('should throw an error if an open order already exists', async () => {
    dbStub.query.resolves({ rows: [{ id: 1, spot_id: 1, is_closed: false }] });

    try {
      await service.checkExistingOpenOrder(1);
      expect.fail('Expected method to throw an error, but it did not.');
    } catch (error) {
      expect(error).to.deep.equal(getError(400, 'An open order for spot_id 1 already exists'));
    }
  });

  it('should create a new order', async () => {
    const mockOrder = { id: 1, spot_id: 5, value: 100, timestamp: '2025-01-01', is_closed: false };
    dbStub.query.onFirstCall().resolves({ rows: [] });
    dbStub.query.onSecondCall().resolves({ rows: [mockOrder] });

    const result = await service.createOrder({ spot_id: 5, value: 100 });
    expect(result).to.deep.equal(mockOrder);
    expect(dbStub.query.callCount).to.equal(2);
  });

  it('should close an order', async () => {
    const mockOrder = { id: 1, spot_id: 1, value: 100, timestamp: '2025-01-01', is_closed: true };
    dbStub.query.resolves({ rows: [mockOrder] });
  
    const result = await service.closeOrder({ id: 1 });
    expect(result).to.deep.equal(mockOrder);
    expect(dbStub.query.calledOnce).to.be.true;
  });
  
  it('should throw an error if the order is already closed', async () => {
    dbStub.query.resolves({ rows: [] });
  
    try {
      await service.closeOrder({ id: 1 });
      expect.fail('Expected method to throw an error, but it did not.');
    } catch (error) {
      expect(error).to.deep.equal(getError(404, 'Order not found or already closed'));
    }
  });
  
  it('should throw an error if order is not found when closing', async () => {
    dbStub.query.resolves({ rows: [] });
  
    try {
      await service.closeOrder({ id: 999 });
      expect.fail('Expected method to throw an error, but it did not.');
    } catch (error) {
      expect(error).to.deep.equal(getError(404, 'Order not found or already closed'));
    }
  });
});
