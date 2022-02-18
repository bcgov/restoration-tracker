import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../database/db';
import { HTTPError } from '../../../../errors/custom-error';
import { ProjectService } from '../../../../services/project-service';
import { SearchService } from '../../../../services/search-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../__mocks__/db';
import { getUserProjectsList } from './list';

chai.use(sinonChai);

describe('list', () => {
  describe('getUserProjectsList', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('finds user by Id and returns 200 and result on success', async () => {
      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = { userId: '1' };

      const dbConnectionObj = getMockDBConnection({
        systemUserId: () => {
          return 1;
        }
      });

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      sinon
        .stub(SearchService.prototype, 'findProjectIdsByProjectParticipation')
        .resolves([{ project_id: 1 }, { project_id: 2 }]);

      const expectedResponse = [
        ({ project_id: 1, project_name: 'project1' } as unknown) as any,
        ({ project_id: 2, project_name: 'project2' } as unknown) as any
      ];

      sinon.stub(ProjectService.prototype, 'getProjectsByIds').resolves(expectedResponse);

      const requestHandler = getUserProjectsList();
      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.jsonValue).to.eql(expectedResponse);
    });

    it('catches and re-throws error', async () => {
      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.params = { userId: '1' };

      const dbConnectionObj = getMockDBConnection({
        systemUserId: () => {
          return 1;
        },
        release: sinon.stub()
      });

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      sinon.stub(SearchService.prototype, 'findProjectIdsByProjectParticipation').rejects(new Error('a test error'));

      try {
        const requestHandler = getUserProjectsList();
        await requestHandler(mockReq, mockRes, mockNext);

        expect.fail();
      } catch (actualError) {
        expect(dbConnectionObj.release).to.have.been.called;

        expect((actualError as HTTPError).message).to.equal('a test error');
      }
    });
  });
});
