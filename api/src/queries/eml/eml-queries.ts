import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to get project first nations data.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getProjectFirstNationsSQL = (projectId: number): SQLStatement => {
  const sqlStatement: SQLStatement = SQL`
    select
      first_nations.name
    from
      first_nations
    join
      project_first_nation
    on
      project_first_nation.first_nations_id = first_nations.first_nations_id
    where
      project_first_nation.project_id = ${projectId};
  `;

  return sqlStatement;
};
