import SQL from 'sql-template-strings';
import { HTTP400 } from '../errors/custom-error';
import {
  GetCoordinatorData,
  GetFundingData,
  GetIUCNClassificationData,
  GetLocationData,
  GetPartnershipsData,
  GetPermitData,
  GetProjectData
} from '../models/project-view';
import { queries } from '../queries/queries';
import { DBService } from './service';

export type ListSystemUsers = {
  id: number;
  user_identifier: string;
  record_end_date: string;
  role_ids: number[];
  role_names: string[];
};

export class ProjectService extends DBService {
  /**
   * Gets the project participant, adding them if they do not already exist.
   *
   * @param {number} projectId
   * @param {number} systemUserId
   * @return {*}  {Promise<any>}
   * @memberof ProjectService
   */
  async ensureProjectParticipant(
    projectId: number,
    systemUserId: number,
    projectParticipantRoleId: number
  ): Promise<void> {
    const projectParticipantRecord = await this.getProjectParticipant(projectId, systemUserId);

    if (projectParticipantRecord) {
      // project participant already exists, do nothing
      return;
    }

    // add new project participant record
    await this.addProjectParticipant(projectId, systemUserId, projectParticipantRoleId);
  }

  /**
   * Get an existing project participant.
   *
   * @param {number} projectId
   * @param {number} systemUserId
   * @return {*}  {Promise<any>}
   * @memberof ProjectService
   */
  async getProjectParticipant(projectId: number, systemUserId: number): Promise<any> {
    const sqlStatement = queries.projectParticipation.getProjectParticipationBySystemUserSQL(projectId, systemUserId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL select statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response) {
      throw new HTTP400('Failed to get project team members');
    }

    return response?.rows?.[0] || null;
  }

  /**
   * Get all project participants for a project.
   *
   * @param {number} projectId
   * @return {*}  {Promise<object[]>}
   * @memberof ProjectService
   */
  async getProjectParticipants(projectId: number): Promise<object[]> {
    const sqlStatement = queries.projectParticipation.getAllProjectParticipantsSQL(projectId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL select statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response.rows) {
      throw new HTTP400('Failed to get project team members');
    }

    return (response && response.rows) || [];
  }

