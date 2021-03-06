import chai, { expect } from 'chai';
import { Feature, GeoJsonProperties, Geometry } from 'geojson';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import * as shp from 'shpjs';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import { ApiError } from '../errors/custom-error';
import {
  GetTreatmentFeatureTypes,
  GetTreatmentTypes,
  ITreatmentTypeInsertOrExists,
  ITreatmentUnitInsertOrExists,
  TreatmentFeature,
  TreatmentFeatureProperties
} from '../models/project-treatment';
import { queries } from '../queries/queries';
import { getMockDBConnection, registerMockDBConnection } from '../__mocks__/db';
import { TreatmentService } from './treatment-service';

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

    it('should return an array of invalid parameters within a single treatment unit', async function () {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });
      const treatmentService = new TreatmentService(mockDBConnection);

      const treatmentUnit = [
        {
          properties: {
            TU_ID: '',
            Year: '',
            Fe_Type: '',
            Width_m: '',
            Length_m: '',
            Area_m2: '',
            Recce: '',
            Treatments: '',
            Implement: '',
            Comments: ''
          }
        } as unknown
      ] as TreatmentFeature[];

      const response = await treatmentService.validateAllTreatmentUnitProperties(treatmentUnit);

      expect(response[0].errors.length).to.be.equal(6);
    });

    it('should return an array of invalid units with invalid properties', async function () {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });
      const treatmentService = new TreatmentService(mockDBConnection);

      const treatmentUnit = [
        {
          properties: {
            TU_ID: '',
            Year: '',
            Fe_Type: '',
            Width_m: '',
            Length_m: '',
            Area_m2: '',
            Recce: '',
            Treatments: '',
            Implement: '',
            Comments: ''
          }
        } as unknown,
        {
          properties: {
            TU_ID: '',
            Year: '',
            Fe_Type: '',
            Width_m: '',
            Length_m: '',
            Area_m2: '',
            Recce: '',
            Treatments: '',
            Implement: '',
            Comments: ''
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
            TU_ID: '1',
            Year: 2020,
            Fe_Type: 'Transect',
            Width_m: 240,
            Length_m: 3498,
            Area_m2: 10,
            Recce: 'Y',
            Treatments: 'Tree bending; ',
            Implement: 'Y',
            Comments: 'something'
          }
        } as unknown
      ] as TreatmentFeature[];

      sinon
        .stub(treatmentService, 'getTreatmentFeatureTypeObjs')
        .resolves({ feature_type_id: 1, name: 'Transect', description: 'string;' });

      sinon
        .stub(treatmentService, 'getAllTreatmentTypes')
        .resolves([{ treatment_type_id: 1, name: 'Tree bending', description: 'string;' }]);

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
        await treatmentService.getAllTreatmentFeatureTypes();
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

      const result = await treatmentService.getAllTreatmentFeatureTypes();

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
        await treatmentService.getAllTreatmentUnitTypes();
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

      const result = await treatmentService.getAllTreatmentUnitTypes();

      expect(result[0]).to.eql(new GetTreatmentTypes(treatmentTypeRow));
    });
  });

  describe('getEqualTreatmentFeatureTypeIds', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('should return "undefined" featureTypeObj when no vaild featureType is given', async function () {
      const featureRow = { feature_type_id: 1, name: 'Road', description: 'desc' };
      const featureOtherRow = { feature_type_id: 8, name: 'Other', description: 'desc' };

      const mockQueryResponse = ({ rows: [featureRow, featureOtherRow] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });

      const treatmentService = new TreatmentService(mockDBConnection);

      const treatmentProperties = { Fe_Type: 'something' } as TreatmentFeatureProperties;

      const response = await treatmentService.getTreatmentFeatureTypeObjs(treatmentProperties);

      expect(response?.name).to.be.equal(undefined);
    });

    it('should return the same featureTypeObj when vaild featureType is given', async function () {
      const featureRow = { feature_type_id: 1, name: 'Road', description: 'desc' };
      const featureOtherRow = { feature_type_id: 8, name: 'Other', description: 'desc' };

      const mockQueryResponse = ({ rows: [featureRow, featureOtherRow] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });

      const treatmentService = new TreatmentService(mockDBConnection);

      const treatmentProperties = { Fe_Type: 'Road' } as TreatmentFeatureProperties;

      const response = await treatmentService.getTreatmentFeatureTypeObjs(treatmentProperties);

      expect(response?.name).to.be.equal('Road');
    });
  });

  describe('insertTreatmentUnit', function () {
    afterEach(() => {
      sinon.restore();
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

      sinon.stub(treatmentService, 'getTreatmentFeatureTypeObjs').resolves(mockGetEqualTreatmentFeatureTypes);

      const mockTreatmentUnitTypesSQLResponse = SQL`Valid SQL return`;
      sinon.stub(queries.project, 'postTreatmentUnitSQL').returns(mockTreatmentUnitTypesSQLResponse);

      const treatmentFeatureObj = {
        geometry: {
          bbox: [-122.46204108416048, 58.44944100517593, -122.44525166669784, 58.479595787093686],
          type: 'LineString',
          coordinates: [
            [-122.44525166669784, 58.479595787093665],
            [-122.46204108416048, 58.44944100517593]
          ]
        },
        properties: {
          TU_ID: '1',
          Year: 2020,
          Fe_Type: 'Transect',
          Width_m: 240,
          Length_m: 3498,
          Area_m2: 10,
          Recce: 'Y',
          Treatments: 'Tree bending; Tree felling; Seeding',
          Implement: 'Y',
          Comments: 'something'
        }
      } as TreatmentFeature;

      try {
        await treatmentService.insertTreatmentUnit(1, treatmentFeatureObj);
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

      sinon.stub(treatmentService, 'getTreatmentFeatureTypeObjs').resolves(mockGetEqualTreatmentFeatureTypes);

      const mockTreatmentUnitTypesSQLResponse = SQL`Valid SQL return`;
      sinon.stub(queries.project, 'postTreatmentUnitSQL').returns(mockTreatmentUnitTypesSQLResponse);

      const treatmentFeatureObj = {
        geometry: {
          bbox: [-122.46204108416048, 58.44944100517593, -122.44525166669784, 58.479595787093686],
          type: 'LineString',
          coordinates: [
            [-122.44525166669784, 58.479595787093665],
            [-122.46204108416048, 58.44944100517593]
          ]
        },
        properties: {
          TU_ID: '1',
          Year: 2020,
          Fe_Type: 'Transect',
          Width_m: 240,
          Length_m: 3498,
          Area_m2: 10,
          Recce: 'Y',
          Treatments: 'Tree bending; Tree felling; Seeding',
          Implement: 'Y',
          Comments: 'something'
        }
      } as TreatmentFeature;

      const result = await treatmentService.insertTreatmentUnit(1, treatmentFeatureObj);

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
      sinon.stub(treatmentService, 'getAllTreatmentUnitTypes').resolves(mocktreatmentUnitTypes);

      sinon.stub(treatmentService, 'insertTreatmentType').resolves((null as unknown) as ITreatmentTypeInsertOrExists);

      const mockTreatmentFeatureProperties = ({ Treatments: 'name; ' } as unknown) as TreatmentFeatureProperties;

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
      sinon.stub(treatmentService, 'getAllTreatmentUnitTypes').resolves(mocktreatmentUnitTypes);

      const insertTreatmentCall = sinon
        .stub(treatmentService, 'insertTreatmentType')
        .resolves({ treatment_treatment_type_id: 1 } as ITreatmentTypeInsertOrExists);

      const mockTreatmentFeatureProperties = ({ Treatments: 'name; second' } as unknown) as TreatmentFeatureProperties;

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
        await treatmentService.getTreatmentDataYearExist(1, 2020);
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

      const response = await treatmentService.getTreatmentDataYearExist(1, 2020);

      expect(response).to.be.null;
    });

    it('should return treatment_id when treatment unit is found', async function () {
      const mockQueryResponse = ({ rows: [{ treatment_id: 1 }] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });
      const treatmentService = new TreatmentService(mockDBConnection);

      sinon.stub(queries.project, 'getTreatmentDataYearExistSQL').returns(SQL`valid SQL`);

      const response = await treatmentService.getTreatmentDataYearExist(1, 2020);

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
          geojson: [{} as Feature],
          comments: '',
          treatment_year: '',
          treatment_name: ''
        },
        {
          id: '1',
          type: 'Other',
          width: 240,
          length: 3498,
          area: 839520,
          comments: '',
          geojson: [{} as Feature],
          treatment_year: '',
          treatment_name: ''
        }
      ];

      const mockDBConnection = registerMockDBConnection({
        knex: sinon.stub().resolves({ rows: treatmentList })
      });

      const treatmentService = new TreatmentService(mockDBConnection);

      const response = await treatmentService.getTreatmentsByCriteria(1, {});

      expect(response).to.eql({
        treatmentList: [
          {
            id: '1',
            type: 'Other',
            width: 240,
            length: 3498,
            area: 839520,
            geometry: {},
            comments: '',
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
          geojson: [{} as Feature],
          comments: '',
          treatment_year: '2020',
          treatment_name: 'Seeding'
        }
      ];

      const mockDBConnection = registerMockDBConnection({
        knex: sinon.stub().resolves({ rows: treatmentList })
      });

      const treatmentService = new TreatmentService(mockDBConnection);

      const response = await treatmentService.getTreatmentsByCriteria(1, { years: ['2020'] });

      expect(response).to.eql({
        treatmentList: [
          {
            id: '1',
            type: 'Other',
            width: 240,
            length: 3498,
            area: 839520,
            geometry: {},
            comments: '',
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
          geojson: [{} as Feature],
          comments: '',
          treatment_year: '2020',
          treatment_name: 'Seeding'
        },
        {
          id: '1',
          type: 'Other',
          width: 240,
          length: 3498,
          area: 839520,
          geojson: [{} as Feature],
          comments: '',
          treatment_year: '2021',
          treatment_name: 'Tree Felling'
        }
      ];

      const mockDBConnection = registerMockDBConnection({
        knex: sinon.stub().resolves({ rows: treatmentList })
      });

      const treatmentService = new TreatmentService(mockDBConnection);

      const response = await treatmentService.getTreatmentsByCriteria(1, { years: ['2020'] });

      expect(response).to.eql({
        treatmentList: [
          {
            id: '1',
            type: 'Other',
            width: 240,
            length: 3498,
            area: 839520,
            geometry: {},
            comments: '',
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
          geojson: [{} as Feature],
          comments: '',
          treatment_year: '2020',
          treatment_name: 'Seeding'
        },
        {
          id: '1',
          type: 'Other',
          width: 240,
          length: 3498,
          area: 839520,
          geojson: [{} as Feature],
          comments: '',
          treatment_year: '2021',
          treatment_name: 'Tree Felling'
        },
        {
          id: '2',
          type: 'Other',
          width: 240,
          length: 3498,
          area: 839520,
          geojson: [{} as Feature],
          comments: '',
          treatment_year: '2020',
          treatment_name: 'Seeding'
        },
        {
          id: '3',
          type: 'Other',
          width: 240,
          length: 3498,
          area: 839520,
          geojson: [{} as Feature],
          comments: '',
          treatment_year: '2021',
          treatment_name: 'Tree Felling'
        }
      ];

      const mockDBConnection = registerMockDBConnection({
        knex: sinon.stub().resolves({ rows: treatmentList })
      });

      const treatmentService = new TreatmentService(mockDBConnection);

      const response = await treatmentService.getTreatmentsByCriteria(1, { years: ['2020'] });

      expect(response).to.eql({
        treatmentList: [
          {
            id: '1',
            type: 'Other',
            width: 240,
            length: 3498,
            area: 839520,
            geometry: {},
            comments: '',
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
            geometry: {},
            comments: '',
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
            geometry: {},
            comments: '',
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

  describe('deleteTreatments', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns empty on success', async () => {
      const mockQueryResponse = ({} as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'deleteProjectTreatmentsSQL').returns(SQL`valid sql`);

      const projectId = 1;

      const treatmentService = new TreatmentService(mockDBConnection);

      const result = await treatmentService.deleteTreatments(projectId);

      expect(result).to.equal(undefined);
    });
  });
});
