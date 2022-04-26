import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/project/project-view-queries');

/**
 * SQL query to get a single project.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      *
    from
      project
    where
      project.project_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
