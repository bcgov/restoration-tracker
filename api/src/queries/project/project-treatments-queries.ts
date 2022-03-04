import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/project/project-attachments-queries');

/**
 * SQL query to get attachments for a single project.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getProjectTreatmentsSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getProjectTreatmentsSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
  `; //todo

  defaultLog.debug({
    label: 'getProjectTreatmentsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get attachments for a single project.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getTreatmentFeatureTypesSQL = (): SQLStatement | null => {
  defaultLog.debug({ label: 'getTreatmentUnitTypesSQL', message: 'params' });

  const sqlStatement: SQLStatement = SQL`
    SELECT
      *
    from
      feature_type;
  `;

  defaultLog.debug({
    label: 'getTreatmentFeatureTypesSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to delete an attachment for a single project.
 *
 * @param {number} attachmentId
 * @returns {SQLStatement} sql query object
 */
export const deleteProjectTreatmentSQL = (projectId: number, attachmentId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'deleteProjectTreatmentSQL', message: 'params', projectId, attachmentId });

  if (!projectId || !attachmentId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
  `; //todo

  defaultLog.debug({
    label: 'deleteProjectTreatmentSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert a project treatment unit row.
 *
 * @param projectId
 * @param featureTypeId
 * @param featureProperties
 * @returns {SQLStatement} sql query object
 */
export const postTreatmentUnitSQL = (
  projectId: number,
  featureTypeId: number,
  featureProperties: any //define later
): SQLStatement | null => {
  defaultLog.debug({
    label: 'postProjectTreatmentSQL',
    message: 'params',
    featureProperties,
    projectId
  });

  if (!featureProperties || !projectId || !featureTypeId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO treatment_unit (
      project_id,
      feature_type_id,
      name,
      description,
      width,
      length,
      area,
      comments,
      reconnaissance_conducted
    ) VALUES (
      ${projectId},
      ${featureTypeId},
      ${featureProperties.Treatment_},
      ${featureProperties.Treatment1},
      ${featureProperties.Width_m},
      ${featureProperties.Length_m},
      ${featureProperties.Width_m * featureProperties.Length_m},
      ${featureProperties.FEATURE_TY},
      ${featureProperties.Reconnaiss}
    )
    RETURNING
      treatment_unit_id as id,
      revision_count;
  `;

  defaultLog.debug({
    label: 'postProjectTreatmentSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert a project treatment unit geometry.
 *
 * @param treatmentUnitId
 * @param geometry
 * @returns {SQLStatement} sql query object
 */
export const postTreatmentUnitGeometrySQL = (
  treatmentUnitId: number,
  geometry: any //define later
): SQLStatement | null => {
  defaultLog.debug({
    label: 'postProjectTreatmentSQL',
    message: 'params',
    treatmentUnitId,
    geometry
  });

  if (!treatmentUnitId || !geometry) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO treatment (
      treatment_unit_id,
      geometry
    ) VALUES (
     ${treatmentUnitId},
     ${geometry}
    )
    RETURNING
      treatment_unit_id as id,
      revision_count;
  `;

  defaultLog.debug({
    label: 'postTreatmentUnitGeometrySQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to update an attachment for a single project by project id and filename.
 *
 * @param {number} projectId
 * @param {string} fileName
 * @returns {SQLStatement} sql query object
 */
export const putProjectTreatmentSQL = (projectId: number, fileName: string): SQLStatement | null => {
  defaultLog.debug({ label: 'putProjectTreatmentSQL', message: 'params', projectId, fileName });

  if (!projectId || !fileName) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
  `; //todo

  defaultLog.debug({
    label: 'putProjectTreatmentSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get an attachment for a single project by project id and filename.
 *
 * @param {number} projectId
 * @param {string} fileName
 * @returns {SQLStatement} sql query object
 */
export const getProjectTreatmentByFileNameSQL = (projectId: number, fileName: string): SQLStatement | null => {
  defaultLog.debug({ label: 'getProjectTreatmentByFileNameSQL', message: 'params', projectId });

  if (!projectId || !fileName) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
  `; //todo

  defaultLog.debug({
    label: 'getProjectTreatmentByFileNameSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
