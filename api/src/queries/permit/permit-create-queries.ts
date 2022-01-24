import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/permit/permit-create-queries');

/**
 * SQL query to insert a permit row for permit associated to a project.
 *
 * @param {string} permitNumber
 * @param {string} permitType
 * @param {number} projectId
 * @param {number} systemUserId
 * @returns {SQLStatement} sql query object
 */
export const postProjectPermitSQL = (
  permitNumber: string,
  permitType: string,
  projectId: number,
  systemUserId: number
): SQLStatement | null => {
  defaultLog.debug({
    label: 'postProjectPermitSQL',
    message: 'params',
    permitNumber,
    permitType,
    projectId,
    systemUserId
  });

  if (!permitNumber || !permitType || !projectId || !systemUserId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
      INSERT INTO permit (
        project_id,
        number,
        type,
        system_user_id
      ) VALUES (
        ${projectId},
        ${permitNumber},
        ${permitType},
        ${systemUserId}
      )
      RETURNING
        permit_id as id;
    `;

  defaultLog.debug({
    label: 'postProjectPermitSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
