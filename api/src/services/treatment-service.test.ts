import chai, { expect } from 'chai';
import { Feature } from 'geojson';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import { ApiError } from '../errors/custom-error';
import { GetTreatmentFeatureTypes, GetTreatmentTypes } from '../models/project-treatment';
import { queries } from '../queries/queries';
import { getMockDBConnection } from '../__mocks__/db';
import { TreatmentService } from './treatment-service';

chai.use(sinonChai);

describe('TreatmentService', () => {
  describe('getTreatmentFeatureTypes', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw an error when no sql statement produced', async function () {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });

      const mockTreatmentFeatureTypesSQLResponse = null;
      sinon.stub(queries.project, 'getTreatmentFeatureTypesSQL').returns(mockTreatmentFeatureTypesSQLResponse);

      const userService = new TreatmentService(mockDBConnection);

      try {
        await userService.getTreatmentFeatureTypes();
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to build SQL get statement');
      }
    });

    it('returns null if the query response has no rows', async function () {
      const mockQueryResponse = ({ rows: [] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });

      const mockTreatmentFeatureTypesSQLResponse = SQL`valid SQL`;
      sinon.stub(queries.project, 'getTreatmentFeatureTypesSQL').returns(mockTreatmentFeatureTypesSQLResponse);

      const userService = new TreatmentService(mockDBConnection);

      const result = await userService.getTreatmentFeatureTypes();

      expect(result).to.be.empty;
    });

    it('returns FeatureType rows for the response', async function () {
      const featureRow = { feature_type_id: 1, name: 'type', description: 'desc' };

      const mockQueryResponse = ({ rows: [featureRow] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });

      const mockTreatmentFeatureTypesSQLResponse = SQL`valid SQL`;
      sinon.stub(queries.project, 'getTreatmentFeatureTypesSQL').returns(mockTreatmentFeatureTypesSQLResponse);

      const userService = new TreatmentService(mockDBConnection);

      const result = await userService.getTreatmentFeatureTypes();

      expect(result[0]).to.eql(new GetTreatmentFeatureTypes(featureRow));
    });
  });

  describe('getTreatmentUnitTypes', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw an error when no sql statement produced', async function () {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });

      const mockTreatmentUnitTypesSQLResponse = null;
      sinon.stub(queries.project, 'getTreatmentUnitTypesSQL').returns(mockTreatmentUnitTypesSQLResponse);

      const userService = new TreatmentService(mockDBConnection);

      try {
        await userService.getTreatmentUnitTypes();
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to build SQL get statement');
      }
    });

    it('returns null if the query response has no rows', async function () {
      const mockQueryResponse = ({ rows: [] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });

      const mockTreatmentUnitTypesSQLResponse = SQL`valid SQL`;
      sinon.stub(queries.project, 'getTreatmentUnitTypesSQL').returns(mockTreatmentUnitTypesSQLResponse);

      const userService = new TreatmentService(mockDBConnection);

      const result = await userService.getTreatmentUnitTypes();

      expect(result).to.be.empty;
    });

    it('returns FeatureType rows for the response', async function () {
      const treatmentTypeRow = { treatment_type_id: 1, name: 'type', description: 'desc' };

      const mockQueryResponse = ({ rows: [treatmentTypeRow] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });

      const mockTreatmentUnitTypesSQLResponse = SQL`valid SQL`;
      sinon.stub(queries.project, 'getTreatmentUnitTypesSQL').returns(mockTreatmentUnitTypesSQLResponse);

      const userService = new TreatmentService(mockDBConnection);

      const result = await userService.getTreatmentUnitTypes();

      expect(result[0]).to.eql(new GetTreatmentTypes(treatmentTypeRow));
    });
  });

  describe('getEqualTreatmentFeatureTypeIds', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw an error when no featureType is given', async function () {
      const featureRow = { feature_type_id: 1, name: 'type', description: 'desc' };

      const mockQueryResponse = ({ rows: [featureRow] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });

      const userService = new TreatmentService(mockDBConnection);

      const treatmentProperties = {} as Feature['properties'];
      try {
        await userService.getEqualTreatmentFeatureTypeIds(treatmentProperties);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('No Feature Type provided in properties');
      }
    });
  });
});
