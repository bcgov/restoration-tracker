import { SQL, SQLStatement } from 'sql-template-strings';
import { PostFundingSource, PostLocationData, PostProjectData, PostProjectObject } from '../../models/project-create';
import { getLogger } from '../../utils/logger';
import { queries } from '../queries';

const defaultLog = getLogger('queries/project/project-create-queries');

/**
 * SQL query to insert a project row.
 *
 * @param {(PostProjectData)} project
 * @returns {SQLStatement} sql query object
 */
export const postProjectSQL = (project: PostProjectData): SQLStatement | null => {
  defaultLog.debug({ label: 'postProjectSQL', message: 'params', PostProjectObject });

  if (!project) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO project (
      name,
      start_date,
      end_date,
      objectives
    ) VALUES (
      ${project.name},
      ${project.start_date},
      ${project.end_date},
      ${project.objectives}
    )
    RETURNING
      project_id as id;
  `;

  defaultLog.debug({
    label: 'postProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert a project row.
 *
 * @param {PostLocationData} locationData
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const postProjectBoundarySQL = (locationData: PostLocationData, projectId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'postProjectBoundarySQL',
    message: 'params',
    obj: {
      ...locationData,
      geometry: locationData?.geometry?.map((item: any) => {
        return { ...item, geometry: 'Too big to print' };
      })
    }
  });

  if (!locationData || !locationData.geometry.length || !projectId) {
    return null;
  }

  const componentName = 'Boundary';
  const componentTypeName = 'Boundary';

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO project_spatial_component (
      project_id,
      project_spatial_component_type_id,
      name,
      geojson,
      geography
    ) VALUES (
      ${projectId},
      (SELECT project_spatial_component_type_id from project_spatial_component_type WHERE name = ${componentTypeName}),
      ${componentName},
      ${JSON.stringify(locationData.geometry)}
  `;

  const geometryCollectionSQL = queries.spatial.generateGeometryCollectionSQL(locationData.geometry);

  sqlStatement.append(SQL`
    ,public.geography(
      public.ST_Force2D(
        public.ST_SetSRID(
  `);

  sqlStatement.append(geometryCollectionSQL);

  sqlStatement.append(SQL`
    , 4326)))
  `);

  sqlStatement.append(SQL`
    )
    RETURNING
      project_spatial_component_id as id;
  `);

  defaultLog.debug({
    label: 'postProjectBoundarySQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert a project funding source row.
 *
 * @param {PostFundingSource} fundingSource
 * @returns {SQLStatement} sql query object
 */
export const postProjectFundingSourceSQL = (
  fundingSource: PostFundingSource,
  projectId: number
): SQLStatement | null => {
  defaultLog.debug({ label: 'postProjectFundingSourceSQL', message: 'params', fundingSource, projectId });

  if (!fundingSource || !projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
      INSERT INTO project_funding_source (
        project_id,
        investment_action_category_id,
        funding_source_project_id,
        funding_amount,
        funding_start_date,
        funding_end_date
      ) VALUES (
        ${projectId},
        ${fundingSource.investment_action_category},
        ${fundingSource.agency_project_id},
        ${fundingSource.funding_amount},
        ${fundingSource.start_date},
        ${fundingSource.end_date}
      )
      RETURNING
        project_funding_source_id as id;
    `;

  defaultLog.debug({
    label: 'postProjectFundingSourceSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert a project stakeholder partnership row.
 *
 * @param {string} stakeholderPartnership
 * @returns {SQLStatement} sql query object
 */
export const postProjectStakeholderPartnershipSQL = (
  stakeholderPartnership: string,
  projectId: number
): SQLStatement | null => {
  defaultLog.debug({
    label: 'postProjectStakeholderPartnershipSQL',
    message: 'params',
    stakeholderPartnership,
    projectId
  });

  if (!stakeholderPartnership || !projectId) {
    return null;
  }

  // TODO model is missing agency name
  const sqlStatement: SQLStatement = SQL`
      INSERT INTO stakeholder_partnership (
        project_id,
        name
      ) VALUES (
        ${projectId},
        ${stakeholderPartnership}
      )
      RETURNING
        stakeholder_partnership_id as id;
    `;

  defaultLog.debug({
    label: 'postProjectStakeholderPartnershipSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert a project indigenous nation row.
 *
 * @param {string} indigenousNationId
 * @returns {SQLStatement} sql query object
 */
export const postProjectIndigenousNationSQL = (indigenousNationId: number, projectId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'postProjectIndigenousNationSQL',
    message: 'params',
    indigenousNationId,
    projectId
  });

  if (!indigenousNationId || !projectId) {
    return null;
  }

  // TODO model is missing agency name
  const sqlStatement: SQLStatement = SQL`
      INSERT INTO project_first_nation (
        project_id,
        first_nations_id
      ) VALUES (
        ${projectId},
        ${indigenousNationId}
      )
      RETURNING
        project_first_nation_id as id;
    `;

  defaultLog.debug({
    label: 'postProjectIndigenousNationSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert a project IUCN row.
 *
 * @param iucn3_id
 * @param project_id
 * @returns {SQLStatement} sql query object
 */
export const postProjectIUCNSQL = (iucn3_id: number, project_id: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'postProjectIUCNSQL',
    message: 'params',
    iucn3_id,
    project_id
  });

  if (!iucn3_id || !project_id) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
      INSERT INTO project_iucn_action_classification (
        iucn_conservation_action_level_3_subclassification_id,
        project_id
      ) VALUES (
        ${iucn3_id},
        ${project_id}
      )
      RETURNING
        project_iucn_action_classification_id as id;
    `;

  defaultLog.debug({
    label: 'postProjectIUCNSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert a focal species row into the study_species table.
 *
 * @param {number} speciesId
 * @returns {SQLStatement} sql query object
 */
export const postProjectSpeciesSQL = (speciesId: number, projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'postProjectSpeciesSQL', message: 'params', speciesId, projectId });

  if (!speciesId || !projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO project_species (
      wldtaxonomic_units_id,
      project_id
    ) VALUES (
      ${speciesId},
      ${projectId}
    ) RETURNING project_species_id as id;
  `;

  defaultLog.debug({
    label: 'postProjectSpeciesSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
