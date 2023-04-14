import { SQL, SQLStatement } from 'sql-template-strings';
import { SYSTEM_IDENTITY_SOURCE } from '../../constants/database';

/**
 * SQL query to get a single user and their system roles, based on their user_identifier.
 *
 * @param {string} userIdentifier
 * @returns {SQLStatement} sql query object
 */
export const getUserByUserIdentifierSQL = (userIdentifier: string, identitySource: string): SQLStatement => {
  return SQL`
    SELECT
      su.system_user_id,
      su.user_identifier,
      su.user_guid,
      su.record_end_date,
      uis.name AS identity_source,
      array_remove(array_agg(sr.system_role_id), NULL) AS role_ids,
      array_remove(array_agg(sr.name), NULL) AS role_names
    FROM
      system_user su
    LEFT JOIN
      system_user_role sur
    ON
      su.system_user_id = sur.system_user_id
    LEFT JOIN
      system_role sr
    ON
      sur.system_role_id = sr.system_role_id
    LEFT JOIN
      user_identity_source uis
    ON
      uis.user_identity_source_id = su.user_identity_source_id
    WHERE
      su.user_identifier = ${userIdentifier}
    AND
      uis.name = ${identitySource}
    GROUP BY
      su.system_user_id,
      su.record_end_date,
      su.user_identifier,
      su.user_guid,
      uis.name;
  `;
};

/**
 * SQL query to get a single user and their system roles, based on their id.
 *
 * @param {number} systemUserId
 * @returns {SQLStatement} sql query object
 */
export const getUserByIdSQL = (systemUserId: number): SQLStatement => {
  return SQL`
    SELECT
      su.system_user_id,
      su.user_identifier,
      su.user_guid,
      su.record_end_date,
      uis.name AS identity_source,
      array_remove(array_agg(sr.system_role_id), NULL) AS role_ids,
      array_remove(array_agg(sr.name), NULL) AS role_names
    FROM
      system_user su
    LEFT JOIN
      system_user_role sur
    ON
      su.system_user_id = sur.system_user_id
    LEFT JOIN
      system_role sr
    ON
      sur.system_role_id = sr.system_role_id
    LEFT JOIN
      user_identity_source uis
    ON
      uis.user_identity_source_id = su.user_identity_source_id
    WHERE
      su.system_user_id = ${systemUserId}
    AND
      su.record_end_date IS NULL
    GROUP BY
      su.system_user_id,
      uis.name,
      su.user_guid,
      su.record_end_date,
      su.user_identifier;
  `;
};

/**
 * SQL query to get a single user and their system roles, based on their guid.
 *
 * @param {string} userGuid
 * @return {*}  {(SQLStatement)}
 */
export const getUserByGuid = (userGuid: string): SQLStatement => {
  return SQL`
    SELECT
      su.system_user_id,
      su.user_identifier,
      su.user_guid,
      su.record_end_date,
      uis.name AS identity_source,
      array_remove(array_agg(sr.system_role_id), NULL) AS role_ids,
      array_remove(array_agg(sr.name), NULL) AS role_names
    FROM
      system_user su
    LEFT JOIN
      system_user_role sur
    ON
      su.system_user_id = sur.system_user_id
    LEFT JOIN
      system_role sr
    ON
      sur.system_role_id = sr.system_role_id
    LEFT JOIN
      user_identity_source uis
    ON
      uis.user_identity_source_id = su.user_identity_source_id
    WHERE
      su.user_guid = ${userGuid}
    GROUP BY
      su.system_user_id,
      su.record_end_date,
      su.user_identifier,
      su.user_guid,
      uis.name;
  `;
};

/**
 * SQL query to get all users.
 *
 * @returns {SQLStatement} sql query object
 */
export const getUserListSQL = (): SQLStatement => {
  return SQL`
    SELECT
      su.system_user_id,
      su.user_guid,
      su.user_identifier,
      su.record_end_date,
      uis.name AS identity_source,
      array_remove(array_agg(sr.system_role_id), NULL) AS role_ids,
      array_remove(array_agg(sr.name), NULL) AS role_names
    FROM
      system_user su
    LEFT JOIN
      system_user_role sur
    ON
      su.system_user_id = sur.system_user_id
    LEFT JOIN
      system_role sr
    ON
      sur.system_role_id = sr.system_role_id
    LEFT JOIN
    	user_identity_source uis
    ON
    	su.user_identity_source_id = uis.user_identity_source_id
    WHERE
      su.record_end_date IS NULL AND uis.name not in (${SYSTEM_IDENTITY_SOURCE.DATABASE}, ${SYSTEM_IDENTITY_SOURCE.SYSTEM})
    GROUP BY
      su.system_user_id,
      su.user_guid,
      su.record_end_date,
      su.user_identifier,
      uis.name;
  `;
};

/**
 * SQL query to add a new system user.
 *
 * @param {string | null} userGuid
 * @param {string} userIdentifier
 * @param {string} identitySource
 * @return {*}  {(SQLStatement)}
 */
export const addSystemUserSQL = (
  userGuid: string | null,
  userIdentifier: string,
  identitySource: string
): SQLStatement => {
  return SQL`
    INSERT INTO
      system_user
    (
      user_guid,
      user_identity_source_id,
      user_identifier,
      record_effective_date
    )
    VALUES (
      ${userGuid ? userGuid.toLowerCase() : null},
      (
        SELECT
          user_identity_source_id
        FROM
          user_identity_source
        WHERE
          name = ${identitySource.toUpperCase()}
      ),
      ${userIdentifier},
      now()
    )
    RETURNING
      system_user_id,
      user_identity_source_id,
      user_identifier,
      record_effective_date,
      record_end_date;
  `;
};

/**
 * SQL query to remove one or more system roles from a user.
 *
 * @param {number} userId
 * @param {number[]} roleIds
 * @return {*}  {(SQLStatement)}
 */
export const deactivateSystemUserSQL = (userId: number): SQLStatement => {
  return SQL`
    UPDATE
      system_user
    SET
      record_end_date = now()
    WHERE
      system_user_id = ${userId};
    `;
};

/**
 * SQL query to activate a system user. Does nothing is the system user is already active.
 *
 * @param {number} systemUserId
 * @return {*}  {(SQLStatement)}
 */
export const activateSystemUserSQL = (systemUserId: number): SQLStatement => {
  return SQL`
    UPDATE
      system_user
    SET
      record_end_date = NULL
    WHERE
      system_user_id = ${systemUserId}
    AND
      record_end_date IS NOT NULL
    RETURNING
      *;
  `;
};

/**
 * SQL query to remove all system roles from a user.
 *
 * @param {number} userId
 * @param {number[]} roleIds
 * @return {*}  {(SQLStatement)}
 */
export const deleteAllSystemRolesSQL = (userId: number): SQLStatement => {
  return SQL`
    DELETE FROM
      system_user_role
    WHERE
      system_user_id = ${userId};
    `;
};

/**
 * SQL query to remove all system roles from a user.
 *
 * @param {number} userId
 * @param {number[]} roleIds
 * @return {*}  {(SQLStatement)}
 */
export const deleteAllProjectRolesSQL = (userId: number): SQLStatement => {
  return SQL`
    DELETE FROM
      project_participation
    WHERE
      system_user_id = ${userId};
    `;
};
