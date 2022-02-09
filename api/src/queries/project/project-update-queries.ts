import { SQL, SQLStatement } from 'sql-template-strings';
import { PutProjectData } from '../../models/project-update';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/project/project-update-queries');

/**
 * SQL query to get IUCN action classifications.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getIUCNActionClassificationByProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getIUCNActionClassificationByProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      ical1c.iucn_conservation_action_level_1_classification_id as classification,
      ical2s.iucn_conservation_action_level_2_subclassification_id as subClassification1,
      ical3s.iucn_conservation_action_level_3_subclassification_id as subClassification2
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
      ical1c.iucn_conservation_action_level_1_classification_id,
      ical2s.iucn_conservation_action_level_2_subclassification_id,
      ical3s.iucn_conservation_action_level_3_subclassification_id;
  `;

  defaultLog.debug({
    label: 'getIUCNActionClassificationByProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get project indigenous partnerships.
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getIndigenousPartnershipsByProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getIndigenousPartnershipsByProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      project_first_nation_id as id
    FROM
      project_first_nation pfn
    WHERE
      pfn.project_id = ${projectId}
    GROUP BY
      project_first_nation_id;
  `;

  defaultLog.debug({
    label: 'getIndigenousPartnershipsByProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get permits associated to a project.
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getPermitsByProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getPermitsByProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      number,
      type
    FROM
      permit
    WHERE
      project_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getPermitsByProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to update a project row.
 *
 * @param {(PutProjectData)} project
 * @returns {SQLStatement} sql query object
 */
export const putProjectSQL = (
  projectId: number,
  project: PutProjectData | null,
  revision_count: number
): SQLStatement | null => {
  defaultLog.debug({
    label: 'putProjectSQL',
    message: 'params',
    projectId,
    project,
    revision_count
  });

  if (!projectId || !project) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`UPDATE project SET `;

  const sqlSetStatements: SQLStatement[] = [];

  if (project) {
    sqlSetStatements.push(SQL`name = ${project.name}`);
    sqlSetStatements.push(SQL`start_date = ${project.start_date}`);
    sqlSetStatements.push(SQL`end_date = ${project.end_date}`);
    sqlSetStatements.push(SQL`objectives = ${project.objectives}`);
  }

  sqlSetStatements.forEach((item, index) => {
    sqlStatement.append(item);
    if (index < sqlSetStatements.length - 1) {
      sqlStatement.append(',');
    }
  });

  sqlStatement.append(SQL`
    WHERE
      project_id = ${projectId}
    AND
      revision_count = ${revision_count};
  `);

  defaultLog.debug({
    label: 'putProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to update the publish status of a project.
 *
 * @param {number} projectId
 * @param {boolean} publish
 * @returns {SQLStatement} sql query object
 */
export const updateProjectPublishStatusSQL = (projectId: number, publish: boolean): SQLStatement | null => {
  defaultLog.debug({ label: 'updateProjectPublishStatusSQL', message: 'params', projectId, publish });

  if (!projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`UPDATE project SET publish_timestamp = `;

  if (publish === true) {
    sqlStatement.append(SQL`
    now() WHERE publish_timestamp IS NULL AND project_id = ${projectId}
    `);
  } else {
    sqlStatement.append(SQL`
      null WHERE project_id = ${projectId}
    `);
  }
  sqlStatement.append(SQL` RETURNING project_id as id;`);

  defaultLog.debug({
    label: 'updateProjectPublishStatusSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
