import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as codes from './codes';
import * as db from '../database/db';
import * as code_utils from '../utils/code-utils';
import { getMockDBConnection } from '../__mocks__/db';
import { HTTPError } from '../errors/custom-error';

chai.use(sinonChai);

describe('codes', () => {
  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {}
  } as any;

  let actualResult = {
    first_nations: null
  };

  const sampleRes = {
    status: () => {
      return {
        json: (result: any) => {
          actualResult = result;
        }
      };
    }
  };

  describe('getAllCodes', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 500 error when fails to fetch codes', async () => {
      sinon.stub(db, 'getAPIUserDBConnection').returns(dbConnectionObj);
      sinon.stub(code_utils, 'getAllCodeSets').resolves(null);

      try {
        const result = codes.getAllCodes();

        await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(500);
        expect((actualError as HTTPError).message).to.equal('Failed to fetch codes');
      }
    });

    it('should return the fetched codes on success', async () => {
      sinon.stub(db, 'getAPIUserDBConnection').returns(dbConnectionObj);
      sinon.stub(code_utils, 'getAllCodeSets').resolves({
        first_nations: { id: 1, name: 'a first nation' }
      } as any);

      const result = codes.getAllCodes();

      await result(sampleReq, sampleRes as any, (null as unknown) as any);

      expect(actualResult.first_nations).to.eql({ id: 1, name: 'a first nation' });
    });

    it('should throw an error when a failure occurs', async () => {
      const expectedError = new Error('cannot process request');

      sinon.stub(db, 'getAPIUserDBConnection').returns(dbConnectionObj);
      sinon.stub(code_utils, 'getAllCodeSets').rejects(expectedError);

      try {
        const result = codes.getAllCodes();

        await result(sampleReq, sampleRes as any, (null as unknown) as any);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal(expectedError.message);
      }
    });
  });
});
