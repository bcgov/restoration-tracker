import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../database/db';
import { getMockDBConnection } from '../../../../__mocks__/db';
import { HTTPError } from '../../../../errors/custom-error';
import { getTreatments } from './list';
// import { TreatmentService } from '../../../../services/treatment-service';
// import { GetTreatmentData } from '../../../../models/treatment-view';
chai.use(sinonChai);

describe('getTreatments', () => {
  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    body: {},
    params: {
      projectId: 1
    }
  } as any;

  //let actualResult: any = null;

  // const sampleRes = {
  //   status: () => {
  //     return {
  //       json: (result: any) => {
  //         actualResult = result;
  //       }
  //     };
  //   }
  // };

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no projectId is provided', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      await getTreatments()(
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

  // it('should return a list of project treatments, on success', async () => {
  //   sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

  //   sinon.stub(TreatmentService.prototype, 'getTreatments').resolves(new GetTreatmentData());

  //   await getTreatments()(sampleReq, sampleRes as any, (null as unknown) as any);

  //   expect(actualResult).to.be.eql(new GetTreatmentData());
  // });
});
