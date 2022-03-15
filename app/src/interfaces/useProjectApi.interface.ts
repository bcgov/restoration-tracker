import { IProjectContactForm } from 'features/projects/components/ProjectContactForm';
import { IProjectFundingForm } from 'features/projects/components/ProjectFundingForm';
import { IProjectGeneralInformationForm } from 'features/projects/components/ProjectGeneralInformationForm';
import { IProjectIUCNForm } from 'features/projects/components/ProjectIUCNForm';
import { IProjectLocationForm } from 'features/projects/components/ProjectLocationForm';
import { IProjectPartnershipsForm } from 'features/projects/components/ProjectPartnershipsForm';
import { IProjectPermitForm } from 'features/projects/components/ProjectPermitForm';
import { Feature } from 'geojson';

export interface IGetProjectAttachment {
  id: number;
  fileName: string;
  lastModified: string;
  size: number;
  url: string;
}

/**
 * An interface for an instance of filter fields for project advanced filter search
 */
export interface IProjectAdvancedFilterRequest {
  keyword?: string;
  contact_agency?: string | string[];
  funding_agency?: number | number[];
  permit_number?: string;
  species?: number | number[];
  start_date?: string;
  end_date?: string;
}

/**
 * Get project attachments response object.
 *
 * @export
 * @interface IGetProjectAttachmentsResponse
 */
export interface IGetProjectAttachmentsResponse {
  attachmentsList: IGetProjectAttachment[];
}

/**
 * Get projects list response object.
 *
 * @export
 * @interface IGetUserProjectsListResponse
 */
export interface IGetUserProjectsListResponse {
  project_id: number;
  name: string;
  system_user_id: number;
  project_role_id: number;
  project_participation_id: number;
}

/**
 * Get projects list response object.
 *
 * @export
 * @interface IGetProjectsListResponse
 */
export interface IGetProjectsListResponse {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  contact_agency_list: string;
  permits_list: string;
  publish_status: string;
  completion_status: string;
}

/**
 * Create project response object.
 *
 * @export
 * @interface ICreateProjectResponse
 */
export interface ICreateProjectResponse {
  id: number;
}

/**
 * Create project post object.
 *
 * @export
 * @interface ICreateProjectRequest
 */
export interface ICreateProjectRequest
  extends IProjectGeneralInformationForm,
    IProjectIUCNForm,
    IProjectContactForm,
    IProjectPermitForm,
    IProjectFundingForm,
    IProjectPartnershipsForm,
    IProjectLocationForm {}

export enum UPDATE_GET_ENTITIES {
  contact = 'contact',
  permit = 'permit',
  project = 'project',
  objectives = 'objectives',
  location = 'location',
  iucn = 'iucn',
  funding = 'funding',
  partnerships = 'partnerships'
}

/**
 * An interface for a single instance of project metadata, for update-only use cases.
 *
 * @export
 * @interface IGetProjectForUpdateResponse
 */
export interface IGetProjectForUpdateResponse {
  project?: IGetGeneralInformationForUpdateResponseDetails;
  permit?: IGetProjectForUpdateResponsePermit;
  location?: IGetProjectForUpdateResponseLocation;
  contact?: IGetProjectForUpdateResponseContact;
  iucn?: IGetProjectForUpdateResponseIUCN;
  funding?: IGetProjectForUpdateResponseFundingData;
  partnerships?: IGetProjectForUpdateResponsePartnerships;
}

export interface IGetGeneralInformationForUpdateResponseDetails {
  project_name: string;
  start_date: string;
  end_date: string;
  objectives: string;
  revision_count: number;
}

interface IGetProjectForUpdateResponsePermitArrayItem {
  permit_number: string;
  permit_type: string;
}

export interface IGetProjectForUpdateResponsePermit {
  permits: IGetProjectForUpdateResponsePermitArrayItem[];
}

export interface IGetProjectForUpdateResponseLocation {
  geometry: Feature[];
  range: string;
  priority: string;
  revision_count: number;
}

export interface IGetProjectForUpdateResponseContactArrayItem {
  first_name: string;
  last_name: string;
  email_address: string;
  agency: string;
  is_public: string;
  is_primary: string;
}

export interface IGetProjectForUpdateResponseContact {
  contacts: IGetProjectForUpdateResponseContactArrayItem[];
}

interface IGetProjectForUpdateResponseIUCNArrayItem {
  classification: number;
  subClassification1: number;
  subClassification2: number;
}

export interface IGetProjectForUpdateResponseIUCN {
  classificationDetails: IGetProjectForUpdateResponseIUCNArrayItem[];
}

