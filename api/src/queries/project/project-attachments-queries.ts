import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/project/project-attachments-queries');

/**
 * SQL query to get attachments for a single project.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getProjectAttachmentsSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getProjectAttachmentsSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      project_attachment_id as id,
      file_name,
      update_date,
      create_date,
      file_size,
      key,
      security_token
    from
      project_attachment
    where
      project_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getProjectAttachmentsSQL',
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
export const deleteProjectAttachmentSQL = (attachmentId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'deleteProjectAttachmentSQL', message: 'params', attachmentId });

  if (!attachmentId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE
      from project_attachment
    WHERE
      project_attachment_id = ${attachmentId}
    RETURNING
      key;
  `;

  defaultLog.debug({
    label: 'deleteProjectAttachmentSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get S3 key of an attachment for a single project.
 *
 * @param {number} projectId
 * @param {number} attachmentId
 * @returns {SQLStatement} sql query object
 */
export const getProjectAttachmentS3KeySQL = (projectId: number, attachmentId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getProjectAttachmentS3KeySQL', message: 'params', projectId });

  if (!projectId || !attachmentId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      key
    FROM
      project_attachment
    WHERE
      project_id = ${projectId}
    AND
      project_attachment_id = ${attachmentId};
  `;

  defaultLog.debug({
    label: 'getProjectAttachmentS3KeySQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert a project attachment row.
 *
 * @param fileName
 * @param fileSize
 * @param projectId
 * @param {string} key to use in s3
 * @returns {SQLStatement} sql query object
 */
export const postProjectAttachmentSQL = (
  fileName: string,
  fileSize: number,
  projectId: number,
  key: string
): SQLStatement | null => {
  defaultLog.debug({
    label: 'postProjectAttachmentSQL',
    message: 'params',
    fileName,
    fileSize,
    projectId,
    key
  });

  if (!fileName || !fileSize || !projectId || !key) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO project_attachment (
      project_id,
      file_name,
      file_size,
      title,
      key
    ) VALUES (
      ${projectId},
      ${fileName},
      ${fileSize},
      ${fileName},
      ${key}
    )
    RETURNING
      project_attachment_id as id,
      revision_count;
  `;

  defaultLog.debug({
    label: 'postProjectAttachmentSQL',
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
export const getProjectAttachmentByFileNameSQL = (projectId: number, fileName: string): SQLStatement | null => {
  defaultLog.debug({ label: 'getProjectAttachmentByFileNameSQL', message: 'params', projectId });

  if (!projectId || !fileName) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      project_attachment_id as id,
      file_name,
      update_date,
      create_date,
      file_size
    from
      project_attachment
    where
      project_id = ${projectId}
    and
      file_name = ${fileName};
  `;

  defaultLog.debug({
    label: 'getProjectAttachmentByFileNameSQL',
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
export const putProjectAttachmentSQL = (projectId: number, fileName: string): SQLStatement | null => {
  defaultLog.debug({ label: 'putProjectAttachmentSQL', message: 'params', projectId, fileName });

  if (!projectId || !fileName) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    UPDATE
      project_attachment
    SET
      file_name = ${fileName}
    WHERE
      file_name = ${fileName}
    AND
      project_id = ${projectId}
    RETURNING
      project_attachment_id as id,
      revision_count;
  `;

  defaultLog.debug({
    label: 'putProjectAttachmentSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};