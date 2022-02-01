import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/search/search-queries');

/**
 * SQL query to get project geometries
 *
 * @param {boolean} isUserAdmin
 * @param {number | null} systemUserId
 * @returns {SQLStatement} sql query object
 */
export const getSpatialSearchResultsSQL = (isUserAdmin: boolean, systemUserId: number | null): SQLStatement | null => {
  defaultLog.debug({ label: 'getSpatialSearchResultsSQL', message: 'params', isUserAdmin, systemUserId });

  if (!systemUserId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      p.project_id as id,
      p.name,
      public.ST_asGeoJSON(psc.geography) as geometry
    FROM
      project p
    LEFT JOIN
      project_spatial_component psc
    ON
      p.project_id = psc.project_id
    LEFT join
      project_spatial_component_type psct
    ON
      psc.project_spatial_component_type_id = psct.project_spatial_component_type_id
    WHERE
      psct.name = 'Boundary'
    `;

  if (!isUserAdmin) {
    sqlStatement.append(SQL` and p.create_user = ${systemUserId};`);
  } else {
    sqlStatement.append(SQL`;`);
  }

  defaultLog.debug({
    label: 'getSpatialSearchResultsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
