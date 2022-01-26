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
  revision_count: number;

  constructor(obj?: any) {
    this.geometry = (obj?.geometry?.length && obj.geometry) || [];
    this.revision_count = obj?.revision_count ?? null;
  }
}

export class PutCoordinatorData {
  first_name: string;
  last_name: string;
  email_address: string;
  coordinator_agency: string;
  share_contact_details: boolean;
  revision_count: number;

  constructor(obj?: any) {
    this.first_name = obj?.first_name || null;
    this.last_name = obj?.last_name || null;
    this.email_address = obj?.email_address || null;
    this.coordinator_agency = obj?.coordinator_agency || null;
    this.share_contact_details = (obj?.share_contact_details === 'true' && true) || false;
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

export class GetCoordinatorData {
  first_name: string;
  last_name: string;
  email_address: string;
  coordinator_agency: string;
  share_contact_details: string;
  revision_count: number;

  constructor(obj?: any) {
    this.first_name = obj?.coordinator_first_name || null;
    this.last_name = obj?.coordinator_last_name || null;
    this.email_address = obj?.coordinator_email_address || null;
    this.coordinator_agency = obj?.coordinator_agency_name || null;
    this.share_contact_details = (obj?.coordinator_public && 'true') || 'false';
    this.revision_count = obj?.revision_count ?? null;
  }
}

export class GetPartnershipsData {
  indigenous_partnerships: number[];
  stakeholder_partnerships: string[];

  constructor(indigenous_partnerships?: any[], stakeholder_partnerships?: any[]) {
    this.indigenous_partnerships =
      (indigenous_partnerships?.length && indigenous_partnerships.map((item: any) => item.id)) || [];
    this.stakeholder_partnerships =
      (stakeholder_partnerships?.length && stakeholder_partnerships.map((item: any) => item.name)) || [];
  }
}

export class PutFundingData {
  fundingSources: PostFundingSource[];

  constructor(obj?: any) {
    this.fundingSources =
      (obj?.fundingSources?.length && obj.fundingSources.map((item: any) => new PostFundingSource(item))) || [];
  }
}
