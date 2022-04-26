import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../database/db';
import { HTTPError } from '../../../../errors/custom-error';
import { TreatmentFeature } from '../../../../models/project-treatment';
import { AttachmentService } from '../../../../services/attachment-service';
import { TreatmentService } from '../../../../services/treatment-service';
import * as file_utils from '../../../../utils/file-utils';
// import { TreatmentServoce } from '../../../../services/treatment-service';
import { getMockDBConnection } from '../../../../__mocks__/db';
import * as upload from './upload';

chai.use(sinonChai);

describe('uploadTreatments', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const mockReq = {
    keycloak_token: {},
    params: {
      projectId: 1,
      attachmentId: 2
    },
    files: [
      {
        fieldname: 'media',
        originalname: 'test.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 340
      }
    ],
    body: {}
  } as any;

  let actualResult: any = null;

  const mockRes = {
    status: () => {
      return {
        json: (result: any) => {
          actualResult = result;
        }
      };
    }
  } as any;

  it('should throw an error when projectId is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = upload.uploadTreatmentSpatial();

      await result(
        { ...mockReq, params: { ...mockReq.params, projectId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing projectId');
    }
  });

  it('should throw an error when files are missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = upload.uploadTreatmentSpatial();

      await result({ ...mockReq, files: [] }, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing upload data');
    }
  });

  it('should throw a 400 error when file contains malicious content', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(file_utils, 'scanFileForVirus').resolves(false);

    try {
      const result = upload.uploadTreatmentSpatial();

      await result(mockReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Malicious content detected, upload cancelled');
    }
  });

  it('should return ids on success with valid parameters', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(file_utils, 'scanFileForVirus').resolves(true);
    sinon.stub(TreatmentService.prototype, 'handleShapeFileFeatures').resolves([{} as TreatmentFeature]);

    sinon.stub(TreatmentService.prototype, 'validateAllTreatmentUnitProperties').resolves([]);
    sinon.stub(TreatmentService.prototype, 'insertAllProjectTreatmentUnits').resolves([1]);
    sinon.stub(AttachmentService.prototype, 'uploadMedia').resolves({ id: 1, revision_count: 0 });

    const result = upload.uploadTreatmentSpatial();

    await result(mockReq, mockRes as any, (null as unknown) as any);

    expect(actualResult).to.eql({ unitIds: [1] });
  });
});
