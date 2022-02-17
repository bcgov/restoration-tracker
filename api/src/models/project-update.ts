import { Feature } from 'geojson';
import { IPostIUCN, PostFundingSource } from './project-create';

export class PutIUCNData {
  classificationDetails: IPostIUCN[];

  constructor(obj?: any) {
    this.classificationDetails =
      (obj?.classificationDetails?.length &&
        obj.classificationDetails.map((item: any) => {
          return {
            classification: item.classification,
            subClassification1: item.subClassification1,
            subClassification2: item.subClassification2
          };
        })) ||
      [];
  }
}

export class PutProjectData {
  name: string;
  start_date: string;
  end_date: string;
  objectives: string;
  revision_count: number;

  constructor(obj?: any) {
    this.name = obj?.project_name || null;
    this.start_date = obj?.start_date || null;
    this.end_date = obj?.end_date || null;
    this.objectives = obj?.objectives || null;
    this.revision_count = obj?.revision_count ?? null;
  }
}

export class PutLocationData {
  geometry: Feature[];
  region: number;
  revision_count: number;

  constructor(obj?: any) {
    this.geometry = (obj?.geometry?.length && obj.geometry) || [];
    this.region = obj?.region || null;
    this.revision_count = obj?.revision_count ?? null;
  }
}

export class PutPartnershipsData {
  indigenous_partnerships: number[];
  stakeholder_partnerships: string[];

  constructor(obj?: any) {
    this.indigenous_partnerships = (obj?.indigenous_partnerships?.length && obj.indigenous_partnerships) || [];
    this.stakeholder_partnerships = (obj?.stakeholder_partnerships?.length && obj.stakeholder_partnerships) || [];
  }
}

export class PutFundingData {
  fundingSources: PostFundingSource[];

  constructor(obj?: any) {
    this.fundingSources =
      (obj?.fundingSources?.length && obj.fundingSources.map((item: any) => new PostFundingSource(item))) || [];
  }
}

export class PutSpeciesData {
  focal_species: number[];

  constructor(obj?: any) {
    this.focal_species = (obj?.focal_species.length && obj.focal_species) || [];
  }
}
