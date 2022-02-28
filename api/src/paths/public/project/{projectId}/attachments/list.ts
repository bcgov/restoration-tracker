import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getAPIUserDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/custom-error';
import { AttachmentService } from '../../../../../services/attachment-service';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('/api/public/project/{projectId}/attachments/list');

export const GET: Operation = [getPublicProjectAttachments()];

GET.apiDoc = {
  description: 'Fetches a list of attachments of a public (published) project.',
  tags: ['attachments'],
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
            type: 'object',
            properties: {
              attachmentsList: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'number'
                    },
                    fileName: {
                      type: 'string'
                    },
                    lastModified: {
                      type: 'string'
                    },
                    size: {
                      type: 'number'
                    },
                    url: {
                      type: 'string'
                    }
                  }
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

export function getPublicProjectAttachments(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Get attachments list', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    const projectId = Number(req.params.projectId);
    const connection = getAPIUserDBConnection();

    try {
      await connection.open();

      const attachmentService = new AttachmentService(connection);

      const data = await attachmentService.getAttachments(projectId);

      await connection.commit();

      return res.status(200).json(data);
    } catch (error) {
      defaultLog.error({ label: 'getProjectAttachments', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
