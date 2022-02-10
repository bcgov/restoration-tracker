import { coordinator_agency } from '../constants/codes';
import { queries } from '../queries/queries';
import { getLogger } from '../utils/logger';
import { DBService } from './service';
import { getNRMRegions } from './../utils/spatial-utils';

const defaultLog = getLogger('queries/code-queries');

/**
 * A single code value.
 *
 * @export
 * @interface ICode
 */
export interface ICode {
  id: number;
  name: string;
}

/**
 * A code set (an array of ICode values).
 */
export type CodeSet<T extends ICode = ICode> = T[];

export interface IAllCodeSets {
  first_nations: CodeSet;
  funding_source: CodeSet;
  investment_action_category: CodeSet<{ id: number; fs_id: number; name: string }>;
  coordinator_agency: CodeSet;
  regions: CodeSet;
  iucn_conservation_action_level_1_classification: CodeSet;
  iucn_conservation_action_level_2_subclassification: CodeSet<{ id: number; iucn1_id: number; name: string }>;
  iucn_conservation_action_level_3_subclassification: CodeSet<{ id: number; iucn2_id: number; name: string }>;
  system_roles: CodeSet;
  project_roles: CodeSet;
  administrative_activity_status_type: CodeSet;
  ranges: CodeSet;
  species: CodeSet;
}

export class CodeService extends DBService {
  /**
   * Function that fetches all code sets.
   *
   * @return {*}  {Promise<IAllCodeSets>} an object containing all code sets
   * @memberof CodeService
   */
  async getAllCodeSets(): Promise<IAllCodeSets> {
    defaultLog.debug({ message: 'getAllCodeSets' });

    const [
      first_nations,
      funding_source,
      investment_action_category,
      iucn_conservation_action_level_1_classification,
      iucn_conservation_action_level_2_subclassification,
      iucn_conservation_action_level_3_subclassification,
      system_roles,
      project_roles,
      administrative_activity_status_type
    ] = await Promise.all([
      await this.connection.query(queries.codes.getFirstNationsSQL().text),
      await this.connection.query(queries.codes.getFundingSourceSQL().text),
      await this.connection.query(queries.codes.getInvestmentActionCategorySQL().text),
      await this.connection.query(queries.codes.getIUCNConservationActionLevel1ClassificationSQL().text),
      await this.connection.query(queries.codes.getIUCNConservationActionLevel2SubclassificationSQL().text),
      await this.connection.query(queries.codes.getIUCNConservationActionLevel3SubclassificationSQL().text),
      await this.connection.query(queries.codes.getSystemRolesSQL().text),
      await this.connection.query(queries.codes.getProjectRolesSQL().text),
      await this.connection.query(queries.codes.getAdministrativeActivityStatusTypeSQL().text)
    ]);

    return {
      first_nations: (first_nations && first_nations.rows) || [],
      funding_source: (funding_source && funding_source.rows) || [],
      investment_action_category: (investment_action_category && investment_action_category.rows) || [],
      iucn_conservation_action_level_1_classification:
        (iucn_conservation_action_level_1_classification && iucn_conservation_action_level_1_classification.rows) || [],
      iucn_conservation_action_level_2_subclassification:
        (iucn_conservation_action_level_2_subclassification &&
          iucn_conservation_action_level_2_subclassification.rows) ||
        [],
      iucn_conservation_action_level_3_subclassification:
        (iucn_conservation_action_level_3_subclassification &&
          iucn_conservation_action_level_3_subclassification.rows) ||
        [],
      system_roles: (system_roles && system_roles.rows) || [],
      project_roles: (project_roles && project_roles.rows) || [],
      administrative_activity_status_type:
        (administrative_activity_status_type && administrative_activity_status_type.rows) || [],
      // TODO Temporarily hard coded list of code values below
      coordinator_agency,
      regions: (await getNRMRegions()) || [],
      ranges: [
        { id: 1, name: 'range 1' },
        { id: 2, name: 'range 2' }
      ],
      species: [
        { id: 1, name: 'species 1' },
        { id: 2, name: 'species 2' }
      ]
    };
  }
}
