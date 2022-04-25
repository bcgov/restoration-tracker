import { SQL, SQLStatement } from 'sql-template-strings';
import { PutProjectData } from '../../models/project-update';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/project/project-update-queries');

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