interface IGetProjectForUpdateResponseFundingSource {
  id: number;
  agency_id: number;
  investment_action_category: number;
  investment_action_category_name: string;
  agency_project_id: string;
  funding_amount: number;
  start_date: string;
  end_date: string;
  revision_count: number;
}

export interface IGetProjectForUpdateResponseFundingData {
  fundingSources: IGetProjectForUpdateResponseFundingSource[];
}

export interface IGetProjectForUpdateResponsePartnerships {
  indigenous_partnerships: number[];
  stakeholder_partnerships: string[];
}

/**
 * An interface for a single instance of project metadata, for view-only use cases.
 *
 * @export
 * @interface IGetProjectForViewResponse
 */
export interface IGetProjectForViewResponse {
  project: IGetProjectForViewResponseDetails;
  species: IGetProjectForViewResponseSpecies;
  permit: IGetProjectForViewResponsePermit;
  location: IGetProjectForViewResponseLocation;
  contact: IGetProjectForViewResponseContact;
  iucn: IGetProjectForViewResponseIUCN;
  funding: IGetProjectForViewResponseFundingData;
  partnerships: IGetProjectForViewResponsePartnerships;
}

export interface IGetProjectForViewResponseDetails {
  project_id: number;
  project_name: string;
  start_date: string;
  end_date: string;
  publish_date: string;
  objectives: string;
  region: string;
}

export interface IGetProjectForViewResponseSpecies {
  focal_species: number[];
  focal_species_names?: string[];
}

interface IGetProjectForViewResponsePermitArrayItem {
  permit_number: string;
  permit_type: string;
}

export interface IGetProjectForViewResponsePermit {
  permits: IGetProjectForViewResponsePermitArrayItem[];
}

export interface IGetProjectForViewResponseLocation {
  geometry: Feature[];
  priority: string;
  region: number;
  range: number;
}

interface IGetProjectForViewResponseContactArrayItem {
  first_name: string;
  last_name: string;
  email_address: string;
  agency: string;
  is_public: string;
  is_primary: string;
}

export interface IGetProjectForViewResponseContact {
  contacts: IGetProjectForViewResponseContactArrayItem[];
}

interface IGetProjectForViewResponseIUCNArrayItem {
  classification: number;
  subClassification1: number;
  subClassification2: number;
}

export interface IGetProjectForViewResponseIUCN {
  classificationDetails: IGetProjectForViewResponseIUCNArrayItem[];
}

interface IGetProjectForViewResponseFundingSource {
  id: number;
  agency_id: number;
  agency_name: string;
  investment_action_category: number;
  investment_action_category_name: string;
  funding_amount: number;
  start_date: string;
  end_date: string;
  agency_project_id: string;
  revision_count: number;
}

export interface IGetProjectForViewResponseFundingData {
  fundingSources: IGetProjectForViewResponseFundingSource[];
}

export interface IGetProjectForViewResponsePartnerships {
  indigenous_partnerships: number[];
  stakeholder_partnerships: string[];
}

/**
 * A single media item.
 *
 * @export
 * @interface IGetProjectMediaListResponse
 */
export interface IGetProjectMediaListResponse {
  file_name: string;
  encoded_file: string;
}

/**
 * A  file upload response.
 *
 * @export
 * @interface IUploadAttachmentResponse
 */
export interface IUploadAttachmentResponse {
  attachmentId: number;
  revision_count: number;
}

export interface IGetProjectParticipantsResponseArrayItem {
  project_participation_id: number;
  project_id: number;
  system_user_id: number;
  project_role_id: number;
  project_role_name: string;
  user_identifier: string;
  user_identity_source_id: number;
}
export interface IGetProjectParticipantsResponse {
  participants: IGetProjectParticipantsResponseArrayItem[];
}

export interface IAddProjectParticipant {
  userIdentifier: string;
  identitySource: string;
  roleId: number;
}

export interface IGetTreatmentItem {
  treatment_name: string;
  treatment_year: string;
}

export interface IGetProjectTreatment {
  id: string;
  type: string;
  width: number;
  length: number;
  area: number;
  treatments: IGetTreatmentItem[];
}

export interface IPostTreatmentUnitResponse {
  treatment_unit_id: number;
  revision_count: number;
}

export interface TreatmentSearchCriteria {
  years: string[];
}

/**
 * Get project attachments response object.
 *
 * @export
 * @interface IGetProjectTreatmentsResponse
 */
export interface IGetProjectTreatmentsResponse {
  treatmentList: IGetProjectTreatment[];
}
