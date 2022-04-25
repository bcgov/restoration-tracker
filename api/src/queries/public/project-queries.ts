import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/public/project-queries');

/**
 * SQL query to get all public facing (published) projects.
 *
 * @returns {SQLStatement} sql query object
 */
export const getPublicProjectListSQL = (): SQLStatement | null => {
  defaultLog.debug({ label: 'getPublicProjectListSQL', message: 'params' });

  const sqlStatement = SQL`
    SELECT
      p.project_id as id,
      p.name,
      p.start_date,
      p.end_date,
      string_agg(DISTINCT pc.agency, ', ') as agency_list,
      string_agg(DISTINCT pp.number, ', ') as permits_list
    from
      project as p
    left outer join permit as pp
      on p.project_id = pp.project_id
    left outer join project_contact as pc
      on p.project_id = pc.project_id
  `;

  sqlStatement.append(SQL`
    group by
      p.project_id,
      p.name,
      p.start_date,
      p.end_date
  `);

  defaultLog.debug({
    label: 'getPublicProjectListSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
