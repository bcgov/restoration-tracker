import { HTTP400 } from '../errors/custom-error';
// import { GetAttachmentsData } from '../models/project-attachments';
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

  async insertTreatmentUnit(
    projectId: number,
    treatmentFeatureProperties: Feature['properties']
  ): Promise<{ id: number; revision_count: number }> {
    const treatmentFeatureTypes = await this.getTreatmentFeatureTypes();

    let featureTypeObj = treatmentFeatureTypes.find((item) => {
      return item.name === treatmentFeatureProperties?.FEATURE_TY;
    });

    if (!featureTypeObj) {
      featureTypeObj = treatmentFeatureTypes.find((item) => {
        return item.name === 'Other';
      });
    }

    const sqlStatement = queries.project.postTreatmentUnitSQL(
      projectId,
      featureTypeObj.feature_type_id,
      treatmentFeatureProperties
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

  async insertTreatmentGeometryData(treatmentUnitId: number, geometry: Feature['geometry']) {
    const sqlStatement = queries.project.postTreatmentUnitGeometrySQL(treatmentUnitId, geometry);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL update statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response?.rows?.[0]) {
      throw new HTTP400('Failed to insert treatment unit geometry data');
    }

    return response.rows[0];
  }

  async insertAllProjectTreatmentUnits(projectId: number, features: Feature[]) {
    features.forEach((feature) => {
      this.insertTreatmentUnit(projectId, feature.properties);
    });
  }

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
