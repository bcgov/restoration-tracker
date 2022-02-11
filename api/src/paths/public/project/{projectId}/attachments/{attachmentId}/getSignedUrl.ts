import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { APIKnexDBConnection, KnexDBConnection } from '../../../../../../database/knex-db';
import { HTTP400 } from '../../../../../../errors/custom-error';
import { queries } from '../../../../../../queries/queries';
import { getS3SignedURL } from '../../../../../../utils/file-utils';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('/api/public/project/{projectId}/attachments/{attachmentId}/getSignedUrl');

export const GET: Operation = [getAttachmentSignedURL()];

GET.apiDoc = {
  description: 'Retrieves the signed url of a public project attachment.',
  tags: ['attachment'],
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
      description: 'Response containing the signed url of an attachment.',
      content: {
        'text/plain': {
          schema: {
            type: 'number'
          }
        }
      }
    },
    400: {
      $ref: '#/components/responses/400'
    },
    401: {
      $ref: '#/components/responses/401'
    },
    403: {
      $ref: '#/components/responses/403'
    },
    500: {
      $ref: '#/components/responses/500'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function getAttachmentSignedURL(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({
      label: 'getAttachmentSignedURL',
      message: 'params',
      req_params: req.params,
      req_query: req.query
    });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    if (!req.params.attachmentId) {
      throw new HTTP400('Missing required path param `attachmentId`');
    }

    const connection = new APIKnexDBConnection();

    await connection.open();

    try {
      await connection.open();

      const s3Key = await getPublicProjectAttachmentS3Key(
        Number(req.params.projectId),
        Number(req.params.attachmentId),
        connection
      );

      await connection.commit();

      const s3SignedUrl = s3Key && (await getS3SignedURL(s3Key));

      if (!s3SignedUrl) {
        return res.status(200).json(null);
      }

      return res.status(200).json(s3SignedUrl);
    } catch (error) {
      defaultLog.error({ label: 'getAttachmentSignedURL', message: 'error', error });
      await connection.rollback();
      throw error;
    }
  };
}

export const getPublicProjectAttachmentS3Key = async (
  projectId: number,
  attachmentId: number,
  connection: KnexDBConnection
): Promise<string> => {
  const sqlStatement = queries.public.getPublicProjectAttachmentS3KeySQL(projectId, attachmentId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build attachment S3 key SQLstatement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response?.rows?.[0]) {
    throw new HTTP400('Failed to get attachment S3 key');
  }

  return response.rows[0].key;
};
