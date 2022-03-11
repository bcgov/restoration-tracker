import { Geometry } from 'geojson';
import shp from 'shpjs';
import { HTTP400 } from '../errors/custom-error';
import {
  GetTreatmentFeatureTypes,
  GetTreatmentTypes,
  ITreatmentDataInsertOrExists,
  ITreatmentTypeInsertOrExists,
  ITreatmentUnitInsertOrExists,
  TreatmentFeature,
  TreatmentFeatureProperties
} from '../models/project-treatment';
import { queries } from '../queries/queries';
import { DBService } from './service';

export class TreatmentService extends DBService {
  async parseShapeFile(fileBuffer: Buffer): ReturnType<typeof shp.parseZip> {
    return shp.parseZip(fileBuffer);
  }

  async handleShapeFileFeatures(file: Express.Multer.File): Promise<TreatmentFeature[] | null> {
    // Exit out if no file
    if (!file) {
      return null;
    }

    // Run the conversion
    const geojson = await this.parseShapeFile(file.buffer);

    let features: TreatmentFeature[] = [];
    if (Array.isArray(geojson)) {
      geojson.forEach((item) => {
        features = features.concat((item.features as unknown) as TreatmentFeature);
      });
    } else {
      features = (geojson.features as unknown) as TreatmentFeature[];
    }
    return features;
  }

  //check all treatment units if their proerties are valid.
  validateAllTreatmentUnitProperties(
    treatmentFeatures: TreatmentFeature[]
  ): { treatmentUnitId: number; missingProperties: string[] }[] {
    //collection of all errors in units
    const errorArray: { treatmentUnitId: number; missingProperties: string[] }[] = [];

    for (const item of treatmentFeatures) {
      //collect errors of a single unit
      const treatmentUnitError: string[] = [];

      !Number.isInteger(item.properties.OBJECTID) && treatmentUnitError.push('Missing property OBJECTID');
      !Number.isInteger(item.properties.Treatment_) && treatmentUnitError.push('Missing property Treatment_');
      !Number.isInteger(item.properties.Width_m) && treatmentUnitError.push('Missing property Width_m');
      // !Number.isInteger(item.properties.Length_m) && treatmentUnitError.push('Missing property Length_m');
      !Number.isInteger(item.properties.ROAD_ID) && treatmentUnitError.push('Missing property ROAD_ID');
      !Number.isFinite(item.properties.SHAPE_Leng) && treatmentUnitError.push('Missing property SHAPE_Leng');
      typeof item.properties.Reconnaiss !== 'string' ||
        (item.properties.Reconnaiss.length <= 0 && treatmentUnitError.push('Missing property Reconnaiss'));
      typeof item.properties.Leave_for_ !== 'string' ||
        (item.properties.Leave_for_.length <= 0 && treatmentUnitError.push('Missing property Leave_for_'));
      typeof item.properties.Treatment1 !== 'string' && treatmentUnitError.push('Missing property Treatment1');
      typeof item.properties.FEATURE_TY !== 'string' ||
        (item.properties.FEATURE_TY.length <= 0 && treatmentUnitError.push('Missing property FEATURE_TY'));

      if (treatmentUnitError.length > 0) {
        errorArray.push({ treatmentUnitId: item.properties.Treatment_, missingProperties: treatmentUnitError });
      }
    }

    return errorArray;
  }

  async getTreatmentFeatureTypes(): Promise<GetTreatmentFeatureTypes[]> {
    const sqlStatement = queries.project.getTreatmentFeatureTypesSQL();

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response.rows) {
      throw new HTTP400('Failed to get project treatment feature type data');
    }

