import chai, { expect } from 'chai';
import { GeoJsonProperties, Geometry } from 'geojson';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import * as shp from 'shpjs';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import { ApiError } from '../errors/custom-error';
import {
  GetTreatmentFeatureTypes,
  TreatmentFeature,
  GetTreatmentTypes,
  ITreatmentUnitInsertOrExists,
  TreatmentFeatureProperties
} from '../models/project-treatment';
import { queries } from '../queries/queries';
import { getMockDBConnection } from '../__mocks__/db';
import { TreatmentService } from './treatment-service';

chai.use(sinonChai);

describe.only('TreatmentService', () => {
  describe('handleShapeFileFeatures', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw an error when no file is supplied', async function () {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });
      const treatmentService = new TreatmentService(mockDBConnection);

      const file = (null as unknown) as Express.Multer.File;

      const response = await treatmentService.handleShapeFileFeatures(file);

      expect(response).to.be.null;
    });

    it('should return TreatmentFeature array', async function () {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });
      const treatmentService = new TreatmentService(mockDBConnection);

      const file = {
        buffer: Buffer.from('<file1data>') as Buffer
      } as Express.Multer.File;

      const shpResponse = {
        type: 'FeatureCollection',
        features: [
          { type: 'Feature', geometry: ([] as unknown) as Geometry, properties: ([] as unknown) as GeoJsonProperties }
        ],
        fileName: 'name'
      } as shp.FeatureCollectionWithFilename;

      sinon.stub(treatmentService, 'parseShapeFile').resolves(shpResponse);

      const response = await treatmentService.handleShapeFileFeatures(file);

      expect(typeof response).to.be.equal(typeof ({} as TreatmentFeature));
    });
  });

  describe('getTreatmentFeatureTypes', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns null if the query response has no rows', async function () {
      const mockQueryResponse = ({} as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });

      const mockTreatmentFeatureTypesSQLResponse = SQL`valid SQL`;
      sinon.stub(queries.project, 'getTreatmentFeatureTypesSQL').returns(mockTreatmentFeatureTypesSQLResponse);

      const treatmentService = new TreatmentService(mockDBConnection);

      try {
        await treatmentService.getTreatmentFeatureTypes();
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to get project treatment feature type data');
      }
    });

    it('returns FeatureType rows for the response', async function () {
      const featureRow = { feature_type_id: 1, name: 'type', description: 'desc' };

      const mockQueryResponse = ({ rows: [featureRow] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });

      const mockTreatmentFeatureTypesSQLResponse = SQL`valid SQL`;
      sinon.stub(queries.project, 'getTreatmentFeatureTypesSQL').returns(mockTreatmentFeatureTypesSQLResponse);

      const treatmentService = new TreatmentService(mockDBConnection);

      const result = await treatmentService.getTreatmentFeatureTypes();

      expect(result[0]).to.eql(new GetTreatmentFeatureTypes(featureRow));
    });
  });

  describe('getTreatmentUnitTypes', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns null if the query response has no rows', async function () {
      const mockQueryResponse = ({} as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });

      const mockTreatmentUnitTypesSQLResponse = SQL`valid SQL`;
      sinon.stub(queries.project, 'getTreatmentUnitTypesSQL').returns(mockTreatmentUnitTypesSQLResponse);

      const treatmentService = new TreatmentService(mockDBConnection);

      try {
        await treatmentService.getTreatmentUnitTypes();
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to get project treatment unit type data');
      }
    });

    it('returns FeatureType rows for the response', async function () {
      const treatmentTypeRow = { treatment_type_id: 1, name: 'type', description: 'desc' };

      const mockQueryResponse = ({ rows: [treatmentTypeRow] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });

      const mockTreatmentUnitTypesSQLResponse = SQL`valid SQL`;
      sinon.stub(queries.project, 'getTreatmentUnitTypesSQL').returns(mockTreatmentUnitTypesSQLResponse);

      const treatmentService = new TreatmentService(mockDBConnection);

      const result = await treatmentService.getTreatmentUnitTypes();

      expect(result[0]).to.eql(new GetTreatmentTypes(treatmentTypeRow));
    });
  });

  describe('getEqualTreatmentFeatureTypeIds', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('should return "Other" featureTypeObj when no vaild featureType is given', async function () {
      const featureRow = { feature_type_id: 1, name: 'Road', description: 'desc' };
      const featureOtherRow = { feature_type_id: 8, name: 'Other', description: 'desc' };

      const mockQueryResponse = ({ rows: [featureRow, featureOtherRow] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });

      const treatmentService = new TreatmentService(mockDBConnection);

      const treatmentProperties = { FEATURE_TY: 'something' } as TreatmentFeatureProperties;

      const response = await treatmentService.getEqualTreatmentFeatureTypeIds(treatmentProperties);

      expect(response.name).to.be.equal('Other');
    });

    it('should return the same featureTypeObj when vaild featureType is given', async function () {
      const featureRow = { feature_type_id: 1, name: 'Road', description: 'desc' };
      const featureOtherRow = { feature_type_id: 8, name: 'Other', description: 'desc' };

      const mockQueryResponse = ({ rows: [featureRow, featureOtherRow] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });

      const treatmentService = new TreatmentService(mockDBConnection);

      const treatmentProperties = { FEATURE_TY: 'Road' } as TreatmentFeatureProperties;

      const response = await treatmentService.getEqualTreatmentFeatureTypeIds(treatmentProperties);

      expect(response.name).to.be.equal('Road');
    });
  });

  describe('insertTreatmentUnit', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw an error when no sql statement produced', async function () {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });
      const treatmentService = new TreatmentService(mockDBConnection);

      const mockGetEqualTreatmentFeatureTypes = {
        feature_type_id: 1,
        name: 'Road',
        description: 'desc'
      } as GetTreatmentFeatureTypes;

      sinon.stub(treatmentService, 'getEqualTreatmentFeatureTypeIds').resolves(mockGetEqualTreatmentFeatureTypes);

      const mockTreatmentUnitTypesSQLResponse = null;
      sinon.stub(queries.project, 'postTreatmentUnitSQL').returns(mockTreatmentUnitTypesSQLResponse);

      const treatmentProperties = { FEATURE_TY: 'something' } as TreatmentFeatureProperties;
      const treatmentGeometry = {} as Geometry;

      try {
        await treatmentService.insertTreatmentUnit(1, treatmentProperties, treatmentGeometry);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to build SQL insert statement');
      }
    });

    it('returns null if the query response has no rows', async function () {
      const mockQueryResponse = ({} as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });
      const treatmentService = new TreatmentService(mockDBConnection);

      const mockGetEqualTreatmentFeatureTypes = {
        feature_type_id: 1,
        name: 'Road',
        description: 'desc'
      } as GetTreatmentFeatureTypes;

      sinon.stub(treatmentService, 'getEqualTreatmentFeatureTypeIds').resolves(mockGetEqualTreatmentFeatureTypes);

      const mockTreatmentUnitTypesSQLResponse = SQL`Valid SQL return`;
      sinon.stub(queries.project, 'postTreatmentUnitSQL').returns(mockTreatmentUnitTypesSQLResponse);

      const treatmentProperties = {
        OBJECTID: 1,
        Treatment_: 1,
        Width_m: 240,
        Length_m: 3498,
        Reconnaiss: 'Y',
        Leave_for_: 'N',
        Treatment1: 'Tree bending; Tree felling; Seeding',
        FEATURE_TY: 'Transect',
        ROAD_ID: 0,
        SHAPE_Leng: 3498.988939
      } as TreatmentFeatureProperties;
      const treatmentGeometry = {
        bbox: [-122.46204108416048, 58.44944100517593, -122.44525166669784, 58.479595787093686],
        type: 'LineString',
        coordinates: [
          [-122.44525166669784, 58.479595787093665],
          [-122.46204108416048, 58.44944100517593]
        ]
      } as Geometry;

      try {
        await treatmentService.insertTreatmentUnit(1, treatmentProperties, treatmentGeometry);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to insert treatment unit data');
      }
    });

    it('returns TreatmentUnitId rows for the response', async function () {
      const treatmentUnitRow = { treatment_unit_id: 1, revision_count: 0 } as ITreatmentUnitInsertOrExists;

      const mockQueryResponse = ({ rows: [treatmentUnitRow] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });
      const treatmentService = new TreatmentService(mockDBConnection);

      const mockGetEqualTreatmentFeatureTypes = {
        feature_type_id: 1,
        name: 'Road',
        description: 'desc'
      } as GetTreatmentFeatureTypes;

      sinon.stub(treatmentService, 'getEqualTreatmentFeatureTypeIds').resolves(mockGetEqualTreatmentFeatureTypes);

      const mockTreatmentUnitTypesSQLResponse = SQL`Valid SQL return`;
      sinon.stub(queries.project, 'postTreatmentUnitSQL').returns(mockTreatmentUnitTypesSQLResponse);

      const treatmentProperties = {
        OBJECTID: 1,
        Treatment_: 1,
        Width_m: 240,
        Length_m: 3498,
        Reconnaiss: 'Y',
        Leave_for_: 'N',
        Treatment1: 'Tree bending; Tree felling; Seeding',
        FEATURE_TY: 'Transect',
        ROAD_ID: 0,
        SHAPE_Leng: 3498.988939
      } as TreatmentFeatureProperties;

      const treatmentGeometry = {
        bbox: [-122.46204108416048, 58.44944100517593, -122.44525166669784, 58.479595787093686],
        type: 'LineString',
        coordinates: [
          [-122.44525166669784, 58.479595787093665],
          [-122.46204108416048, 58.44944100517593]
        ]
      } as Geometry;

      const result = await treatmentService.insertTreatmentUnit(1, treatmentProperties, treatmentGeometry);

      expect(result).to.be.equal(treatmentUnitRow);
    });
  });
});
