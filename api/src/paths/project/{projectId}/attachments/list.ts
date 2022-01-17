import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/custom-error';
import { GetAttachmentsData } from '../../../../models/project-attachments';
import { queries } from '../../../../queries/queries';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/attachments/list');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR, PROJECT_ROLE.PROJECT_VIEWER],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  getAttachments()
];

GET.apiDoc = {
  description: 'Fetches a list of attachments of a project.',
  tags: ['attachments'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Project get response file description array.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                fileName: {
                  description: 'The file name of the attachment',
                  type: 'string'
                },
                lastModified: {
                  description: 'The date the object was last modified',
                  type: 'string'
                }
              }
            }
          }
        }
      }
    },
    401: {
      $ref: '#/components/responses/401'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function getAttachments(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Get attachments list', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const getProjectAttachmentsSQLStatement = queries.project.getProjectAttachmentsSQL(Number(req.params.projectId));

      if (!getProjectAttachmentsSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const attachmentsData = await connection.query(
        getProjectAttachmentsSQLStatement.text,
        getProjectAttachmentsSQLStatement.values
      );

      await connection.commit();

      const getAttachmentsData =
        (attachmentsData && attachmentsData.rows && new GetAttachmentsData([...attachmentsData.rows])) || null;

      return res.status(200).json(getAttachmentsData);
    } catch (error) {
      defaultLog.error({ label: 'getProjectAttachments', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
