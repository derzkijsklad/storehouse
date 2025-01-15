import { expect } from 'chai';
import sinon from 'sinon';
import OrdersService from '../src/services/OrdersService.js';
import PostgresConnection from '../src/databases/postgres/PostgresConnection.js';
import { getError } from '../src/errors/errors.js';
import { containersService } from '../src/config/service.js';

describe('OrdersService', () => {
  let service, dbStub, containerServiceStub;

  beforeEach(() => {
    dbStub = sinon.createStubInstance(PostgresConnection);
    sinon.stub(PostgresConnection.prototype, 'query').callsFake(dbStub.query);
    containerServiceStub = sinon.stub(containersService, 'getContainerById');
    service = new OrdersService('mockConnectionString');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return filtered orders based on query parameters', async () => {
    const mockOrders = [
      { id: 1, product_name: 'Widget A', container_id: 1, order_status: 'open', quantity: 10 },
      { id: 2, product_name: 'Gadget B', container_id: 2, order_status: 'closed', quantity: 5 },
    ];
    dbStub.query.resolves({ rows: mockOrders });

    const result = await service.getOrders({ order_status: 'open', container_id: 1 });
    expect(result).to.deep.equal(mockOrders);
    expect(dbStub.query.calledOnce).to.be.true;
  });

  it('should throw an error if no orders are found', async () => {
    dbStub.query.resolves({ rows: [] });

    try {
      await service.getOrders({ order_status: 'closed' });
      expect.fail('Expected method to throw an error, but it did not.');
    } catch (error) {
      expect(error).to.deep.equal(getError(404, 'No orders found'));
    }
  });

  it('should throw an error if an open order already exists', async () => {
    dbStub.query.resolves({ rows: [{ id: 1, product_name: 'Widget A', order_status: 'open' }] });

    try {
      await service.checkExistingOpenOrder(1, 'Widget A');
      expect.fail('Expected method to throw an error, but it did not.');
    } catch (error) {
      expect(error).to.deep.equal(getError(400, 'An open order for product Widget A in container 1 already exists'));
    }
  });

  it('should create a new order', async () => {
    const mockOrder = { id: 1, product_name: 'Widget A', quantity: 10, container_id: 5 };
    dbStub.query.onFirstCall().resolves({ rows: [] });
    dbStub.query.onSecondCall().resolves({ rows: [mockOrder] });
    containerServiceStub.resolves({ id: 5 });
    const result = await service.createOrder({ container_id: 5, product_name: 'Widget A', quantity: 10 });
    expect(result).to.deep.equal(mockOrder);
    expect(dbStub.query.callCount).to.equal(2);
    expect(containerServiceStub.calledOnceWith(5)).to.be.true;
  });
  
  

  it('should throw an error if order ID is missing when closing an order', async () => {
    try {
      await service.closeOrder({});
      expect.fail('Expected method to throw an error, but it did not.');
    } catch (error) {
      expect(error).to.deep.equal(getError(400, 'Missing order ID'));
    }
  });

  it('should close an order', async () => {
    const mockOrder = { id: 1, product_name: 'Widget A', order_status: 'closed', quantity: 10 };
    dbStub.query.onFirstCall().resolves({ rows: [{ order_status: 'open' }] });
    dbStub.query.onSecondCall().resolves({ rows: [mockOrder] });

    const result = await service.closeOrder({ id: 1 });
    expect(result).to.deep.equal(mockOrder);
    expect(dbStub.query.calledTwice).to.be.true;
  });

  it('should throw an error if the order is already closed', async () => {
    dbStub.query.resolves({ rows: [{ order_status: 'closed' }] });

    try {
      await service.closeOrder({ id: 1 });
      expect.fail('Expected method to throw an error, but it did not.');
    } catch (error) {
      expect(error).to.deep.equal(getError(400, 'Order is already closed'));
    }
  });

  it('should throw an error if order is not found when closing', async () => {
    dbStub.query.resolves({ rows: [] });

    try {
      await service.closeOrder({ id: 999 });
      expect.fail('Expected method to throw an error, but it did not.');
    } catch (error) {
      expect(error).to.deep.equal(getError(404, 'Order not found'));
    }
  });
});