    return response.rows;
  }

  async getEqualTreatmentFeatureTypeIds(
    treatmentFeatureProperties: TreatmentFeatureProperties
  ): Promise<GetTreatmentFeatureTypes> {
    const treatmentFeatureTypes = await this.getTreatmentFeatureTypes();

    let featureTypeObj: GetTreatmentFeatureTypes[] = [];

    featureTypeObj = treatmentFeatureTypes.filter((item) => {
      return item.name === treatmentFeatureProperties.FEATURE_TY;
    });

    if (featureTypeObj.length === 0) {
      featureTypeObj = treatmentFeatureTypes.filter((item) => {
        return item.name === 'Other';
      });
    }

    return featureTypeObj[0];
  }

  async getTreatmentUnitTypes(): Promise<GetTreatmentTypes[]> {
    const sqlStatement = queries.project.getTreatmentUnitTypesSQL();

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response.rows) {
      throw new HTTP400('Failed to get project treatment unit type data');
    }

    return response.rows;
  }

  async insertTreatmentUnit(
    projectId: number,
    treatmentFeatureProperties: TreatmentFeatureProperties,
    geometry: Geometry
  ): Promise<ITreatmentUnitInsertOrExists> {
    const featureTypeObj = await this.getEqualTreatmentFeatureTypeIds(treatmentFeatureProperties);

    const sqlStatement = queries.project.postTreatmentUnitSQL(
      projectId,
      featureTypeObj.feature_type_id,
      treatmentFeatureProperties,
      geometry
    );

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL insert statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response.rows || !response.rows[0]) {
      throw new HTTP400('Failed to insert treatment unit data');
    }

    return response.rows[0];
  }

  async insertTreatmentData(treatmentUnitId: number, year: string | number): Promise<ITreatmentDataInsertOrExists> {
    const sqlStatement = queries.project.postTreatmentDataSQL(treatmentUnitId, year);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL update statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response?.rows?.[0]) {
      throw new HTTP400('Failed to insert treatment data');
    }

    return response.rows[0];
  }

  async insertTreatmentType(treatmentId: number, treatmentTypeId: number): Promise<ITreatmentTypeInsertOrExists> {
    const sqlStatement = queries.project.postTreatmentTypeSQL(treatmentId, treatmentTypeId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL insert statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response.rows || !response.rows[0]) {
      throw new HTTP400('Failed to insert treatment unit type data');
    }

    return response.rows[0];
  }

  async insertAllTreatmentTypes(
    treatmentId: number,
    treatmentFeatureProperties: TreatmentFeatureProperties
  ): Promise<void> {
    const treatmentUnitTypes = await this.getTreatmentUnitTypes();

    const givenTypesString = treatmentFeatureProperties.Treatment1;
    const givenTypesSplit = givenTypesString.split('; ');

    const treatmentTypes: number[] = [];

    treatmentUnitTypes.forEach((item) => {
      givenTypesSplit.forEach((givenItem: string) => {
        if (item.name.toUpperCase().includes(givenItem.toUpperCase())) {
          treatmentTypes.push(item.treatment_type_id);
        }
      });
    });

    for (const item of treatmentTypes) {
      const response = await this.insertTreatmentType(treatmentId, item);

      if (!response || !response.treatment_treatment_type_id) {
        throw new HTTP400('Failed to insert treatment unit type data');
      }
    }
  }

  async insertTreatmentDataAndTreatmentTypes(
    treatmentUnitId: number,
    featureProperties: TreatmentFeatureProperties
  ): Promise<void> {
    const insertTreatmentDataResponse = await this.insertTreatmentData(treatmentUnitId, featureProperties.year || 99);

    await this.insertAllTreatmentTypes(insertTreatmentDataResponse.treatment_id, featureProperties);
  }

  async insertAllProjectTreatmentUnits(projectId: number, features: TreatmentFeature[]): Promise<number[]> {
    const treatmentInsertResponse: number[] = [];

    for (const item of features) {
      const featureTypeObj = await this.getEqualTreatmentFeatureTypeIds(item.properties);

      const checkTreatmentUnitExist = await this.getTreatmentUnitExist(
        projectId,
        featureTypeObj.feature_type_id,
        item.properties?.Treatment_
      );

      if (!checkTreatmentUnitExist) {
        //Treatment Unit Doesnt Exists
        const insertTreatmentUnitResponse = await this.insertTreatmentUnit(projectId, item.properties, item.geometry);

        await this.insertTreatmentDataAndTreatmentTypes(insertTreatmentUnitResponse.treatment_unit_id, item.properties);

        treatmentInsertResponse.push(insertTreatmentUnitResponse.treatment_unit_id);
      } else {
        //Treatment Unit Exists
        const checkTreatmentDataYearExists = await this.getTreatmentDataYearExist(
          checkTreatmentUnitExist.treatment_unit_id,
          item.properties?.year || 99
        );

        if (!checkTreatmentDataYearExists) {
          //Treatment with Year doesnt exist in db
          await this.insertTreatmentDataAndTreatmentTypes(checkTreatmentUnitExist.treatment_unit_id, item.properties);
          treatmentInsertResponse.push(checkTreatmentUnitExist.treatment_unit_id);
        }

        //Data already exists
      }
    }

    return treatmentInsertResponse;
  }

  async getTreatmentUnitExist(
    projectId: number,
    featureTypeId: number,
    treatmentUnitName: string | number
  ): Promise<ITreatmentUnitInsertOrExists | null> {
    const sqlStatement = queries.project.getTreatmentUnitExistSQL(projectId, featureTypeId, treatmentUnitName);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL update statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response) {
      return null;
    }

    return response.rows[0];
  }

  async getTreatmentDataYearExist(treatmentUnitId: number, year: number): Promise<ITreatmentDataInsertOrExists | null> {
    const sqlStatement = queries.project.getTreatmentDataYearExistSQL(treatmentUnitId, year);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL update statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response?.rows[0]) {
      return null;
    }

    return response.rows[0];
  }

  ////////////////////////////////////////////////////////////

  async updateProjectTreatment(
    projectId: number,
    file: Express.Multer.File
  ): Promise<{ id: number; revision_count: number }> {
    const sqlStatement = queries.project.putProjectTreatmentSQL(projectId, file.originalname);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL update statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response?.rows?.[0]) {
      throw new HTTP400('Failed to update project attachment data');
    }

    return response.rows[0];
  }

  async fileWithSameNameExist(projectId: number, file: Express.Multer.File) {
    const getSqlStatement = queries.project.getProjectTreatmentByFileNameSQL(projectId, file.originalname);

    if (!getSqlStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const getResponse = await this.connection.query(getSqlStatement.text, getSqlStatement.values);

    return getResponse && getResponse.rows && getResponse.rows.length > 0;
  }

  async getTreatments(projectId: number) {
    const getProjectTreatmentsSQLStatement = queries.project.getProjectTreatmentsSQL(projectId);

    if (!getProjectTreatmentsSQLStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const response = await this.connection.query(
      getProjectTreatmentsSQLStatement.text,
      getProjectTreatmentsSQLStatement.values
    );

    return response && response.rows ? response.rows : [];
  }

  async deleteTreatmentUnit(projectId: number, treatmentUnitId: number) {
    const sqlStatement = queries.project.deleteProjectTreatmentUnitSQL(projectId, treatmentUnitId);

    await this.connection.query(sqlStatement.text, sqlStatement.values);
  }

  async deleteTreatmentsByYear(projectId: number, year: number) {
    const deleteProjectTreatmentsByYearSQL = queries.project.deleteProjectTreatmentsByYearSQL(projectId, year);
    const deleteProjectTreatmentUnitIfNoTreatmentsSQL = queries.project.deleteProjectTreatmentUnitIfNoTreatmentsSQL();

    await this.connection.query(deleteProjectTreatmentsByYearSQL.text, deleteProjectTreatmentsByYearSQL.values);
    await this.connection.query(
      deleteProjectTreatmentUnitIfNoTreatmentsSQL.text,
      deleteProjectTreatmentUnitIfNoTreatmentsSQL.values
    );
  }
}
