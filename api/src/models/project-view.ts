import { Feature } from 'geojson';

export class GetProjectData {
  project_id: number;
  project_name: string;
  start_date: string;
  end_date: string;
  objectives: string;
  publish_date: string;
  revision_count: number;

  constructor(projectData?: any) {
    this.project_id = projectData?.project_id || null;
    this.project_name = projectData?.name || '';
    this.start_date = projectData?.start_date || null;
    this.end_date = projectData?.end_date || null;
    this.objectives = projectData?.objectives || '';
    this.publish_date = projectData?.publish_timestamp || null;
    this.revision_count = projectData?.revision_count ?? 0;
  }
}

interface IGetContact {
  first_name: string;
  last_name: string;
  email_address: string;
  agency: string;
  is_public: string;
  is_primary: string;
}

export class GetContactData {
  contacts: IGetContact[];

  constructor(contactData?: any[]) {
    this.contacts =
      (contactData &&
        contactData.map((item: any) => {
          return {
            first_name: item.first_name || '',
            last_name: item.last_name || '',
            email_address: item.email_address || '',
            agency: item.agency || '',
            is_public: item.is_public === 'Y' ? 'true' : 'false',
            is_primary: item.is_primary === 'Y' ? 'true' : 'false'
          };
        })) ||
      [];
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
  indigenous_partnerships: number[];
  stakeholder_partnerships: string[];

  constructor(indigenous_partnerships?: any[], stakeholder_partnerships?: any[]) {
    this.indigenous_partnerships =
      (indigenous_partnerships?.length && indigenous_partnerships.map((item: any) => item.first_nations_id)) || [];
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
