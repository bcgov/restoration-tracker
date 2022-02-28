import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../database/db';
import { HTTPError } from '../../../../../errors/custom-error';
import { ProjectParticipantObject } from '../../../../../models/user';
import { UserService } from '../../../../../services/user-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../__mocks__/db';
import * as projects from './list';

chai.use(sinonChai);

describe('projects', () => {
  describe('getAllUserProjects', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no user Id is sent', async () => {
      const dbConnectionObj = getMockDBConnection();

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = { userId: '' };

      try {
        const result = projects.getAllUserProjects();

        await result(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required param: userId');
      }
    });

    it('finds user by Id and returns 200 and result on success', async () => {
      const dbConnectionObj = getMockDBConnection();

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = { userId: '12' };

      sinon.stub(UserService.prototype, 'getUserProjectParticipation').resolves([
        new ProjectParticipantObject({
          project_id: 123,
          project_name: 'test',
          system_user_id: 12,
          project_role_id: 42,
          project_role_name: 'role',
          project_participation_id: 88
        })
      ]);

      const result = projects.getAllUserProjects();

      await result(mockReq, mockRes, mockNext);

      expect(mockRes.jsonValue).to.eql([
        {
          project_id: 123,
          name: 'test',
          system_user_id: 12,
          project_role_id: 42,
          project_role_name: 'role',
          project_participation_id: 88
        }
      ]);
    });
  });
});
