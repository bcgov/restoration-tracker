import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { UserService } from '../services/user-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../__mocks__/db';
import * as users from './users';

chai.use(sinonChai);

describe('users', () => {
  describe('getUserList', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return rows on success', async () => {
      getMockDBConnection();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      const mockResponse = [
        {
          id: 1,
          user_identifier: 'identifier',
          record_end_date: '',
          role_ids: [1, 2],
          role_names: ['System Admin', 'Project Lead']
        }
      ];

      sinon.stub(UserService.prototype, 'listSystemUsers').resolves(mockResponse);

      const requestHandler = users.getUserList();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.jsonValue).to.eql(mockResponse);
    });
  });
});
