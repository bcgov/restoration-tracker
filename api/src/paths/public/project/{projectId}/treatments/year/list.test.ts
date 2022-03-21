import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../database/db';
import { getMockDBConnection } from '../../../../../../__mocks__/db';
import { HTTPError } from '../../../../../../errors/custom-error';
import { getTreatmentYears } from './list';
import { TreatmentService } from '../../../../../../services/treatment-service';
import { registerMockDBConnection } from '../../../../../../__mocks__/db';

chai.use(sinonChai);

describe('getTreatmentYears', () => {
  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    body: {},
    params: {
      projectId: 1
    }
  } as any;

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no projectId is provided', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      await getTreatmentYears()(
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

  it('should return a list of project treatment years, on success', async () => {
    const sampleTreatmentYears = [
      {
        year: '2020'
      },
      {
        year: '2021'
      }
    ];

    const mockDBConnection = registerMockDBConnection({
      query: sinon.stub().resolves({ rows: sampleTreatmentYears })
    });

    const treatmentService = new TreatmentService(mockDBConnection);

    const response = await treatmentService.getProjectTreatmentsYears(1);

    expect(response).to.be.eql([
      {
        year: '2020'
      },
      {
        year: '2021'
      }
    ]);
  });
});
