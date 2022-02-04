import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/public/search-queries');

/**
 * SQL query to get public project geometries
 *
 * @returns {SQLStatement} sql query object
 */
export const getPublicSpatialSearchResultsSQL = (): SQLStatement | null => {
  defaultLog.debug({ label: 'getPublicSpatialSearchResultsSQL', message: 'params' });

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
      psct.name = 'Boundary';
  `;

  defaultLog.debug({
    label: 'getPublicSpatialSearchResultsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
