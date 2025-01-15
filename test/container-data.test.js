import { expect } from 'chai';
import sinon from 'sinon';
import PostgresConnection from '../src/databases/postgres/PostgresConnection.js';
import ContainerDataService from '../src/services/ContainerDataService.js';
import { PRODUCT_DATA_QUERIES } from '../src/utils/queries.js';
import { getError } from '../src/errors/errors.js';

describe('ContainerDataService', () => {
  let service, dbStub;

  beforeEach(() => {
    dbStub = sinon.createStubInstance(PostgresConnection);
    sinon.stub(PostgresConnection.prototype, 'query').callsFake(dbStub.query);
    service = new ContainerDataService('mockConnectionString');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return all containers from the database', async () => {
    const mockContainers = [
      { id: 1, name: 'Container A', capacity: 100 },
      { id: 2, name: 'Container B', capacity: 200 },
    ];

    dbStub.query.resolves({ rows: mockContainers });

    const result = await service.getAllContainers();
    expect(result).to.deep.equal(mockContainers);
    expect(dbStub.query.calledOnceWith(PRODUCT_DATA_QUERIES.GET_ALL_CONTAINERS)).to.be.true;
  });

  it('should return a container by ID', async () => {
    const mockContainer = { id: 1, name: 'Container A', capacity: 100 };

    dbStub.query.resolves({ rows: [mockContainer] });

    const result = await service.getContainerById(1);
    expect(result).to.deep.equal(mockContainer);
    expect(dbStub.query.calledOnceWith(PRODUCT_DATA_QUERIES.GET_CONTAINER_BY_ID, [1])).to.be.true;
  });

  it('should throw an error if container ID is not found', async () => {
    dbStub.query.resolves({ rows: [] });

    try {
      await service.getContainerById(999);
      expect.fail('Expected method to throw an error, but it did not.');
    } catch (error) {
      expect(error).to.deep.equal(getError(404, 'Container with id 999 not found'));
    }
  });
});
