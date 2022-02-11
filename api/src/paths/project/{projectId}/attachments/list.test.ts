import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as listAttachments from './list';

import project_queries from '../../../../queries/project';
import SQL from 'sql-template-strings';
import { getMockDBConnection } from '../../../../__mocks__/db';
import { HTTPError } from '../../../../errors/custom-error';

chai.use(sinonChai);

describe('lists the project attachments', () => {
  const sampleReq = {
    keycloak_token: {},
    body: {},
    params: {
      projectId: 1
    }
  } as any;

  let actualResult: any = null;

  const sampleRes = {
    status: () => {
      return {
        json: (result: any) => {
          actualResult = result;
        }
      };
    }
  };

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no sql statement returned for getProjectAttachmentsSQL', async () => {
    getMockDBConnection({
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(project_queries, 'getProjectAttachmentsSQL').returns(null);

    try {
      const result = listAttachments.getAttachments();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should return a list of project attachments where the lastModified is the create_date', async () => {
    const mockQuery = sinon.stub();

    mockQuery.onFirstCall().resolves({
      rows: [
        {
          id: 13,
          file_name: 'name1',
          create_date: '2020-01-01',
          update_date: '',
          file_size: 50,
          security_token: 'token123'
        }
      ]
    });

    getMockDBConnection({
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(project_queries, 'getProjectAttachmentsSQL').returns(SQL`something`);

    const result = listAttachments.getAttachments();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.eql({
      attachmentsList: [
        {
          id: 13,
          fileName: 'name1',
          lastModified: '2020-01-01',
          size: 50,
          securityToken: 'token123'
        }
      ]
    });
  });

  it('should return a list of project attachments where the lastModified is the update_date', async () => {
    const mockQuery = sinon.stub();

    mockQuery.onFirstCall().resolves({
      rows: [
        {
          id: 13,
          file_name: 'name1',
          create_date: '2020-01-01',
          update_date: '2020-01-02',
          file_size: 50,
          security_token: 'token123'
        }
      ]
    });

    getMockDBConnection({
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(project_queries, 'getProjectAttachmentsSQL').returns(SQL`something`);

    const result = listAttachments.getAttachments();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.eql({
      attachmentsList: [
        {
          id: 13,
          fileName: 'name1',
          lastModified: '2020-01-02',
          size: 50,
          securityToken: 'token123'
        }
      ]
    });
  });

  it('should return null if the project has no attachments, on success', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: undefined });

    getMockDBConnection({
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(project_queries, 'getProjectAttachmentsSQL').returns(SQL`something`);

    const result = listAttachments.getAttachments();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.null;
  });

  it('should throw a 400 error when no projectId is provided', async () => {
    try {
      const result = listAttachments.getAttachments();
      await result(
        { ...sampleReq, params: { ...sampleReq.params, projectId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `projectId`');
    }
  });
});
