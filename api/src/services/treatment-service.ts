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

    if (!geojson) {
      return null;
    }

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
  async validateAllTreatmentUnitProperties(
    treatmentFeatures: TreatmentFeature[]
  ): Promise<{ treatmentUnitId: string; errors: string[] }[]> {
    //collection of all errors in units
    const errorArray: { treatmentUnitId: string; errors: string[] }[] = [];

    for (const item of treatmentFeatures) {
      //collect errors of a single unit
      const treatmentUnitError: string[] = [];

      if (typeof item.properties.TU_ID !== 'string' || item.properties.TU_ID.length <= 0) {
        treatmentUnitError.push('Property TU_ID is required: non-empty String');
      }

      if (!Number.isInteger(item.properties.Year)) {
        treatmentUnitError.push('Property Year is required: non-empty Integer');
      }

      if (typeof item.properties.Fe_Type !== 'string' || item.properties.Fe_Type.length <= 0) {
        treatmentUnitError.push('Property Fe_Type is required: non-empty String');
      } else {
        const featureCheck = await this.getTreatmentFeatureTypeObjs(item.properties);

        if (featureCheck === undefined) {
          treatmentUnitError.push(
            'Invalid Fe_Type Entered. Valid Fe_Type: [ Seismic Line, Road, Pipeline, Transmission Line, Railway, Trail, Well, Cutblock, Other ] '
          );
        }
      }

      if (item.properties.Width_m && typeof item.properties.Width_m !== 'number') {
        treatmentUnitError.push('Property Width_m is invalid: must be a Number');
      }

      if (item.properties.Length_m && typeof item.properties.Length_m !== 'number') {
        treatmentUnitError.push('Property Length_m is invalid: must be a Number');
      }

      if (typeof item.properties.Area_m2 !== 'number') {
        treatmentUnitError.push('Property Area_m2 is required: must be a Number');
      }

      if (item.properties.Recce && typeof item.properties.Recce !== 'string') {
        treatmentUnitError.push('Property Recce is invalid: must be a String');
      }

      if (typeof item.properties.Treatments !== 'string' || item.properties.Treatments.length <= 0) {
        treatmentUnitError.push('Property Treatments is required: non-empty String');
      } else {
        const treatmentCheck = await this.getAllTreatmentTypes(item.properties);

        if (treatmentCheck.length === 0) {
          treatmentUnitError.push(
            'Invalid Treatments Entered. Valid Treatments (must be semi-colon delimited): "Leave for natural recovery; Debris rollback; Hummock placing; Mounding; Screef; Seeding; Seedling planting; Tree bending; Tree felling; Ripping; Re-contouring; Barrier; Invasive species removal" '
          );
        }
      }

      if (typeof item.properties.Implement !== 'string' || item.properties.Implement.length <= 0) {
        treatmentUnitError.push('Property Implement is required: non-empty String');
      }

      if (item.properties.Comments && typeof item.properties.Comments !== 'string') {
        treatmentUnitError.push('Property Comments is invalid: must be a String');
      }

      if (treatmentUnitError.length > 0) {
        errorArray.push({ treatmentUnitId: item.properties.TU_ID, errors: treatmentUnitError });
      }
    }
    return errorArray;
  }

  async getAllTreatmentFeatureTypes(): Promise<GetTreatmentFeatureTypes[]> {
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

  async getTreatmentFeatureTypeObjs(
    treatmentFeatureProperties: TreatmentFeatureProperties
  ): Promise<GetTreatmentFeatureTypes | undefined> {
    const treatmentFeatureTypes = await this.getAllTreatmentFeatureTypes();

    return treatmentFeatureTypes.find((item) => {
      return item.name.toLowerCase() === treatmentFeatureProperties.Fe_Type.toLowerCase();
    });
  }

  async getAllTreatmentUnitTypes(): Promise<GetTreatmentTypes[]> {
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
    const featureTypeObj = await this.getTreatmentFeatureTypeObjs(feature.properties);

    if (!featureTypeObj) {
      throw new HTTP400('Invalid Feature type');
    }

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

  async getAllTreatmentTypes(treatmentFeatureProperties: TreatmentFeatureProperties): Promise<GetTreatmentTypes[]> {
    const treatmentUnitTypes = await this.getAllTreatmentUnitTypes();

    const givenTypesString = treatmentFeatureProperties.Treatments;

    const givenTypesSplit = givenTypesString
      .split(';')
      .map((item) => item.trim())
      .filter(Boolean);

    const treatmentTypes: GetTreatmentTypes[] = [];

    treatmentUnitTypes.forEach((item) => {
      givenTypesSplit.forEach((givenItem: string) => {
        if (item.name.toLowerCase().includes(givenItem.toLowerCase())) {
          treatmentTypes.push(item);
        }
      });
    });

    return treatmentTypes;
  }

  async insertAllTreatmentTypes(
    treatmentId: number,
    treatmentFeatureProperties: TreatmentFeatureProperties
  ): Promise<void> {
    const treatmentTypes = await this.getAllTreatmentTypes(treatmentFeatureProperties);

    if (treatmentTypes.length === 0) {
      throw new HTTP400('Invalid Treatment Types');
    }

    for (const item of treatmentTypes) {
      const response = await this.insertTreatmentType(treatmentId, item.treatment_type_id);

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
      const featureTypeObj = await this.getTreatmentFeatureTypeObjs(item.properties);

      if (!featureTypeObj) {
        throw new HTTP400('Feature type invalid');
      }

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

  async getTreatmentDataYearExist(treatmentUnitId: number, year: number): Promise<ITreatmentDataInsertOrExists | null> {
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
        'treatment_unit.comments',
        'treatment_unit.geojson'
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
    queryBuilder.groupBy('treatment_unit.comments');
    queryBuilder.groupBy('treatment_unit.geojson');

    queryBuilder.where('treatment_unit.project_id', projectId);

    const response = await this.connection.knex(queryBuilder);

    const rawTreatmentsData = response && response.rows ? response.rows : [];

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
