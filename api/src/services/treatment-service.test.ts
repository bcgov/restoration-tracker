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
  TreatmentFeatureProperties,
  ITreatmentTypeInsertOrExists
} from '../models/project-treatment';
import { queries } from '../queries/queries';
import { getMockDBConnection } from '../__mocks__/db';
import { TreatmentService } from './treatment-service';
import { registerMockDBConnection } from '../__mocks__/db';

chai.use(sinonChai);

describe('TreatmentService', () => {
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

  describe('validateAllTreatmentUnitProperties', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('should return an array of invalid paramerters within a single treatment unit', async function () {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });
      const treatmentService = new TreatmentService(mockDBConnection);

      const treatmentUnit = [
        {
          properties: {
            OBJECTID: '',
            Treatment_: '',
            Width_m: '',
            Length_m: '',
            Reconnaiss: '',
            Leave_for_: '',
            Treatment1: 2,
            FEATURE_TY: '',
            ROAD_ID: '',
            SHAPE_Leng: ''
          }
        } as unknown
      ] as TreatmentFeature[];

      const response = await treatmentService.validateAllTreatmentUnitProperties(treatmentUnit);

      expect(response[0].missingProperties.length).to.be.equal(9);
    });

    it('should return an array of invalid units with invalid properties', async function () {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });
      const treatmentService = new TreatmentService(mockDBConnection);

      const treatmentUnit = [
        {
          properties: {
            OBJECTID: '',
            Treatment_: '',
            Width_m: '',
            Length_m: '',
            Reconnaiss: '',
            Leave_for_: '',
            Treatment1: 2,
            FEATURE_TY: '',
            ROAD_ID: '',
            SHAPE_Leng: ''
          }
        } as unknown,
        {
          properties: {
            OBJECTID: '',
            Treatment_: '',
            Width_m: '',
            Length_m: '',
            Reconnaiss: '',
            Leave_for_: '',
            Treatment1: 2,
            FEATURE_TY: '',
            ROAD_ID: '',
            SHAPE_Leng: ''
          }
        } as unknown
      ] as TreatmentFeature[];

      const response = await treatmentService.validateAllTreatmentUnitProperties(treatmentUnit);

      expect(response.length).to.be.equal(2);
    });

    it('should return an empty array when valid properties are given', async function () {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });
      const treatmentService = new TreatmentService(mockDBConnection);

      const treatmentUnit = [
        {
          properties: {
            OBJECTID: 1,
            Treatment_: 2,
            Width_m: 3,
            Length_m: 4,
            Reconnaiss: 'Y',
            Leave_for_: 'Y',
            Treatment1: 'string',
            FEATURE_TY: 'string',
            ROAD_ID: 5,
            SHAPE_Leng: 22.22
          }
        } as unknown
      ] as TreatmentFeature[];

      const response = await treatmentService.validateAllTreatmentUnitProperties(treatmentUnit);

      expect(response.length).to.be.equal(0);
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

    it('returns TreatmentType rows for the response', async function () {
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

  describe('insertTreatmentData', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement produced', async function () {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });

      const mockTreatmentDataInsertSQLResponse = null;
      sinon.stub(queries.project, 'postTreatmentDataSQL').returns(mockTreatmentDataInsertSQLResponse);

      const treatmentService = new TreatmentService(mockDBConnection);

      try {
        await treatmentService.insertTreatmentData(1, 2);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to build SQL insert statement');
      }
    });

    it('should throw a 400 error when query connection returns empty', async function () {
      const mockQueryResponse = ({} as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });
      const treatmentService = new TreatmentService(mockDBConnection);

      const mockTreatmentDataInsertSQLResponse = SQL`Vaild SQL`;
      sinon.stub(queries.project, 'postTreatmentDataSQL').returns(mockTreatmentDataInsertSQLResponse);

      try {
        await treatmentService.insertTreatmentData(1, 2);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to insert treatment data');
      }
    });

    it('should return obj with treatmentId and revision count', async function () {
      const mockQueryResponse = ({ rows: [{ treatment_id: 1, revision_count: 0 }] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });
      const treatmentService = new TreatmentService(mockDBConnection);

      const mockTreatmentDataInsertSQLResponse = SQL`Vaild SQL`;
      sinon.stub(queries.project, 'postTreatmentDataSQL').returns(mockTreatmentDataInsertSQLResponse);

      const response = await treatmentService.insertTreatmentData(1, 2);

      expect(response.treatment_id).to.be.equal(1);
    });
  });

  describe('insertTreatmentType', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement produced', async function () {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });

      const mockTreatmentTypeInsertSQLResponse = null;
      sinon.stub(queries.project, 'postTreatmentTypeSQL').returns(mockTreatmentTypeInsertSQLResponse);

      const treatmentService = new TreatmentService(mockDBConnection);

      try {
        await treatmentService.insertTreatmentType(1, 2);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to build SQL insert statement');
      }
    });

    it('should throw a 400 error when query connection returns empty', async function () {
      const mockQueryResponse = ({} as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });
      const treatmentService = new TreatmentService(mockDBConnection);

      const mockTreatmentTypeInsertSQLResponse = SQL`Vaild SQL`;
      sinon.stub(queries.project, 'postTreatmentTypeSQL').returns(mockTreatmentTypeInsertSQLResponse);

      try {
        await treatmentService.insertTreatmentType(1, 2);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to insert treatment unit type data');
      }
    });

    it('should return obj with treatment_treatment_type_id and revision count', async function () {
      const mockQueryResponse = ({
        rows: [{ treatment_treatment_type_id: 1, revision_count: 0 }]
      } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });
      const treatmentService = new TreatmentService(mockDBConnection);

      const mockTreatmentTypeInsertSQLResponse = SQL`Vaild SQL`;
      sinon.stub(queries.project, 'postTreatmentTypeSQL').returns(mockTreatmentTypeInsertSQLResponse);

      const response = await treatmentService.insertTreatmentType(1, 2);

      expect(response.treatment_treatment_type_id).to.be.equal(1);
    });
  });

  describe('insertAllTreatmentTypes', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when insert type returns empty', async function () {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });
      const treatmentService = new TreatmentService(mockDBConnection);

      const mocktreatmentUnitTypes = ([{ name: 'name' }] as unknown) as GetTreatmentTypes[];
      sinon.stub(treatmentService, 'getTreatmentUnitTypes').resolves(mocktreatmentUnitTypes);

      sinon.stub(treatmentService, 'insertTreatmentType').resolves((null as unknown) as ITreatmentTypeInsertOrExists);

      const mockTreatmentFeatureProperties = ({ Treatment1: 'name; ' } as unknown) as TreatmentFeatureProperties;

      try {
        await treatmentService.insertAllTreatmentTypes(1, mockTreatmentFeatureProperties);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to insert treatment unit type data');
      }
    });

    it('should call insert function twice with two matching type ids', async function () {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });
      const treatmentService = new TreatmentService(mockDBConnection);

      const mocktreatmentUnitTypes = ([
        { treatment_type_id: 1, name: 'name' },
        { treatment_type_id: 2, name: 'second' }
      ] as unknown) as GetTreatmentTypes[];
      sinon.stub(treatmentService, 'getTreatmentUnitTypes').resolves(mocktreatmentUnitTypes);

      const insertTreatmentCall = sinon
        .stub(treatmentService, 'insertTreatmentType')
        .resolves({ treatment_treatment_type_id: 1 } as ITreatmentTypeInsertOrExists);

      const mockTreatmentFeatureProperties = ({ Treatment1: 'name; second' } as unknown) as TreatmentFeatureProperties;

      await treatmentService.insertAllTreatmentTypes(1, mockTreatmentFeatureProperties);

      expect(insertTreatmentCall).to.be.calledTwice;
    });
  });

  describe('getTreatmentUnitExist', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when sql statment fails to build', async function () {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });
      const treatmentService = new TreatmentService(mockDBConnection);

      sinon.stub(queries.project, 'getTreatmentUnitExistSQL').returns(null);

      try {
        await treatmentService.getTreatmentUnitExist(1, 1, 1);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to build SQL update statement');
      }
    });

    it('should return null if query fails', async function () {
      const mockQueryResponse = ({} as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });
      const treatmentService = new TreatmentService(mockDBConnection);

      sinon.stub(queries.project, 'getTreatmentUnitExistSQL').returns(SQL`valid SQL`);

      const response = await treatmentService.getTreatmentUnitExist(1, 1, 1);

      expect(response).to.be.null;
    });

    it('should return treatment_unit_id when treatment unit is found', async function () {
      const mockQueryResponse = ({ rows: [{ treatment_unit_id: 1 }] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });
      const treatmentService = new TreatmentService(mockDBConnection);

      sinon.stub(queries.project, 'getTreatmentUnitExistSQL').returns(SQL`valid SQL`);

      const response = await treatmentService.getTreatmentUnitExist(1, 1, 1);

      expect(response?.treatment_unit_id).to.be.equal(1);
    });
  });

  describe('getTreatmentDataYearExist', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when sql statment fails to build', async function () {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });
      const treatmentService = new TreatmentService(mockDBConnection);

      sinon.stub(queries.project, 'getTreatmentDataYearExistSQL').returns(null);

      try {
        await treatmentService.getTreatmentDataYearExist(1, 1);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to build SQL update statement');
      }
    });

    it('should return null if query fails', async function () {
      const mockQueryResponse = ({} as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });
      const treatmentService = new TreatmentService(mockDBConnection);

      sinon.stub(queries.project, 'getTreatmentDataYearExistSQL').returns(SQL`valid SQL`);

      const response = await treatmentService.getTreatmentDataYearExist(1, 1);

      expect(response).to.be.null;
    });

    it('should return treatment_id when treatment unit is found', async function () {
      const mockQueryResponse = ({ rows: [{ treatment_id: 1 }] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });
      const treatmentService = new TreatmentService(mockDBConnection);

      sinon.stub(queries.project, 'getTreatmentDataYearExistSQL').returns(SQL`valid SQL`);

      const response = await treatmentService.getTreatmentDataYearExist(1, 1);

      expect(response?.treatment_id).to.be.equal(1);
    });
  });

  describe('getTreatments of various sizes', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('fetches a treatment unit with no treatments', async () => {
      const treatmentList = [
        {
          id: '1',
          type: 'Other',
          width: 240,
          length: 3498,
          area: 839520,
          treatment_year: '',
          treatment_name: ''
        },
        {
          id: '1',
          type: 'Other',
          width: 240,
          length: 3498,
          area: 839520,
          treatment_year: '',
          treatment_name: ''
        }
      ];

      const mockDBConnection = registerMockDBConnection({
        query: sinon.stub().resolves({ rows: treatmentList })
      });

      const treatmentService = new TreatmentService(mockDBConnection);

      const response = await treatmentService.getTreatments(1);

      expect(response).to.eql({
        treatmentList: [
          {
            id: '1',
            type: 'Other',
            width: 240,
            length: 3498,
            area: 839520,
            treatments: [
              {
                treatment_year: '',
                treatment_name: ''
              },
              {
                treatment_year: '',
                treatment_name: ''
              }
            ]
          }
        ]
      });
    });
    it('fetches a treatment unit with one treatment', async () => {
      const treatmentList = [
        {
          id: '1',
          type: 'Other',
          width: 240,
          length: 3498,
          area: 839520,
          treatment_year: '2020',
          treatment_name: 'Seeding'
        }
      ];

      const mockDBConnection = registerMockDBConnection({
        query: sinon.stub().resolves({ rows: treatmentList })
      });

      const treatmentService = new TreatmentService(mockDBConnection);

      const response = await treatmentService.getTreatments(1);

      expect(response).to.eql({
        treatmentList: [
          {
            id: '1',
            type: 'Other',
            width: 240,
            length: 3498,
            area: 839520,
            treatments: [
              {
                treatment_year: '2020',
                treatment_name: 'Seeding'
              }
            ]
          }
        ]
      });
    });

    it('fetches a treatment unit with multiple treatments', async () => {
      const treatmentList = [
        {
          id: '1',
          type: 'Other',
          width: 240,
          length: 3498,
          area: 839520,
          treatment_year: '2020',
          treatment_name: 'Seeding'
        },
        {
          id: '1',
          type: 'Other',
          width: 240,
          length: 3498,
          area: 839520,
          treatment_year: '2021',
          treatment_name: 'Tree Felling'
        }
      ];

      const mockDBConnection = registerMockDBConnection({
        query: sinon.stub().resolves({ rows: treatmentList })
      });

      const treatmentService = new TreatmentService(mockDBConnection);

      const response = await treatmentService.getTreatments(1);

      expect(response).to.eql({
        treatmentList: [
          {
            id: '1',
            type: 'Other',
            width: 240,
            length: 3498,
            area: 839520,
            treatments: [
              {
                treatment_year: '2020',
                treatment_name: 'Seeding'
              },
              {
                treatment_year: '2021',
                treatment_name: 'Tree Felling'
              }
            ]
          }
        ]
      });
    });

    it('fetches multiple treatment units with multiple treatments', async () => {
      const treatmentList = [
        {
          id: '1',
          type: 'Other',
          width: 240,
          length: 3498,
          area: 839520,
          treatment_year: '2020',
          treatment_name: 'Seeding'
        },
        {
          id: '1',
          type: 'Other',
          width: 240,
          length: 3498,
          area: 839520,
          treatment_year: '2021',
          treatment_name: 'Tree Felling'
        },
        {
          id: '2',
          type: 'Other',
          width: 240,
          length: 3498,
          area: 839520,
          treatment_year: '2020',
          treatment_name: 'Seeding'
        },
        {
          id: '3',
          type: 'Other',
          width: 240,
          length: 3498,
          area: 839520,
          treatment_year: '2021',
          treatment_name: 'Tree Felling'
        }
      ];

      const mockDBConnection = registerMockDBConnection({
        query: sinon.stub().resolves({ rows: treatmentList })
      });

      const treatmentService = new TreatmentService(mockDBConnection);

      const response = await treatmentService.getTreatments(1);

      expect(response).to.eql({
        treatmentList: [
          {
            id: '1',
            type: 'Other',
            width: 240,
            length: 3498,
            area: 839520,
            treatments: [
              {
                treatment_year: '2020',
                treatment_name: 'Seeding'
              },
              {
                treatment_year: '2021',
                treatment_name: 'Tree Felling'
              }
            ]
          },
          {
            id: '2',
            type: 'Other',
            width: 240,
            length: 3498,
            area: 839520,
            treatments: [
              {
                treatment_year: '2020',
                treatment_name: 'Seeding'
              }
            ]
          },
          {
            id: '3',
            type: 'Other',
            width: 240,
            length: 3498,
            area: 839520,
            treatments: [
              {
                treatment_year: '2021',
                treatment_name: 'Tree Felling'
              }
            ]
          }
        ]
      });
    });
  });

  describe('deleteTreatmentUnit', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns empty on success', async () => {
      const mockQueryResponse = ({} as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'deleteProjectTreatmentUnitSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const treatmentUnitId = 1;

      const treatmentService = new TreatmentService(mockDBConnection);

      const result = await treatmentService.deleteTreatmentUnit(projectId, treatmentUnitId);

      expect(result).to.equal(undefined);
    });
  });

  describe('deleteTreatmentsByYear', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns empty on success', async () => {
      const mockQueryResponse = ({} as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'deleteProjectTreatmentsByYearSQL').returns(SQL`valid sql`);
      sinon.stub(queries.project, 'deleteProjectTreatmentUnitIfNoTreatmentsSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const year = 1;

      const treatmentService = new TreatmentService(mockDBConnection);

      const result = await treatmentService.deleteTreatmentsByYear(projectId, year);

      expect(result).to.equal(undefined);
    });
  });
});
