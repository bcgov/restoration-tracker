import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../database/db';
import { HTTPError } from '../../../../../../errors/custom-error';
import { TreatmentService } from '../../../../../../services/treatment-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';
import * as delete_treatment_unit from './delete';

chai.use(sinonChai);

describe('deleteTreatmentsByYear', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    params: {
      projectId: 1,
      year: 2
    },
    body: {
      securityToken: 'token'
    }
  } as any;

  let statusCode = 0;

  const sampleRes = {
    status: (code: number) => {
      return {
        send: () => {
          statusCode = code;
        }
      };
    }
  };

  it('should throw an error when projectId is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = delete_treatment_unit.deleteTreatmentsByYear();

      await result(
        { ...sampleReq, params: { ...sampleReq.params, projectId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing projectId');
    }
  });

  it('should throw an error when year is missing', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = delete_treatment_unit.deleteTreatmentsByYear();

      await result(
        { ...sampleReq, params: { ...sampleReq.params, year: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing year');
    }
  });

  it('should return 200 response on success', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(TreatmentService.prototype, 'deleteTreatmentsByYear').resolves();

    const result = delete_treatment_unit.deleteTreatmentsByYear();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(statusCode).to.equal(200);
  });
  it('should throw an error when deleteTreatmentsByYear fails', async () => {
    const dbConnectionObj = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(TreatmentService.prototype, 'deleteTreatmentsByYear').rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      year: '2020'
    };

    try {
      const requestHandler = delete_treatment_unit.deleteTreatmentsByYear();
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(dbConnectionObj.rollback).to.have.been.called;
      expect(dbConnectionObj.release).to.have.been.called;
      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });
});
