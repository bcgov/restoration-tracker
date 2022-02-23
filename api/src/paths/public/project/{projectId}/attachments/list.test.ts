import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../database/db';
import { getMockDBConnection } from '../../../../../__mocks__/db';
import { HTTPError } from '../../../../../errors/custom-error';
import { getPublicProjectAttachments } from './list';
import { AttachmentService } from '../../../../../services/attachment-service';
import { GetAttachmentsData } from '../../../../../models/project-attachments';

chai.use(sinonChai);

describe('getPublicProjectAttachments', () => {
  const dbConnectionObj = getMockDBConnection();

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

  it('should throw a 400 error when no projectId is provided', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      await getPublicProjectAttachments()(
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

  it('should return a list of project attachments, on success', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(AttachmentService.prototype, 'getAttachments').resolves(new GetAttachmentsData());

    await getPublicProjectAttachments()(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.be.eql(new GetAttachmentsData());
  });
});
