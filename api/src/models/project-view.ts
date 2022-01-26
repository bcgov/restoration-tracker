import { Feature } from 'geojson';

export class GetProjectData {
  project_name: string;
  start_date: string;
  end_date: string;
  objectives: string;
  publish_date: string;
  revision_count: number;

  constructor(projectData?: any) {
    this.project_name = projectData?.name || '';
    this.start_date = projectData?.start_date || '';
    this.end_date = projectData?.end_date || '';
    this.objectives = projectData?.objectives || '';
    this.publish_date = projectData?.publish_date || '';
    this.revision_count = projectData?.revision_count ?? 0;
  }
}

export interface IGetPermit {
  permit_number: string;
  permit_type: string;
}

export class GetPermitData {
  permits: IGetPermit[];

  constructor(permitData?: any[]) {
    this.permits =
      (permitData?.length &&
        permitData.map((item: any) => {
          return {
            permit_number: item.number,
            permit_type: item.type
          };
        })) ||
      [];
  }
}

export class GetLocationData {
  geometry?: Feature[];

  constructor(locationData?: any) {
    const locationDataItem = locationData && locationData.length && locationData[0];
    this.geometry = (locationDataItem?.geojson?.length && locationDataItem.geojson) || [];
  }
}

export class GetCoordinatorData {
  first_name: string;
  last_name: string;
  email_address: string;
  coordinator_agency: string;
  share_contact_details: string;
  revision_count: number;

  constructor(coordinatorData?: any) {
    this.first_name = coordinatorData?.coordinator_first_name || '';
    this.last_name = coordinatorData?.coordinator_last_name || '';
    this.email_address = coordinatorData?.coordinator_email_address || '';
    this.coordinator_agency = coordinatorData?.coordinator_agency_name || '';
    this.share_contact_details = coordinatorData?.coordinator_public ? 'true' : 'false';
    this.revision_count = coordinatorData?.revision_count ?? 0;
  }
}

interface IGetIUCN {
  classification: string;
  subClassification1: string;
  subClassification2: string;
}

export class GetIUCNClassificationData {
  classificationDetails: IGetIUCN[];

  constructor(iucnClassificationData?: any[]) {
    this.classificationDetails =
      (iucnClassificationData &&
        iucnClassificationData.map((item: any) => {
          return {
            classification: item.classification,
            subClassification1: item.subclassification1,
            subClassification2: item.subclassification2
          };
        })) ||
      [];
  }
}
export class GetPartnershipsData {
  indigenous_partnerships: string[];
  stakeholder_partnerships: string[];

  constructor(indigenous_partnerships?: any[], stakeholder_partnerships?: any[]) {
    this.indigenous_partnerships =
      (indigenous_partnerships?.length && indigenous_partnerships.map((item: any) => item.name)) || [];
    this.stakeholder_partnerships =
      (stakeholder_partnerships?.length && stakeholder_partnerships.map((item: any) => item.name)) || [];
  }
}

interface IGetFundingSource {
  id: number;
  agency_id: number;
  investment_action_category: number;
  investment_action_category_name: string;
  agency_name: string;
  funding_amount: number;
  start_date: string;
  end_date: string;
  agency_project_id: string;
  revision_count: number;
}

export class GetFundingData {
  fundingSources: IGetFundingSource[];

  constructor(fundingData?: any[]) {
    this.fundingSources =
      (fundingData &&
        fundingData.map((item: any) => {
          return {
            id: item.id,
            agency_id: item.agency_id,
            investment_action_category: item.investment_action_category,
            investment_action_category_name: item.investment_action_category_name,
            agency_name: item.agency_name,
            funding_amount: item.funding_amount,
            start_date: item.start_date,
            end_date: item.end_date,
            agency_project_id: item.agency_project_id,
            revision_count: item.revision_count ?? 0
          };
        })) ||
      [];
  }
}
