import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/custom-error';
import { ProjectParticipantObject, UserObject } from '../../models/user';
import { UserService } from '../../services/user-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import * as self from './self';

chai.use(sinonChai);

describe('getUser', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no system user id', async () => {
    const dbConnectionObj = getMockDBConnection();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const requestHandler = self.getUser();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to identify system user ID');
    }
  });

  it('should return the user object on success', async () => {
    const dbConnectionObj = getMockDBConnection({ systemUserId: () => 1 });

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const expectedUserObject = new UserObject({
      id: 1,
      user_guid: '123456',
      user_identifier: 'identifier',
      identity_source: 'identitysource',
      record_end_date: '',
      role_ids: [1, 2],
      role_names: ['role 1', 'role 2']
    });

    sinon.stub(UserService.prototype, 'getUserById').resolves(expectedUserObject);

    const expectedParticipantObjects = [
      new ProjectParticipantObject({
        project_id: 1,
        project_name: 'project name',
        system_user_id: 1,
        project_role_id: 3,
        project_role_name: 'role 3',
        project_participation_id: 1
      })
    ];

    sinon.stub(UserService.prototype, 'getUserProjectParticipation').resolves(expectedParticipantObjects);

    const requestHandler = self.getUser();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.eql({
      ...expectedUserObject,
      projects: expectedParticipantObjects
    });
  });

  it('should throw an error when a failure occurs', async () => {
    const expectedError = new Error('cannot process query');

    const dbConnectionObj = getMockDBConnection({
      systemUserId: () => {
        throw expectedError;
      }
    });

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    try {
      const requestHandler = self.getUser();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal(expectedError.message);
    }
  });
});
