import { Feature, Geometry } from 'geojson';

export class GetTreatmentFeatureTypes {
  feature_type_id: number;
  name: string;
  description: string;

  constructor(obj?: any) {
    this.feature_type_id = obj.feature_type_id || null;
    this.name = obj?.name || null;
    this.description = obj?.description || null;
  }
}

export class GetTreatmentTypes {
  treatment_type_id: number;
  name: string;
  description: string;

  constructor(obj?: any) {
    this.treatment_type_id = obj.treatment_type_id || null;
    this.name = obj?.name || null;
    this.description = obj?.description || null;
  }
}

export interface ITreatmentUnitInsertOrExists {
  treatment_unit_id: number;
  revision_count: number;
}

export interface ITreatmentDataInsertOrExists {
  treatment_id: number;
  revision_count: number;
}

export interface ITreatmentTypeInsertOrExists {
  treatment_treatment_type_id: number;
  revision_count: number;
}

export type TreatmentFeature = Feature<Geometry, TreatmentFeatureProperties>;

export type TreatmentFeatureProperties = {
  OBJECTID: number;
  SHAPE_Leng: number;
  TU_ID: number;
  Width_m: number;
  Length_m: number;
  Area_ha: number;
  Recon: string;
  Treatments: string;
  Type: string;
  Descript: string;
  Implement: string;
  Year: string;
};
