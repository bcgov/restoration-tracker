import { Feature } from 'geojson';
import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/project/project-treatment-queries');

/**
 * SQL query to get Treatment Features Types
 *
 * @returns {SQLStatement} sql query object
 */
export const getTreatmentFeatureTypesSQL = (): SQLStatement | null => {
  defaultLog.debug({ label: 'getTreatmentUnitTypesSQL', message: 'params' });

  const sqlStatement: SQLStatement = SQL`
    SELECT
      feature_type_id,
      name,
      description
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
 * SQL query to get Treatment Unit Treatment Types
 *
 * @returns {SQLStatement} sql query object
 */
export const getTreatmentUnitTypesSQL = (): SQLStatement | null => {
  defaultLog.debug({ label: 'getTreatmentUnitTypesSQL', message: 'params' });

  const sqlStatement: SQLStatement = SQL`
    SELECT
      treatment_type_id,
      name,
      description
    from
      treatment_type;
  `;

  defaultLog.debug({
    label: 'getTreatmentUnitTypesSQL',
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
 * @param geometry
 * @returns {SQLStatement} sql query object
 */
export const postTreatmentUnitSQL = (
  projectId: number,
  featureTypeId: number,
  featureProperties: Feature['properties'],
  geometry: Feature['geometry']
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
      reconnaissance_conducted,
      geometry
    ) VALUES (
      ${projectId},
      ${featureTypeId},
      ${featureProperties.Treatment_},
      ${featureProperties.Treatment1},
      ${featureProperties.Width_m},
      ${featureProperties.Length_m},
      ${featureProperties.Width_m * featureProperties.Length_m},
      ${featureProperties.FEATURE_TY},
      ${featureProperties.Reconnaiss},
      ${geometry}
    )
    RETURNING
      treatment_unit_id,
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
export const postTreatmentDataSQL = (treatmentUnitId: number, year: string | number): SQLStatement | null => {
  defaultLog.debug({
    label: 'postProjectTreatmentSQL',
    message: 'params',
    treatmentUnitId,
    year
  });

  if (!treatmentUnitId || !year) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO treatment (
      treatment_unit_id,
      year
    ) VALUES (
     ${treatmentUnitId},
     ${year}
    )
    RETURNING
      treatment_id,
      revision_count;
  `;

  defaultLog.debug({
    label: 'postTreatmentDataSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert a treatment unit types.
 *
 * @param treatmentId
 * @param treatmentTypeId
 * @returns {SQLStatement} sql query object
 */
export const postTreatmentTypeSQL = (treatmentId: number, treatmentTypeId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'postProjectTreatmentSQL',
    message: 'params',
    treatmentId,
    treatmentTypeId
  });

  if (!treatmentId || !treatmentTypeId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO treatment_treatment_type (
      treatment_id,
      treatment_type_id
    ) VALUES (
      ${treatmentId},
      ${treatmentTypeId}
    ) RETURNING
      treatment_treatment_type_id,
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
 * SQL query to get any treatment unit that already exists.
 *
 * @param projectId
 * @param featureTypeId
 * @param treatmentUnitName
 * @returns {SQLStatement} sql query object
 */
export const getTreatmentUnitExistSQL = (
  projectId: number,
  featureTypeId: number,
  treatmentUnitName: string | number
): SQLStatement | null => {
  defaultLog.debug({
    label: 'postProjectTreatmentSQL',
    message: 'params',
    projectId,
    featureTypeId,
    treatmentUnitName
  });

  if (!projectId || !featureTypeId || !treatmentUnitName) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      treatment_unit_id,
      revision_count
    FROM
      treatment_unit
    WHERE
      project_id = ${projectId}
    AND
      feature_type_id = ${featureTypeId}
    AND
      name = ${treatmentUnitName};
    `;

  defaultLog.debug({
    label: 'getTreatmentUnitExistSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get any treatment data with year that already exists.
 *
 * @param treatmentUnitId
 * @param year
 * @returns {SQLStatement} sql query object
 */
export const getTreatmentDataYearExistSQL = (treatmentUnitId: number, year: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'postProjectTreatmentSQL',
    message: 'params',
    treatmentUnitId,
    year
  });

  if (!treatmentUnitId || !year) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      treatment_id,
      revision_count
    FROM
      treatment
    WHERE
      treatment_unit_id = ${treatmentUnitId}
    AND
      year = ${year};
    `;

  defaultLog.debug({
    label: 'getTreatmentDataYearExistSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/////////////////////////////////////////////////////////////

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
