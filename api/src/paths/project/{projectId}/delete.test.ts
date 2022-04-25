import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import { SYSTEM_ROLE } from '../../../constants/roles';
import * as db from '../../../database/db';
import project_queries from '../../../queries/project';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';
import * as delete_project from './delete';
import * as file_utils from '../../../utils/file-utils';
import { HTTPError } from '../../../errors/custom-error';
import { AttachmentService } from '../../../services/attachment-service';
import { getKnexQueryBuilder } from '../../../database/db';

chai.use(sinonChai);

describe('deleteProject', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw an error when projectId is missing', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    try {
      const result = delete_project.deleteProject();

      await result(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param: `projectId`');
    }
  });

  it('should throw a 400 error when no sql statement returned for getProjectSQL', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { projectId: '1' };
    mockReq['system_user'] = { role_names: [SYSTEM_ROLE.SYSTEM_ADMIN] };

    sinon.stub(project_queries, 'getProjectSQL').returns(null);

    try {
      const result = delete_project.deleteProject();

      await result(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should throw a 400 error when fails to get the project cause no rows', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      query: async () => {
        return {
          rows: [null]
        } as QueryResult<any>;
      }
    });

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { projectId: '1' };
    mockReq['system_user'] = { role_names: [SYSTEM_ROLE.SYSTEM_ADMIN] };

    sinon.stub(project_queries, 'getProjectSQL').returns(SQL`some`);

    try {
      const result = delete_project.deleteProject();

      await result(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to get the project');
    }
  });

  it('should throw a 400 error when failed to get result for project attachments', async () => {
    const dbConnectionObj = getMockDBConnection();

    const mockQuery = sinon.stub();

    // mock project query
    mockQuery.onCall(0).resolves({
      rowCount: 1,
      rows: [
        {
          id: 1
        }
      ]
    });

    // mock attachments query
    mockQuery.onCall(1).resolves({ rows: null });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      query: mockQuery
    });

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { projectId: '1' };
    mockReq['system_user'] = { role_names: [SYSTEM_ROLE.SYSTEM_ADMIN] };

    sinon.stub(project_queries, 'getProjectSQL').returns(SQL`some`);
    sinon.stub(project_queries, 'getProjectAttachmentsKnex').returns(getKnexQueryBuilder());

    try {
      const result = delete_project.deleteProject();

      await result(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to get project attachments type record');
    }
  });

  it('should return true on successful delete', async () => {
    const dbConnectionObj = getMockDBConnection();
    const mockQuery = sinon.stub();

    // mock project query
    mockQuery.onCall(0).resolves({
      rowCount: 1,
      rows: [
        {
          id: 1
        }
      ]
    });

    // mock attachments query
    mockQuery.onCall(1).resolves({ rows: [{ key: 'key' }] });

    // mock delete project query
    mockQuery.onCall(2).resolves();

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      query: mockQuery
    });

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = { projectId: '1' };
    mockReq['system_user'] = { role_names: [SYSTEM_ROLE.SYSTEM_ADMIN] };

    sinon.stub(project_queries, 'getProjectSQL').returns(SQL`some`);
    sinon.stub(project_queries, 'getProjectAttachmentsKnex').returns(getKnexQueryBuilder());
    sinon.stub(project_queries, 'deleteProjectSQL').returns(SQL`some`);
    sinon.stub(file_utils, 'deleteFileFromS3').resolves({});
    sinon.stub(AttachmentService.prototype, 'deleteAllS3Attachments').resolves();

    const result = delete_project.deleteProject();

    await result(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.equal(true);
  });
});