  /**
   * Adds a new project participant.
   *
   * Note: Will fail if the project participant already exists.
   *
   * @param {number} projectId
   * @param {number} systemUserId
   * @param {number} projectParticipantRoleId
   * @return {*}  {Promise<void>}
   * @memberof ProjectService
   */
  async addProjectParticipant(
    projectId: number,
    systemUserId: number,
    projectParticipantRoleId: number
  ): Promise<void> {
    const sqlStatement = queries.projectParticipation.addProjectRoleByRoleIdSQL(
      projectId,
      systemUserId,
      projectParticipantRoleId
    );

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL insert statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response.rowCount) {
      throw new HTTP400('Failed to insert project team member');
    }
  }

  /**
   *
   *
   * @param {number} projectId
   * @return {*}
   * @memberof ProjectService
   */
  async getProjectById(projectId: number) {
    const [
      projectData,
      iucnData,
      coordinatorData,
      permitData,
      partnershipsData,
      fundingData,
      locationData
    ] = await Promise.all([
      this.getProjectData(projectId),
      this.getIUCNClassificationData(projectId),
      this.getCoordinatorData(projectId),
      this.getPermitData(projectId),
      this.getPartnershipsData(projectId),
      this.getFundingData(projectId),
      this.getLocationData(projectId)
    ]);

    return {
      id: projectId,
      project: projectData,
      iucn: iucnData,
      coordinator: coordinatorData,
      permit: permitData,
      partnerships: partnershipsData,
      funding: fundingData,
      location: locationData
    };
  }

  async getProjectData(projectId: number): Promise<GetProjectData> {
    const sqlStatement = SQL`
      SELECT
        *
      FROM
        project
      WHERE
        project_id = ${projectId};
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result) {
      throw new HTTP400('Failed to get project data');
    }

    return new GetProjectData(result);
  }

  async getIUCNClassificationData(projectId: number): Promise<GetIUCNClassificationData> {
    const sqlStatement = SQL`
      SELECT
        ical1c.name as classification,
        ical2s.name as subClassification1,
        ical3s.name as subClassification2
      FROM
        project_iucn_action_classification as piac
      LEFT OUTER JOIN
        iucn_conservation_action_level_3_subclassification as ical3s
      ON
        piac.iucn_conservation_action_level_3_subclassification_id = ical3s.iucn_conservation_action_level_3_subclassification_id
      LEFT OUTER JOIN
        iucn_conservation_action_level_2_subclassification as ical2s
      ON
        ical3s.iucn_conservation_action_level_2_subclassification_id = ical2s.iucn_conservation_action_level_2_subclassification_id
      LEFT OUTER JOIN
        iucn_conservation_action_level_1_classification as ical1c
      ON
        ical2s.iucn_conservation_action_level_1_classification_id = ical1c.iucn_conservation_action_level_1_classification_id
      WHERE
        piac.project_id = ${projectId}
      GROUP BY
        ical2s.name,
        ical1c.name,
        ical3s.name;
  `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new HTTP400('Failed to get project IUCN data');
    }

    return new GetIUCNClassificationData(result);
  }

  async getCoordinatorData(projectId: number): Promise<GetCoordinatorData> {
    const sqlStatement = SQL`
      SELECT
        *
      FROM
        project
      WHERE
        project_id = ${projectId};
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result) {
      throw new HTTP400('Failed to get project coordinator data');
    }

    return new GetCoordinatorData(result);
  }

  async getPermitData(projectId: number): Promise<GetPermitData> {
    const sqlStatement = SQL`
      SELECT
        *
      FROM
        permit
      WHERE
        project_id = ${projectId};
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new HTTP400('Failed to get project permit data');
    }

    return new GetPermitData(result);
  }

  async getPartnershipsData(projectId: number): Promise<GetPartnershipsData> {
    const [indigenousPartnershipsRows, stakegholderPartnershipsRows] = await Promise.all([
      this.getIndigenousPartnershipsRows(projectId),
      this.getStakeholderPartnershipsRows(projectId)
    ]);

    if (!indigenousPartnershipsRows) {
      throw new HTTP400('Failed to get indigenous partnership data');
    }

    if (!stakegholderPartnershipsRows) {
      throw new HTTP400('Failed to get stakeholder partnership data');
    }

    return new GetPartnershipsData(indigenousPartnershipsRows, stakegholderPartnershipsRows);
  }

  async getIndigenousPartnershipsRows(projectId: number): Promise<any[]> {
    const sqlStatement = SQL`
      SELECT
        fn.first_nations_id,
        fn.name
      FROM
        project_first_nation pfn
      LEFT OUTER JOIN
        first_nations fn
      ON
        pfn.first_nations_id = fn.first_nations_id
      WHERE
        pfn.project_id = ${projectId}
      GROUP BY
        fn.first_nations_id,
        fn.name;
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows) || null;

    return result;
  }

  async getStakeholderPartnershipsRows(projectId: number): Promise<any[]> {
    const sqlStatement = SQL`
      SELECT
        name
      FROM
        stakeholder_partnership
      WHERE
        project_id = ${projectId};
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new HTTP400('Failed to get stakeholder partnership data');
    }

    return result;
  }

  async getFundingData(projectId: number): Promise<GetFundingData> {
    const sqlStatement = SQL`
      SELECT
        pfs.project_funding_source_id as id,
        fs.funding_source_id as agency_id,
        pfs.funding_amount::numeric::int,
        pfs.funding_start_date as start_date,
        pfs.funding_end_date as end_date,
        iac.investment_action_category_id as investment_action_category,
        iac.name as investment_action_category_name,
        fs.name as agency_name,
        pfs.funding_source_project_id as agency_project_id,
        pfs.revision_count as revision_count
      FROM
        project_funding_source as pfs
      LEFT OUTER JOIN
        investment_action_category as iac
      ON
        pfs.investment_action_category_id = iac.investment_action_category_id
      LEFT OUTER JOIN
        funding_source as fs
      ON
        iac.funding_source_id = fs.funding_source_id
      WHERE
        pfs.project_id = ${projectId}
      GROUP BY
        pfs.project_funding_source_id,
        fs.funding_source_id,
        pfs.funding_source_project_id,
        pfs.funding_amount,
        pfs.funding_start_date,
        pfs.funding_end_date,
        iac.investment_action_category_id,
        iac.name,
        fs.name,
        pfs.revision_count
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new HTTP400('Failed to get project funding data');
    }

    return new GetFundingData(result);
  }

  async getLocationData(projectId: number): Promise<GetLocationData> {
    const sqlStatement = SQL`
      SELECT
        *
      FROM
        project_spatial_component
      WHERE
        project_id = ${projectId};
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new HTTP400('Failed to get project location data');
    }

    return new GetLocationData(result);
  }
}
