export class ProjectParticipantObject {
  project_id: number;
  name: string;
  system_user_id: number;
  project_role_id: number;
  project_role_name: string;
  project_participation_id: number;

  constructor(obj?: any) {
    this.project_id = obj?.project_id || undefined;
    this.name = obj?.project_name || undefined;
    this.system_user_id = obj?.system_user_id || undefined;
    this.project_role_id = obj?.project_role_id || undefined;
    this.project_role_name = obj?.project_role_name || undefined;
    this.project_participation_id = obj?.project_participation_id || undefined;
  }
}

export class UserObject {
  id: number;
  user_guid: string;
  user_identifier: string;
  identity_source: string;
  record_end_date: string;
  role_ids: number[];
  role_names: string[];

  constructor(systemUserData?: any) {
    this.id = systemUserData?.system_user_id || undefined;
    this.user_guid = systemUserData?.user_guid || undefined;
    this.user_identifier = systemUserData?.user_identifier || undefined;
    this.identity_source = systemUserData?.identity_source || undefined;
    this.record_end_date = systemUserData?.record_end_date || undefined;
    this.role_ids = (systemUserData?.role_ids?.length && systemUserData.role_ids) || [];
    this.role_names = (systemUserData?.role_names?.length && systemUserData.role_names) || [];
  }
}
