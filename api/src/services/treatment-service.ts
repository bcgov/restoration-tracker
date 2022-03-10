import { HTTP400 } from '../errors/custom-error';
import { queries } from '../queries/queries';
import { DBService } from './service';
import shp from 'shpjs';
import { Feature } from 'geojson';
import { GetTreatmentData } from '../models/treatment-view';
import {
  GetTreatmentFeatureTypes,
  GetTreatmentTypes,
  ITreatmentDataInsertOrExists,
  ITreatmentTypeInsertOrExists,
  ITreatmentUnitInsertOrExists
} from '../models/project-treatment';

export class TreatmentService extends DBService {
  async handleShapeFileFeatures(file: Express.Multer.File): Promise<Feature[] | null> {
    // Exit out if no file
    if (!file) {
      return null;
    }

    // Run the conversion
    const geojson = await shp(file.buffer);

    let features: Feature[] = [];
    if (Array.isArray(geojson)) {
      geojson.forEach((item) => {
        features = features.concat(item.features);
      });
    } else {
      features = geojson.features;
    }
    return features;
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

  async getEqualTreatmentFeatureTypeIds(treatmentFeatureProperties: Feature['properties']): Promise<number> {
    if (!treatmentFeatureProperties?.FEATURE_TY) {
      throw new HTTP400('No Feature Type provided in properties');
    }

    const treatmentFeatureTypes = await this.getTreatmentFeatureTypes();

    let featureTypeObj: GetTreatmentFeatureTypes[] = [];

    featureTypeObj = treatmentFeatureTypes.filter((item) => {
      return item.name === treatmentFeatureProperties?.FEATURE_TY;
    });

    if (featureTypeObj.length === 0) {
      featureTypeObj = treatmentFeatureTypes.filter((item) => {
        return item.name === 'Other';
      });
    }

    return featureTypeObj[0].feature_type_id;
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
    treatmentFeatureProperties: Feature['properties'],
    geometry: Feature['geometry']
  ): Promise<ITreatmentUnitInsertOrExists> {
    const featureTypeId = await this.getEqualTreatmentFeatureTypeIds(treatmentFeatureProperties);

    const sqlStatement = queries.project.postTreatmentUnitSQL(
      projectId,
      featureTypeId,
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

  async insertAllTreatmentTypes(treatmentId: number, treatmentFeatureProperties: Feature['properties']): Promise<void> {
    const treatmentUnitTypes = await this.getTreatmentUnitTypes();

    const givenTypesString = treatmentFeatureProperties?.Treatment1;
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
    featureProperties: Feature['properties']
  ): Promise<void> {
    const insertTreatmentDataResponse = await this.insertTreatmentData(treatmentUnitId, featureProperties?.year || 99);

    await this.insertAllTreatmentTypes(insertTreatmentDataResponse.treatment_id, featureProperties);
  }

  async insertAllProjectTreatmentUnits(projectId: number, features: Feature[]): Promise<number[]> {
    const treatmentInsertResponse: number[] = [];

    for (const item of features) {
      const featureTypeId = await this.getEqualTreatmentFeatureTypeIds(item.properties);

      const checkTreatmentUnitExist = await this.getTreatmentUnitExist(
        projectId,
        featureTypeId,
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

    const rawTreatmentsData = response && response.rows ? response.rows : [];

    return new GetTreatmentData(rawTreatmentsData);
  }

  async deleteTreatment(projectId: number, attachmentId: number) {
    const sqlStatement = queries.project.deleteProjectTreatmentSQL(projectId, attachmentId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL delete project attachment statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response.rows || !response.rows[0]) {
      throw new HTTP400('Failed to delete project attachment record');
    }
  }

  async deleteAllTreatments(projectId: number) {
    const getProjectTreatmentSQLStatement = queries.project.getProjectTreatmentsSQL(projectId);

    if (!getProjectTreatmentSQLStatement) {
      throw new HTTP400('Failed to build SQL get statement');
    }

    const attachments = await this.connection.query(
      getProjectTreatmentSQLStatement.text,
      getProjectTreatmentSQLStatement.values
    );

    if (!attachments || !attachments.rows) {
      throw new HTTP400('Failed to delete project attachments record');
    }
  }
}
