import { Feature } from 'geojson';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/project-create');

/**
 * Processes all POST /project request data.
 *
 * @export
 * @class PostProjectObject
 */
export class PostProjectObject {
  contact: PostContactData;
  permit: PostPermitData;
  project: PostProjectData;
  location: PostLocationData;
  iucn: PostIUCNData;
  funding: PostFundingData;
  partnerships: PostPartnershipsData;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostProjectObject', message: 'params', obj });

    this.contact = (obj?.contact && new PostContactData(obj.contact)) || null;
    this.permit = (obj?.permit && new PostPermitData(obj.permit)) || null;
    this.project = (obj?.project && new PostProjectData(obj.project)) || null;
    this.location = (obj?.location && new PostLocationData(obj.location)) || null;
    this.funding = (obj?.funding && new PostFundingData(obj.funding)) || null;
    this.iucn = (obj?.iucn && new PostIUCNData(obj.iucn)) || null;
    this.partnerships = (obj?.partnerships && new PostPartnershipsData(obj.partnerships)) || null;
  }
}

export interface IPostContact {
  first_name: string;
  last_name: string;
  email_address: string;
  agency: string;
  is_public: boolean;
  is_primary: boolean;
}

/**
 * Processes POST /project contact data
 *
 * @export
 * @class PostContactData
 */
export class PostContactData {
  contacts: IPostContact[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostContactData', message: 'params', obj });

    this.contacts =
      (obj?.contacts?.length &&
        obj.contacts.map((item: any) => ({
          first_name: item.first_name,
          last_name: item.last_name,
          email_address: item.email_address,
          agency: item.agency,
          is_public: JSON.parse(item.is_public),
          is_primary: JSON.parse(item.is_primary)
        }))) ||
      [];
  }
}

export interface IPostPermit {
  permit_number: string;
  permit_type: string;
}

/**
 * Processes POST /project permit data
 *
 * @export
 * @class PostPermitData
 */
export class PostPermitData {
  permits: IPostPermit[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostPermitData', message: 'params', obj });

    this.permits =
      (obj?.permits?.length &&
        obj.permits.map((item: any) => {
          return {
            permit_number: item.permit_number,
            permit_type: item.permit_type
          };
        })) ||
      [];
  }
}

/**
 * Processes POST /project project data.
 *
 * @export
 * @class PostProjectData
 */
export class PostProjectData {
  name: string;
  start_date: string;
  end_date: string;
  objectives: string;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostProjectData', message: 'params', obj });

    this.name = obj?.project_name || null;
    this.start_date = obj?.start_date || null;
    this.end_date = obj?.end_date || null;
    this.objectives = obj?.objectives || null;
  }
}

/**
 * Processes POST /project location data
 *
 * @export
 * @class PostLocationData
 */
export class PostLocationData {
  geometry: Feature[];

  constructor(obj?: any) {
    defaultLog.debug({
      label: 'PostLocationData',
      message: 'params',
      obj: {
        ...obj,
        geometry: obj?.geometry?.map((item: any) => {
          return { ...item, geometry: 'Too big to print' };
        })
      }
    });
    this.geometry = (obj?.geometry?.length && obj.geometry) || [];
  }
}

export interface IPostIUCN {
  classification: number;
  subClassification1: number;
  subClassification2: number;
}

/**
 * Processes POST /project IUCN data
 *
 * @export
 * @class PostIUCNData
 */
export class PostIUCNData {
  classificationDetails: IPostIUCN[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostIUCNData', message: 'params', obj });

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

/**
 * A single project funding agency.
 *
 * @See PostFundingData
 *
 * @export
 * @class PostFundingSource
 */
export class PostFundingSource {
  agency_id: number;
  investment_action_category: number;
  agency_project_id: string;
  funding_amount: number;
  start_date: string;
  end_date: string;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostFundingSource', message: 'params', obj });

    this.agency_id = obj?.agency_id || null;
    this.investment_action_category = obj?.investment_action_category || null;
    this.agency_project_id = obj?.agency_project_id || null;
    this.funding_amount = obj?.funding_amount || null;
    this.start_date = obj?.start_date || null;
    this.end_date = obj?.end_date || null;
  }
}

/**
 * Processes POST /project funding data
 *
 * @export
 * @class PostFundingData
 */
export class PostFundingData {
  funding_sources: PostFundingSource[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostFundingData', message: 'params', obj });

    this.funding_sources =
      (obj?.fundingSources?.length && obj.fundingSources.map((item: any) => new PostFundingSource(item))) || [];
  }
}

/**
 * Processes POST /project partnerships data
 *
 * @export
 * @class PostPartnershipsData
 */
export class PostPartnershipsData {
  indigenous_partnerships: number[];
  stakeholder_partnerships: string[];

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PostPartnershipsData', message: 'params', obj });

    this.indigenous_partnerships = (obj?.indigenous_partnerships.length && obj.indigenous_partnerships) || [];
    this.stakeholder_partnerships = (obj?.stakeholder_partnerships.length && obj.stakeholder_partnerships) || [];
  }
}
