import { SQL, SQLStatement } from 'sql-template-strings';
import { TreatmentFeature } from '../../models/project-treatment';
import { queries } from '../queries';

/**
 * SQL query to get Treatment Features Types
 *
 * @returns {SQLStatement} sql query object
 */
export const getTreatmentFeatureTypesSQL = (): SQLStatement => {
  const sqlStatement: SQLStatement = SQL`
    SELECT
      feature_type_id,
      name,
      description
    from
      feature_type;
  `;

  return sqlStatement;
};

/**
 * SQL query to get Treatment Unit Treatment Types
 *
 * @returns {SQLStatement} sql query object
 */
export const getTreatmentUnitTypesSQL = (): SQLStatement => {
  const sqlStatement: SQLStatement = SQL`
    SELECT
      treatment_type_id,
      name,
      description
    from
      treatment_type;
  `;

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
  feature: TreatmentFeature
): SQLStatement => {
  const sqlStatement: SQLStatement = SQL`
    INSERT INTO treatment_unit (
      project_id,
      feature_type_id,
      name,
      width,
      length,
      area,
      comments,
      reconnaissance_conducted,
      geojson,
      geography
    ) VALUES (
      ${projectId},
      ${featureTypeId},
      ${feature.properties.TU_ID},
      ${feature.properties.Width_m},
      ${feature.properties.Length_m},
      ${feature.properties.Area_m2},
      ${feature.properties.Comments},
      ${feature.properties.Recce},
      ${JSON.stringify([feature])}
    `;

  const geometryCollectionSQL = queries.spatial.generateGeometryCollectionSQL([feature]);

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
      treatment_unit_id,
      revision_count;
  `);

  return sqlStatement;
};

/**
 * SQL query to insert a project treatment year.
 *
 * @param treatmentUnitId
 * @param year
 * @returns {SQLStatement} sql query object
 */
export const postTreatmentDataSQL = (treatmentUnitId: number, year: string | number): SQLStatement | null => {
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

  return sqlStatement;
};

/**
 * SQL query to insert a treatment types.
 *
 * @param treatmentId
 * @param treatmentTypeId
 * @returns {SQLStatement} sql query object
 */
export const postTreatmentTypeSQL = (treatmentId: number, treatmentTypeId: number): SQLStatement | null => {
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
  if (!projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      tu.name as id, ft.name as type , tu.width, tu.length, tu.area, tu.comments, t.year as treatment_year, tt.name as treatment_name
    FROM
      treatment_unit tu
    LEFT JOIN
      feature_type ft
    ON
      tu.feature_type_id = ft.feature_type_id
    LEFT JOIN
      treatment t
    ON
      tu.treatment_unit_id = t.treatment_unit_id
    LEFT JOIN
      treatment_treatment_type ttt
    ON
      ttt.treatment_id = t.treatment_id
    LEFT JOIN
      treatment_type tt
    ON
      tt.treatment_type_id = ttt.treatment_type_id
    WHERE
      tu.project_id = ${projectId};
    `;

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
  if (!projectId || !fileName) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
  `; //todo

  return sqlStatement;
};

/**
 * SQL query to get all years associated to a project id.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getProjectTreatmentsYearsSQL = (projectId: number): SQLStatement | null => {
  if (!projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT DISTINCT
      year
    FROM
      treatment t
    LEFT JOIN
      treatment_unit tu
    ON
      tu.treatment_unit_id = t.treatment_unit_id
    WHERE
      tu.project_id = ${projectId};
  `;

  return sqlStatement;
};

/**
 * SQL query to get Treatment Unit Treatment Types
 *
 * @param {number} treatmentId
 * @returns {SQLStatement} sql query object
 */
export const deleteProjectTreatmentUnitSQL = (projectId: number, treatmentUnitId: number): SQLStatement => {
  return SQL`
    WITH deleted_treatment_unit AS (
      DELETE
      FROM
        treatment_unit
      WHERE
        project_id = ${projectId}
      AND
        treatment_unit_id = ${treatmentUnitId}
      RETURNING
        treatment_unit_id
    ),
    deleted_treatment AS (
      DELETE
      FROM
        treatment
      WHERE
        treatment_unit_id
      IN (
        SELECT
          treatment_unit_id
        FROM
          deleted_treatment_unit
      )
      RETURNING
        treatment_id
    )
    DELETE
    FROM
      treatment_treatment_type
    WHERE
      treatment_id
    IN (
      SELECT
        treatment_id
      FROM
        deleted_treatment
    );
  `;
};

export const deleteProjectTreatmentsByYearSQL = (projectId: number, year: number): SQLStatement => {
  return SQL`
    WITH deleted_treatment AS (
      DELETE
      FROM
        treatment
      WHERE
        year = ${year}
      AND
        treatment_unit_id
      IN (
        SELECT
          treatment_unit_id
        FROM
          treatment_unit
        WHERE
          project_id = ${projectId}
      )
      RETURNING
        treatment_id
    )
    DELETE
    FROM
      treatment_treatment_type
    WHERE
      treatment_id
    IN (
      SELECT
        treatment_id
      FROM
        deleted_treatment
    );
  `;
};

export const deleteProjectTreatmentUnitIfNoTreatmentsSQL = (): SQLStatement => {
  return SQL`
    DELETE
    FROM
      treatment_unit
    WHERE
      treatment_unit_id
    NOT IN (
      SELECT
        treatment_unit_id
      FROM
        treatment
    );
  `;
};
