export enum AdministrativeActivityType {
  SYSTEM_ACCESS = 'System Access'
}

export enum AdministrativeActivityStatusType {
  PENDING = 'Pending',
  ACTIONED = 'Actioned',
  REJECTED = 'Rejected'
}

export enum ProjectStatusType {
  COMPLETED = 'Completed',
  ACTIVE = 'Active',
  DRAFT = 'Draft',
  PRIORITY = 'Priority',
  NOT_A_PRIORITY = 'Not_A_Priority'
}

//url for public reference of iucn conservation classification file.
export const ICUN_CONSERVATION_CLASSIFICATION_REFERENCE_URL =
  'https://nrs.objectstore.gov.bc.ca/gblhvt/restoration-tracker/public/CMP%20Conservation%20Actions%20Calssification%20v2.0.xlsx';
