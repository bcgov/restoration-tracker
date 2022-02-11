import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import { HTTPError } from '../../../../../errors/custom-error';
import security_queries from '../../../../../queries/security';
import { getMockDBConnection } from '../../../../../__mocks__/db';
import * as makeUnsecure from './makeUnsecure';

chai.use(sinonChai);

describe('makeProjectAttachmentUnsecure', () => {
  afterEach(() => {
    sinon.restore();
  });

  const sampleReq = {
    keycloak_token: {},
    params: {
      projectId: 1,
      attachmentId: 2
    },
    body: {
      securityToken: 'sometoken'
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

  it('should throw an error when projectId is missing', async () => {
    try {
      const result = makeUnsecure.makeProjectAttachmentUnsecure();

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

  it('should throw an error when attachmentId is missing', async () => {
    try {
      const result = makeUnsecure.makeProjectAttachmentUnsecure();

      await result(
        { ...sampleReq, params: { ...sampleReq.params, attachmentId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `attachmentId`');
    }
  });

  it('should throw an error when request body is missing', async () => {
    try {
      const result = makeUnsecure.makeProjectAttachmentUnsecure();

      await result({ ...sampleReq, body: null }, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required request body');
    }
  });

  it('should throw an error when securityToken is missing', async () => {
    try {
      const result = makeUnsecure.makeProjectAttachmentUnsecure();

      await result({ ...sampleReq, body: { securityToken: null } }, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required request body');
    }
  });

  it('should throw an error when fails to build unsecureRecordSQL statement', async () => {
    getMockDBConnection();

    sinon.stub(security_queries, 'unsecureAttachmentRecordSQL').returns(null);

    try {
      const result = makeUnsecure.makeProjectAttachmentUnsecure();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL unsecure record statement');
    }
  });

  it('should throw an error when fails to unsecure record', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rowCount: null
    });

    getMockDBConnection({ query: mockQuery });

    sinon.stub(security_queries, 'unsecureAttachmentRecordSQL').returns(SQL`something`);

    try {
      const result = makeUnsecure.makeProjectAttachmentUnsecure();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to unsecure record');
    }
  });

  it('should work on success', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rowCount: 1
    });

    getMockDBConnection({ query: mockQuery });

    sinon.stub(security_queries, 'unsecureAttachmentRecordSQL').returns(SQL`something`);

    const result = makeUnsecure.makeProjectAttachmentUnsecure();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.equal(1);
  });
});
