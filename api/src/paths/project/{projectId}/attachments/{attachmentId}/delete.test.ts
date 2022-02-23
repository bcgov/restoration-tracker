import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as delete_attachment from './delete';
import * as db from '../../../../../database/db';
// import project_queries from '../../../../../queries/project';
// import security_queries from '../../../../../queries/security';
// import SQL from 'sql-template-strings';
// import * as file_utils from '../../../../../utils/file-utils';
// import { DeleteObjectOutput } from 'aws-sdk/clients/s3';
import { getMockDBConnection } from '../../../../../__mocks__/db';
import { HTTPError } from '../../../../../errors/custom-error';
import { AttachmentService } from '../../../../../services/attachment-service';

chai.use(sinonChai);

describe('deleteAttachment', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    params: {
      projectId: 1,
      attachmentId: 2
    },
    body: {
      securityToken: 'token'
    }
  } as any;

  let actualResult: any = null;

  const sampleRes = {
    status: () => {
      return {
        json: (result: any) => {
          actualResult = result;
        },
        send: () => {
          // do nothing
        }
      };
    }
  };

  it('should throw an error when projectId is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = delete_attachment.deleteAttachment();

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
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = delete_attachment.deleteAttachment();

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

  it('should return null response on success', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(AttachmentService.prototype, 'deleteAttachment').resolves();

    const result = delete_attachment.deleteAttachment();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.equal(null);
  });
});
