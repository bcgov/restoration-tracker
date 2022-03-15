import shp from 'shpjs';
import { getKnexQueryBuilder } from '../database/db';
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
import { GetTreatmentData } from '../models/treatment-view';
import { queries } from '../queries/queries';
import { DBService } from './service';

export type TreatmentSearchCriteria = {
  years?: string[];
};

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
      !Number.isInteger(item.properties.TU_ID) && treatmentUnitError.push('Missing property TU_ID');
      !Number.isInteger(item.properties.Width_m) && treatmentUnitError.push('Missing property Width_m');
      !Number.isInteger(item.properties.Length_m) && treatmentUnitError.push('Missing property Length_m');
      !Number.isFinite(item.properties.Area_ha) && treatmentUnitError.push('Missing property Area_ha');

      typeof item.properties.Recon !== 'string' ||
        (item.properties.Recon.length <= 0 && treatmentUnitError.push('Missing property Recon'));

      typeof item.properties.Treatments !== 'string' && treatmentUnitError.push('Missing property Treatments');

      typeof item.properties.Type !== 'string' ||
        (item.properties.Type.length <= 0 && treatmentUnitError.push('Missing property Type'));

      typeof item.properties.Descript !== 'string' ||
        (item.properties.Descript.length <= 0 && treatmentUnitError.push('Missing property Descript'));

      typeof item.properties.Implement !== 'string' ||
        (item.properties.Implement.length <= 0 && treatmentUnitError.push('Missing property Implement'));

      typeof item.properties.Year !== 'string' ||
        (item.properties.Year.length <= 0 && treatmentUnitError.push('Missing property Year'));

      if (treatmentUnitError.length > 0) {
        errorArray.push({ treatmentUnitId: item.properties.TU_ID, missingProperties: treatmentUnitError });
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
      return item.name === treatmentFeatureProperties.Type;
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

  async insertTreatmentUnit(projectId: number, feature: TreatmentFeature): Promise<ITreatmentUnitInsertOrExists> {
    const featureTypeObj = await this.getEqualTreatmentFeatureTypeIds(feature.properties);

    const sqlStatement = queries.project.postTreatmentUnitSQL(projectId, featureTypeObj.feature_type_id, feature);

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
      throw new HTTP400('Failed to build SQL insert statement');
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

    const givenTypesString = treatmentFeatureProperties.Treatments;
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
    const insertTreatmentDataResponse = await this.insertTreatmentData(treatmentUnitId, featureProperties.Year);

    await this.insertAllTreatmentTypes(insertTreatmentDataResponse.treatment_id, featureProperties);
  }

  async insertAllProjectTreatmentUnits(projectId: number, features: TreatmentFeature[]): Promise<number[]> {
    const treatmentInsertResponse: number[] = [];

    for (const item of features) {
      const featureTypeObj = await this.getEqualTreatmentFeatureTypeIds(item.properties);

      const checkTreatmentUnitExist = await this.getTreatmentUnitExist(
        projectId,
        featureTypeObj.feature_type_id,
        item.properties?.TU_ID
      );

      if (!checkTreatmentUnitExist) {
        //Treatment Unit Doesnt Exists
        const insertTreatmentUnitResponse = await this.insertTreatmentUnit(projectId, item);

        await this.insertTreatmentDataAndTreatmentTypes(insertTreatmentUnitResponse.treatment_unit_id, item.properties);

        treatmentInsertResponse.push(insertTreatmentUnitResponse.treatment_unit_id);
      } else {
        //Treatment Unit Exists
        const checkTreatmentDataYearExists = await this.getTreatmentDataYearExist(
          checkTreatmentUnitExist.treatment_unit_id,
          item.properties?.Year
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

    if (!response || !response?.rows) {
      return null;
    }

    return response.rows[0];
  }

  async getTreatmentDataYearExist(treatmentUnitId: number, year: string): Promise<ITreatmentDataInsertOrExists | null> {
    const sqlStatement = queries.project.getTreatmentDataYearExistSQL(treatmentUnitId, year);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL update statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response?.rows) {
      return null;
    }

    return response.rows[0];
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

  async getTreatmentsByCriteria(projectId: number, criteria: TreatmentSearchCriteria): Promise<GetTreatmentData> {
    const queryBuilder = getKnexQueryBuilder<any, { project_id: number }>()
      .select(
        'treatment_unit.name as id',
        'feature_type.name as type',
        'treatment_unit.width',
        'treatment_unit.length',
        'treatment_unit.area',
        'treatment.year as treatment_year',
        'treatment_type.name as treatment_name',
        'treatment_unit.description',
        'treatment_unit.comments'
      )
      .from('treatment_unit');
    queryBuilder.leftJoin('feature_type', 'treatment_unit.feature_type_id', 'feature_type.feature_type_id');
    queryBuilder.leftJoin('treatment', 'treatment_unit.treatment_unit_id', 'treatment.treatment_unit_id');
    queryBuilder.leftJoin(
      'treatment_treatment_type',
      'treatment.treatment_id',
      'treatment_treatment_type.treatment_id'
    );
    queryBuilder.leftJoin(
      'treatment_type',
      'treatment_treatment_type.treatment_type_id',
      'treatment_type.treatment_type_id'
    );

    if (criteria.years) {
      queryBuilder.and.whereIn('treatment.year', (Array.isArray(criteria.years) && criteria.years) || [criteria.years]);
    }

    queryBuilder.groupBy('treatment_unit.name');
    queryBuilder.groupBy('feature_type.name');
    queryBuilder.groupBy('treatment_unit.width');
    queryBuilder.groupBy('treatment_unit.length');
    queryBuilder.groupBy('treatment_unit.area');
    queryBuilder.groupBy('treatment.year');
    queryBuilder.groupBy('treatment_type.name');
    queryBuilder.groupBy('treatment_unit.description');
    queryBuilder.groupBy('treatment_unit.comments');

    queryBuilder.where('treatment_unit.project_id', projectId);

    const response = await this.connection.knex(queryBuilder);

    console.log('response: ', response);

    const rawTreatmentsData = response && response.rows ? response.rows : [];
    console.log('rawTreatmentsData: ', rawTreatmentsData);

    return new GetTreatmentData(rawTreatmentsData);
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

  async getProjectTreatmentsYears(projectId: number) {
    const sqlStatement = queries.project.getProjectTreatmentsYearsSQL(projectId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL update statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response?.rows) {
      return null;
    }

    return response.rows;
  }
}
