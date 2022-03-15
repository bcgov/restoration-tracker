import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/custom-error';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { AttachmentService } from '../../../../../services/attachment-service';
import { getLogger } from '../../../../../utils/logger';
import { attachmentApiDocObject } from '../../../../../utils/shared-api-docs';

const defaultLog = getLogger('/api/project/{projectId}/attachments/{attachmentId}/delete');

export const DELETE: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        },
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR],
          projectId: Number(req.params.projectId),
          attachmentId: Number(req.params.attachmentId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  deleteAttachment()
];

DELETE.apiDoc = {
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
  responses: {
    200: {
      description: 'Delete project attachment OK'
    },
    400: {
      $ref: '#/components/responses/400'
    },
    401: {
      $ref: '#/components/responses/401'
    },
    403: {
      $ref: '#/components/responses/401'
    },
    500: {
      $ref: '#/components/responses/500'
    },
    default: {
      $ref: '#/components/responses/default'
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

    const projectId = Number(req.params.projectId);
    const attachmentId = Number(req.params.attachmentId);
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const attachmentService = new AttachmentService(connection);

      await attachmentService.deleteAttachment(projectId, attachmentId);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteAttachment', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
