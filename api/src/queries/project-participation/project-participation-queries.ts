import SQL, { SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/permit/permit-create-queries');

/**
 * SQL query to get all projects from user Id.
 *
 * @param {userId} userId
 * @returns {SQLStatement} sql query object
 */
export const getParticipantsFromAllSystemUsersProjectsSQL = (systemUserId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getParticipantsFromAllSystemUsersProjectsSQL',
    message: 'params',
    systemUserId
  });

  if (!systemUserId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      pp.project_participation_id,
      pp.project_id,
      pp.system_user_id,
      pp.project_role_id,
      pr.name project_role_name
    FROM
      project_participation pp
    LEFT JOIN
      project p
    ON
      pp.project_id = p.project_id
    LEFT JOIN
      project_role pr
    ON
      pr.project_role_id = pp.project_role_id
    WHERE
      pp.project_id in (
        SELECT
          p.project_id
        FROM
          project_participation pp
        LEFT JOIN
          project p
        ON
          pp.project_id = p.project_id
        WHERE
          pp.system_user_id = ${systemUserId}
      );
  `;

  defaultLog.debug({
    label: 'getParticipantsFromAllSystemUsersProjectsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get all projects from user Id.
 *
 * @param {userId} userId
 * @returns {SQLStatement} sql query object
 */
export const getAllUserProjectsSQL = (systemUserId: number, projectId?: number): SQLStatement => {
  const sqlStatement = SQL`
    SELECT
      project.project_id,
      project.name as project_name,
      project_participation.system_user_id,
      project_participation.project_role_id,
      project_role.name as project_role_name,
      project_participation.project_participation_id
    FROM
      project_participation
    LEFT JOIN
      project_role
    ON
      project_participation.project_role_id = project_role.project_role_id
    LEFT JOIN
      project
    ON
      project_participation.project_id = project.project_id
    WHERE
      project_participation.system_user_id = ${systemUserId}
  `;

  if (projectId) {
    sqlStatement.append(SQL`
      AND
        project.project_id = ${projectId}
    `);
  }

  sqlStatement.append(SQL`;`);

  return sqlStatement;
};

/**
 * SQL query to get all project participants.
 *
 * @param {projectId} projectId
 * @returns {SQLStatement} sql query object
 */
export const getAllProjectParticipantsSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getAllProjectParticipantsSQL',
    message: 'params',
    projectId
  });

  if (!projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      pp.project_participation_id,
      pp.project_id,
      pp.system_user_id,
      pp.project_role_id,
      pr.name project_role_name,
      su.user_identifier,
      su.user_identity_source_id
    FROM
      project_participation pp
    LEFT JOIN
      system_user su
    ON
      pp.system_user_id = su.system_user_id
    LEFT JOIN
      project_role pr
    ON
      pr.project_role_id = pp.project_role_id
    WHERE
      pp.project_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getAllProjectParticipantsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to add a single project role to a user.
 *
 * @param {number} projectId
 * @param {number} systemUserId
 * @param {string} projectParticipantRole
 * @return {*}  {(SQLStatement | null)}
 */
export const addProjectRoleByRoleNameSQL = (
  projectId: number,
  systemUserId: number,
  projectParticipantRole: string
): SQLStatement | null => {
  defaultLog.debug({
    label: 'postProjectRoleSQL',
    message: 'params',
    projectId,
    systemUserId,
    projectParticipantRole
  });

  if (!projectId || !systemUserId || !projectParticipantRole) {
    return null;
  }

  const sqlStatement = SQL`
    INSERT INTO project_participation (
      project_id,
      system_user_id,
      project_role_id
    )
    (
      SELECT
        ${projectId},
        ${systemUserId},
        project_role_id
      FROM
        project_role
      WHERE
        name = ${projectParticipantRole}
    )
    RETURNING
      *;
  `;

  defaultLog.debug({
    label: 'postProjectRoleSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to add a single project role to a user.
 *
 * @param {number} projectId
 * @param {number} systemUserId
 * @param {string} projectParticipantRole
 * @return {*}  {(SQLStatement | null)}
 */
export const addProjectRoleByRoleIdSQL = (
  projectId: number,
  systemUserId: number,
  projectParticipantRoleId: number
): SQLStatement | null => {
  defaultLog.debug({
    label: 'addProjectRoleByRoleIdSQL',
    message: 'params',
    projectId,
    systemUserId,
    projectParticipantRoleId
  });

  if (!projectId || !systemUserId || !projectParticipantRoleId) {
    return null;
  }

  const sqlStatement = SQL`
    INSERT INTO project_participation (
      project_id,
      system_user_id,
      project_role_id
    ) VALUES (
      ${projectId},
      ${systemUserId},
      ${projectParticipantRoleId}
    )
    RETURNING
      *;
  `;

  defaultLog.debug({
    label: 'addProjectRoleByRoleIdSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to delete a single project participation record.
 *
 * @param {number} projectParticipationId
 * @return {*}  {(SQLStatement | null)}
 */
export const deleteProjectParticipationSQL = (projectParticipationId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'deleteProjectParticipantSQL',
    message: 'params',
    projectParticipationId
  });

  if (!projectParticipationId) {
    return null;
  }

  const sqlStatement = SQL`
    DELETE FROM
      project_participation
    WHERE
      project_participation_id = ${projectParticipationId}
    RETURNING
      *;
  `;

  defaultLog.debug({
    label: 'deleteProjectParticipantSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
