import Ajv from 'ajv';
import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/custom-error';
import { ProjectService } from '../../services/project-service';
import { SearchService } from '../../services/search-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import { GET, getProjectList } from './list';

chai.use(sinonChai);

describe('list', () => {
  describe('openapi schema', () => {
    const ajv = new Ajv();

    it('is valid openapi v3 schema', () => {
      expect(ajv.validateSchema((GET.apiDoc as unknown) as object)).to.be.true;
    });
  });

  describe('getProjectList', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns an empty array if no project ids are found', async () => {
      const dbConnectionObj = getMockDBConnection();

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      sinon.stub(SearchService.prototype, 'findProjectIdsByCriteria').resolves([]);

      sinon.stub(ProjectService.prototype, 'getProjectsByIds').resolves([]);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      try {
        const requestHandler = getProjectList();

        await requestHandler(mockReq, mockRes, mockNext);
      } catch (actualError) {
        expect.fail();
      }

      expect(mockRes.statusValue).to.equal(200);
      expect(mockRes.jsonValue).to.eql([]);
    });

    it('returns an array of projects', async () => {
      const dbConnectionObj = getMockDBConnection();

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      sinon.stub(SearchService.prototype, 'findProjectIdsByCriteria').resolves([{ project_id: 1 }, { project_id: 2 }]);

      const mockProject1 = ({ project: { project_id: 1 } } as unknown) as any;
      const mockProject2 = ({ project: { project_id: 2 } } as unknown) as any;

      const getProjectsByIdsStub = sinon
        .stub(ProjectService.prototype, 'getProjectsByIds')
        .resolves([mockProject1, mockProject2]);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      try {
        const requestHandler = getProjectList();

        await requestHandler(mockReq, mockRes, mockNext);
      } catch (actualError) {
        expect.fail();
      }

      expect(getProjectsByIdsStub).to.have.been.calledWith([1, 2]);

      expect(mockRes.jsonValue).to.eql([mockProject1, mockProject2]);
      expect(mockRes.statusValue).to.equal(200);
    });

    it('catches error, calls rollback, and re-throws error', async () => {
      const dbConnectionObj = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      sinon.stub(SearchService.prototype, 'findProjectIdsByCriteria').rejects(new Error('a test error'));

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      try {
        const requestHandler = getProjectList();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect(dbConnectionObj.rollback).to.have.been.called;
        expect(dbConnectionObj.release).to.have.been.called;

        expect((actualError as HTTPError).message).to.equal('a test error');
      }
    });
  });
});
