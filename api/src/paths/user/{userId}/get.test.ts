import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { HTTPError } from '../../../errors/custom-error';
import { UserService } from '../../../services/user-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';
import * as user from './get';

chai.use(sinonChai);

describe('user', () => {
  describe('getUserById', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no user Id is sent', async () => {
      getMockDBConnection();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = {
        userId: ''
      };

      try {
        const requestHandler = user.getUserById();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required param: userId');
      }
    });

    it('should throw a 400 error if it fails to get the system user', async () => {
      getMockDBConnection();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = {
        userId: '1'
      };

      sinon.stub(UserService.prototype, 'getUserById').resolves(null);

      try {
        const requestHandler = user.getUserById();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Failed to get system user');
      }
    });

    it('finds user by Id and returns 200 and requestHandler on success', async () => {
      getMockDBConnection();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = {
        userId: '1'
      };

      sinon.stub(UserService.prototype, 'getUserById').resolves({
        id: 1,
        user_identifier: 'user_identifier',
        record_end_date: '',
        role_ids: [],
        role_names: []
      });

      const requestHandler = user.getUserById();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.jsonValue).to.eql({
        id: 1,
        user_identifier: 'user_identifier',
        record_end_date: '',
        role_ids: [],
        role_names: []
      });
    });
  });
});
