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
  ValidTreatmentFeature,
  ValidTreatmentFeatureProperties
} from '../models/project-treatment';
import { queries } from '../queries/queries';
import { getMockDBConnection, registerMockDBConnection } from '../__mocks__/db';
import { TreatmentService } from './treatment-service';

chai.use(sinonChai);

describe('TreatmentService', () => {
  describe('parseShapefile', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw an error when no file is supplied', async function () {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });
      const treatmentService = new TreatmentService(mockDBConnection);

      const file = (null as unknown) as Express.Multer.File;

      const response = await treatmentService.parseShapefile(file);

      expect(response).to.be.null;
    });

    it('should return Feature array', async function () {
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

      const response = await treatmentService.parseShapefile(file);

      expect(typeof response).to.be.equal(typeof ({} as Feature));
    });
  });

  describe('parseFeatures', function () {
    let treatmentService: TreatmentService;

    beforeEach(() => {
      const mockDBConnection = getMockDBConnection();

      treatmentService = new TreatmentService(mockDBConnection);

      const mockTreatmentFeatureTypeObjects: GetTreatmentFeatureTypes[] = [
        { feature_type_id: 1, name: 'Transect', description: 'fe type1' }
      ];
      sinon.stub(treatmentService, 'getAllTreatmentFeatureTypes').resolves(mockTreatmentFeatureTypeObjects);

      const mockTreatmentUnitTypeObjects: GetTreatmentTypes[] = [
        { treatment_type_id: 2, name: 'Tree bending', description: 'treatment type1' },
        { treatment_type_id: 3, name: 'Seeding', description: 'treatment type2' }
      ];
      sinon.stub(treatmentService, 'getAllTreatmentUnitTypes').resolves(mockTreatmentUnitTypeObjects);
    });

    afterEach(() => {
      sinon.restore();
    });

    describe('should return an array of errors', async function () {
      it('when no properties provided', async function () {
        const treatmentUnit: Feature[] = [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [123, 123]
            },
            properties: {}
          }
        ];

        const response = await treatmentService.parseFeatures(treatmentUnit);

        expect(response.errors.length).to.be.equal(1);

        expect(response.errors[0].treatmentUnitId).to.be.equal('Invalid TU_ID');
        expect(response.errors[0].errors).to.be.eql([
          'TU_ID - Must be a number or alphanumeric/text.',
          'Year - Must be a 4 digit number.',
          'Fe_Type - Must be one of: [ Transect ].',
          'Area_m2 - Must be a positive number.',
          'Treatments - Must be one or more of: [ Tree bending, Seeding ]. If entering multiple treatment types, separate them with a semi-colon (ex: "Ripping; Seeding").'
        ]);
      });

      it('when empty string properties provided', async function () {
        const treatmentUnit: Feature[] = [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [123, 123]
            },
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
          }
        ];

        const response = await treatmentService.parseFeatures(treatmentUnit);

        expect(response.errors.length).to.be.equal(1);

        expect(response.errors[0].treatmentUnitId).to.be.equal('Invalid TU_ID');
        expect(response.errors[0].errors).to.be.eql([
          'TU_ID - Must be a number or alphanumeric/text.',
          'Year - Must be a 4 digit number. Must be greater than 1900',
          'Fe_Type - Must be one of: [ Transect ].',
          'Area_m2 - Must be a positive number.',
          'Treatments - Must be one or more of: [ Tree bending, Seeding ]. If entering multiple treatment types, separate them with a semi-colon (ex: "Ripping; Seeding").'
        ]);
      });

      it('when null properties provided', async function () {
        const treatmentUnit: Feature[] = [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [123, 123]
            },
            properties: {
              TU_ID: null,
              Year: null,
              Fe_Type: null,
              Width_m: null,
              Length_m: null,
              Area_m2: null,
              Recce: null,
              Treatments: null,
              Implement: null,
              Comments: null
            }
          }
        ];

        const response = await treatmentService.parseFeatures(treatmentUnit);

        expect(response.errors.length).to.be.equal(1);

        expect(response.errors[0].treatmentUnitId).to.be.equal('Invalid TU_ID');
        expect(response.errors[0].errors).to.be.eql([
          'TU_ID - Must be a number or alphanumeric/text.',
          'Year - Must be a 4 digit number. Must be greater than 1900',
          'Fe_Type - Must be one of: [ Transect ].',
          'Area_m2 - Must be a positive number.',
          'Treatments - Must be one or more of: [ Tree bending, Seeding ]. If entering multiple treatment types, separate them with a semi-colon (ex: "Ripping; Seeding").'
        ]);
      });

      it('when undefined properties provided', async function () {
        const treatmentUnit: Feature[] = [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [123, 123]
            },
            properties: {
              TU_ID: undefined,
              Year: undefined,
              Fe_Type: undefined,
              Width_m: undefined,
              Length_m: undefined,
              Area_m2: undefined,
              Recce: undefined,
              Treatments: undefined,
              Implement: undefined,
              Comments: undefined
            }
          }
        ];

        const response = await treatmentService.parseFeatures(treatmentUnit);

        expect(response.errors.length).to.be.equal(1);

        expect(response.errors[0].treatmentUnitId).to.be.equal('Invalid TU_ID');
        expect(response.errors[0].errors).to.be.eql([
          'TU_ID - Must be a number or alphanumeric/text.',
          'Year - Must be a 4 digit number.',
          'Fe_Type - Must be one of: [ Transect ].',
          'Area_m2 - Must be a positive number.',
          'Treatments - Must be one or more of: [ Tree bending, Seeding ]. If entering multiple treatment types, separate them with a semi-colon (ex: "Ripping; Seeding").'
        ]);
      });

      it('when properties are invalid', async function () {
        const treatmentUnit: Feature[] = [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [123, 123]
            },
            properties: {
              TU_ID: '',
              Year: 10,
              Fe_Type: 'not a real type',
              Width_m: -2,
              Length_m: -5,
              Area_m2: null,
              Recce: 'Y',
              Treatments: 'Tree bending; not a real treatment; Seeding',
              Implement: '',
              Comments: 0
            }
          }
        ];

        const response = await treatmentService.parseFeatures(treatmentUnit);

        expect(response.errors.length).to.be.equal(1);

        expect(response.errors[0].treatmentUnitId).to.be.equal('Invalid TU_ID');
        expect(response.errors[0].errors).to.be.eql([
          'TU_ID - Must be a number or alphanumeric/text.',
          'Year - Must be a 4 digit number. Must be greater than 1900',
          'Fe_Type - Must be one of: [ Transect ].',
          'Width_m - Must be empty, or a positive number.',
          'Length_m - Must be empty, or a positive number.',
          'Area_m2 - Must be a positive number.',
          'Recce - Must be empty, or one of: [ Yes, No, Not Applicable ].',
          'Treatments - Must be one or more of: [ Tree bending, Seeding ]. If entering multiple treatment types, separate them with a semi-colon (ex: "Ripping; Seeding").',
          'Comments - Invalid input'
        ]);
      });
    });

    describe('should return a parsed/transformed version of the original features', function () {
      it('when properties are valid', async function () {
        const treatmentFeatures: Feature[] = [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [123, 123]
            },
            properties: {
              TU_ID: '1',
              Year: 2020,
              Fe_Type: 'Transect',
              Width_m: null,
              Length_m: null,
              Area_m2: 10,
              Recce: 'NOT APPLICABLE',
              Treatments: ' Tree bending; ',
              Implement: 'Yes',
              Comments: 'comment 1'
            }
          },
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [123, 123]
            },
            properties: {
              TU_ID: 2,
              Year: 2020,
              Fe_Type: 'Transect',
              Width_m: 240,
              Length_m: 3498,
              Area_m2: 10,
              Recce: 'No',
              Treatments: 'Tree bending; Seeding',
              Implement: null,
              Comments: 'comment 2'
            }
          }
        ];

        const response = await treatmentService.parseFeatures(treatmentFeatures);

        expect(response.errors.length).to.be.equal(0);

        expect(response.data.length).to.be.equal(2);

        expect(response.data[0].properties).to.be.eql({
          TU_ID: '1',
          Year: 2020,
          Fe_Type: 1,
          Width_m: null,
          Length_m: null,
          Area_m2: 10,
          Recce: 'not applicable',
          Treatments: [2],
          Implement: 'yes',
          Comments: 'comment 1'
        });
        expect(response.data[1].properties).to.be.eql({
          TU_ID: '2',
          Year: 2020,
          Fe_Type: 1,
          Width_m: 240,
          Length_m: 3498,
          Area_m2: 10,
          Recce: 'no',
          Treatments: [2, 3],
          Implement: null,
          Comments: 'comment 2'
        });
      });
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

  describe('insertTreatmentUnit', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns null if the query response has no rows', async function () {
      const mockQueryResponse = ({} as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1, query: async () => mockQueryResponse });
      const treatmentService = new TreatmentService(mockDBConnection);

      const mockTreatmentUnitTypesSQLResponse = SQL`Valid SQL return`;
      sinon.stub(queries.project, 'postTreatmentUnitSQL').returns(mockTreatmentUnitTypesSQLResponse);

      const treatmentFeatureObj: ValidTreatmentFeature = {
        type: 'Feature',
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
          Fe_Type: 1,
          Width_m: 240,
          Length_m: 3498,
          Area_m2: 10,
          Recce: 'yes',
          Treatments: [1, 2, 3],
          Implement: 'yes',
          Comments: 'something'
        }
      };

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

      const mockTreatmentUnitTypesSQLResponse = SQL`Valid SQL return`;
      sinon.stub(queries.project, 'postTreatmentUnitSQL').returns(mockTreatmentUnitTypesSQLResponse);

      const treatmentFeatureObj: ValidTreatmentFeature = {
        type: 'Feature',
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
          Fe_Type: 1,
          Width_m: 240,
          Length_m: 3498,
          Area_m2: 10,
          Recce: 'yes',
          Treatments: [1, 2, 3],
          Implement: 'yes',
          Comments: 'something'
        }
      };

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
        await treatmentService.insertTreatmentData(1, 2, null);
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
        await treatmentService.insertTreatmentData(1, 2, 'yes');
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

      const response = await treatmentService.insertTreatmentData(1, 2, 'no');

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

      const mockTreatmentFeatureProperties = ({ Treatments: 'name; ' } as unknown) as ValidTreatmentFeatureProperties;

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

      const insertTreatmentCall = sinon
        .stub(treatmentService, 'insertTreatmentType')
        .resolves({ treatment_treatment_type_id: 1 } as ITreatmentTypeInsertOrExists);

      const mockTreatmentFeatureProperties = ({
        Treatments: [1, 2]
      } as unknown) as ValidTreatmentFeatureProperties;

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
          implemented: 'yes',
          reconnaissance_conducted: 'no',
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
          implemented: null,
          reconnaissance_conducted: 'not applicable',
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
            reconnaissance_conducted: 'no',
            comments: '',
            treatments: [
              {
                treatment_year: '',
                treatment_name: '',
                implemented: 'yes'
              },
              {
                treatment_year: '',
                treatment_name: '',
                implemented: null
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
          implemented: 'yes',
          reconnaissance_conducted: 'no',
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
            reconnaissance_conducted: 'no',
            comments: '',
            treatments: [
              {
                treatment_year: '2020',
                treatment_name: 'Seeding',
                implemented: 'yes'
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
          implemented: 'yes',
          reconnaissance_conducted: 'no',
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
          implemented: null,
          reconnaissance_conducted: 'not applicable',
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
            reconnaissance_conducted: 'no',
            comments: '',
            treatments: [
              {
                treatment_year: '2020',
                treatment_name: 'Seeding',
                implemented: 'yes'
              },
              {
                treatment_year: '2021',
                treatment_name: 'Tree Felling',
                implemented: null
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
          implemented: 'yes',
          reconnaissance_conducted: 'no',
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
          implemented: null,
          reconnaissance_conducted: 'not applicable',
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
          implemented: null,
          reconnaissance_conducted: null,
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
          implemented: 'no',
          reconnaissance_conducted: 'no',
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
            reconnaissance_conducted: 'no',
            comments: '',
            treatments: [
              {
                treatment_year: '2020',
                treatment_name: 'Seeding',
                implemented: 'yes'
              },
              {
                treatment_year: '2021',
                treatment_name: 'Tree Felling',
                implemented: null
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
            reconnaissance_conducted: null,
            comments: '',
            treatments: [
              {
                treatment_year: '2020',
                treatment_name: 'Seeding',
                implemented: null
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
            reconnaissance_conducted: 'no',
            comments: '',
            treatments: [
              {
                treatment_year: '2021',
                treatment_name: 'Tree Felling',
                implemented: 'no'
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
