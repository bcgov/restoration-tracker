export interface IGetUserResponse {
  project_id: number;
  name: string;
  system_user_id: number;
  project_role_id: number;
  project_role_name: string;
  project_participation_id: number;
}

export interface IGetUserResponse {
  id: number;
  user_identifier: string;
  record_end_date: string;
  role_ids: string[];
  role_names: string[];
  projects: IGetUserResponse[];
}
