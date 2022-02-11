import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../constants/roles';
import { KnexDBConnection } from '../../../../../database/knex-db';
import { HTTP400 } from '../../../../../errors/custom-error';
import { queries } from '../../../../../queries/queries';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { deleteFileFromS3 } from '../../../../../utils/file-utils';
import { getLogger } from '../../../../../utils/logger';
import { attachmentApiDocObject } from '../../../../../utils/shared-api-docs';

const defaultLog = getLogger('/api/project/{projectId}/attachments/{attachmentId}/delete');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  deleteAttachment()
];

POST.apiDoc = {
  ...attachmentApiDocObject(
    'Delete an attachment of a project.',
    'Row count of successfully deleted attachment record'
  ),
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      schema: {
        type: 'number'
      },
      required: true
    },
    {
      in: 'path',
      name: 'attachmentId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  requestBody: {
    description: 'Current attachment type for project attachment.',
    content: {
      'application/json': {
        schema: {
          type: 'object'
        }
      }
    }
  }
};

export function deleteAttachment(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Delete attachment', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    if (!req.params.attachmentId) {
      throw new HTTP400('Missing required path param `attachmentId`');
    }

    const connection = new KnexDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      // If the attachment record is currently secured, need to unsecure it prior to deleting it
      if (req.body.securityToken) {
        await unsecureProjectAttachmentRecord(req.body.securityToken, connection);
      }
      const deleteResult: { key: string } = await deleteProjectAttachment(Number(req.params.attachmentId), connection);

      await connection.commit();

      const deleteFileResult = await deleteFileFromS3(deleteResult.key);

      if (!deleteFileResult) {
        return res.status(200).json(null);
      }

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteAttachment', message: 'error', error });
      await connection.rollback();
      throw error;
    }
  };
}

const unsecureProjectAttachmentRecord = async (securityToken: any, connection: KnexDBConnection): Promise<void> => {
  const unsecureRecordSQLStatement = queries.security.unsecureAttachmentRecordSQL('project_attachment', securityToken);

  if (!unsecureRecordSQLStatement) {
    throw new HTTP400('Failed to build SQL unsecure record statement');
  }

  const unsecureRecordSQLResponse = await connection.query(
    unsecureRecordSQLStatement.text,
    unsecureRecordSQLStatement.values
  );

  if (!unsecureRecordSQLResponse || !unsecureRecordSQLResponse.rowCount) {
    throw new HTTP400('Failed to unsecure record');
  }
};

export const deleteProjectAttachment = async (
  attachmentId: number,
  connection: KnexDBConnection
): Promise<{ key: string }> => {
  const sqlStatement = queries.project.deleteProjectAttachmentSQL(attachmentId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL delete project attachment statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response.rowCount) {
    throw new HTTP400('Failed to delete project attachment record');
  }

  return response.rows[0];
};
