import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../database/db';
import { HTTPError } from '../../../errors/custom-error';
//import { UserService } from '../../../services/user-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';
import * as update from './update';

chai.use(sinonChai);

describe('update', () => {
  describe('updateProject', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no req body', async () => {
      const dbConnectionObj = getMockDBConnection();

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.body = null;

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        const requestHandler = update.updateProject();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required body param: userIdentifier');
      }
    });

    // it('should throw a 400 error when no userIdentifier', async () => {
    //   const dbConnectionObj = getMockDBConnection();

    //   const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    //   mockReq.body = {
    //     userIdentifier: null,
    //     identitySource: 'idsource'
    //   };

    //   sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    //   try {
    //     const requestHandler = update.updateProject();

    //     await requestHandler(mockReq, mockRes, mockNext);
    //     expect.fail();
    //   } catch (actualError) {
    //     expect((actualError as HTTPError).status).to.equal(400);
    //     expect((actualError as HTTPError).message).to.equal('Missing required body param: userIdentifier');
    //   }
    // });

    // it('should throw a 400 error when no identitySource', async () => {
    //   const dbConnectionObj = getMockDBConnection();

    //   const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    //   mockReq.body = {
    //     userIdentifier: 'uid',
    //     identitySource: null
    //   };

    //   sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    //   try {
    //     const requestHandler = update.updateProject();

    //     await requestHandler(mockReq, mockRes, mockNext);
    //     expect.fail();
    //   } catch (actualError) {
    //     expect((actualError as HTTPError).status).to.equal(400);
    //     expect((actualError as HTTPError).message).to.equal('Missing required body param: identitySource');
    //   }
    // });

    // it('adds a system user and returns 200 on success', async () => {
    //   const dbConnectionObj = getMockDBConnection();

    //   const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    //   mockReq.body = {
    //     userIdentifier: 'uid',
    //     identitySource: 'idsource'
    //   };

    //   sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    //   sinon.stub(UserService.prototype, 'addSystemUser').resolves();

    //   const requestHandler = update.updateProject();

    //   await requestHandler(mockReq, mockRes, mockNext);

    //   expect(mockRes.statusValue).to.equal(200);
    // });
  });
});
