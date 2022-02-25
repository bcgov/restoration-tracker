import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/custom-error';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { AttachmentService } from '../../../../services/attachment-service';
import { scanFileForVirus } from '../../../../utils/file-utils';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/attachments/upload');

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
  uploadAttachment()
];
POST.apiDoc = {
  description: 'Upload a project-specific attachment.',
  tags: ['attachment'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      required: true
    }
  ],
  requestBody: {
    description: 'Attachment upload post request object.',
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          required: ['media'],
          properties: {
            media: {
              type: 'string',
              format: 'binary'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Attachment upload response.',
      content: {
        'application/json': {
          schema: {
            title: 'Attachment Response Object',
            type: 'object',
            required: ['id'],
            properties: {
              id: {
                type: 'number'
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

/**
 * Uploads any media in the request to S3, adding their keys to the request.
 * Also adds the metadata to the project_attachment DB table
 * Does nothing if no media is present in the request.
 *
 *
 * @returns {RequestHandler}
 */
export function uploadAttachment(): RequestHandler {
  return async (req, res) => {
    if (!req.params.projectId) throw new HTTP400('Missing projectId');
    if (!req.files || !req.files.length) throw new HTTP400('Missing upload data');
    if (!req.body) throw new HTTP400('Missing request body');

    const projectId = Number(req.params.projectId);
    const rawMediaFile: Express.Multer.File = req.files[0];
    const metadata = {
      filename: rawMediaFile.originalname,
      username: (req['auth_payload'] && req['auth_payload'].preferred_username) || '',
      email: (req['auth_payload'] && req['auth_payload'].email) || ''
    };
    const connection = getDBConnection(req['keycloak_token']);

    if (!(await scanFileForVirus(rawMediaFile))) throw new HTTP400('Malicious content detected, upload cancelled');

    defaultLog.debug({
      label: 'uploadMedia',
      message: 'file',
      file: { ...rawMediaFile, buffer: 'Too big to print' }
    });

    try {
      await connection.open();

      const attachmentService = new AttachmentService(connection);

      const uploadResponse = await attachmentService.uploadMedia(projectId, rawMediaFile, metadata);

      await connection.commit();

      return res.status(200).json(uploadResponse);
    } catch (error) {
      defaultLog.error({ label: 'uploadMedia', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
