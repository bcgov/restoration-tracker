import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { registerMockDBConnection } from '../__mocks__/db';
import { SearchService } from './search-service';

chai.use(sinonChai);

describe('SearchService', () => {
  describe('findProjectIdsByCriteria', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('fetches project ids', async () => {
      const mockDBConnection = registerMockDBConnection({
        systemUserId: () => 20,
        knex: sinon.stub().resolves({ rows: [] })
      });

      const searchService = new SearchService(mockDBConnection);

      const response = await searchService.findProjectIdsByCriteria({});

      expect(response).to.eql([]);
    });
  });
});
