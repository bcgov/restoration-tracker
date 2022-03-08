import { HTTP400 } from '../errors/custom-error';
import { queries } from '../queries/queries';
import { DBService } from './service';
import shp from 'shpjs';
import { Feature } from 'geojson';

export class TreatmentService extends DBService {
  async handleShapeFileFeatures(file: Express.Multer.File): Promise<Feature[] | undefined> {
    // Exit out if no file
    if (!file) {
      return;
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

  async getTreatmentFeatureTypes() {
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
    const treatmentFeatureTypes = await this.getTreatmentFeatureTypes();

    let featureTypeObj = treatmentFeatureTypes.find((item) => {
      return item.name === treatmentFeatureProperties?.FEATURE_TY;
    });

    if (!featureTypeObj) {
      featureTypeObj = treatmentFeatureTypes.find((item) => {
        return item.name === 'Other';
      });
    }

    return featureTypeObj?.feature_type_id;
  }

  async getTreatmentUnitTypes() {
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
  ): Promise<{ treatment_unit_id: number; revision_count: number }> {
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

  async insertTreatmentData(
    treatmentUnitId: number,
    year: string | number
  ): Promise<{ treatment_id: number; revision_count: number }> {
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

  async insertTreatmentType(
    treatmentId: number,
    treatmentTypeId: number
  ): Promise<{ treatment_treatment_type_id: number; revision_count: number }> {
    const sqlStatement = queries.project.postTreatmentUnitTypeSQL(treatmentId, treatmentTypeId);

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
    treatmentFeatureProperties: Feature['properties']
  ): Promise<number[]> {
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

    const returnTreatmentTypeIds: number[] = [];

    for (const item of treatmentTypes) {
      const response = await this.insertTreatmentType(treatmentId, item);

      if (!response || !response.treatment_treatment_type_id) {
        throw new HTTP400('Failed to insert treatment unit type data');
      }

      returnTreatmentTypeIds.push(response.treatment_treatment_type_id);
    }

    return returnTreatmentTypeIds;
  }

  async insertTreatmentDataAndTreatmentTypes(treatmentUnitId: number, featureProperties: Feature['properties']) {
    const insertTreatmentDataResponse = await this.insertTreatmentData(treatmentUnitId, featureProperties?.year || 99);

    const insertAllTreatmentUnitTypesResponse = await this.insertAllTreatmentTypes(
      insertTreatmentDataResponse.treatment_id,
      featureProperties
    );

    return insertAllTreatmentUnitTypesResponse;
  }

  async insertAllProjectTreatmentUnits(projectId: number, features: Feature[]) {
    const importResonses: any[] = [];
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

        const insertTreatmentDataResponse = await this.insertTreatmentDataAndTreatmentTypes(
          insertTreatmentUnitResponse.treatment_unit_id,
          item.properties
        );

        importResonses.push(insertTreatmentUnitResponse);
        importResonses.push(insertTreatmentDataResponse);
      } else {
        //Treatment Unit Exists
        const checkTreatmentDataYearExists = await this.getTreatmentDataYearExist(
          checkTreatmentUnitExist.treatment_unit_id,
          item.properties?.year || 99
        );

        if (!checkTreatmentDataYearExists) {
          //Treatment with Year doesnt exist in db
          const insertTreatmentDataResponse = await this.insertTreatmentDataAndTreatmentTypes(
            checkTreatmentUnitExist.treatment_unit_id,
            item.properties
          );

          importResonses.push(insertTreatmentDataResponse);
        }

        //Data already exists
      }
    }

    return importResonses;
  }

  async getTreatmentUnitExist(projectId: number, featureTypeId: number, treatmentUnitName: string | number) {
    const sqlStatement = queries.project.getTreatmentUnitExistSQL(projectId, featureTypeId, treatmentUnitName);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL update statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response) {
      return false;
    }

    return response.rows[0];
  }

  async getTreatmentDataYearExist(treatmentUnitId: number, year: number): Promise<boolean> {
    const sqlStatement = queries.project.getTreatmentDataYearExistSQL(treatmentUnitId, year);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL update statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response?.rows?.[0]) {
      return false;
    }

    return true;
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

    // return new GetTreatmentsData(rawTreatmentsData);
    return rawTreatmentsData;
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
