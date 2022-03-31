import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getAPIUserDBConnection } from '../../../../database/db';
import { EmlService } from '../../../../services/eml-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/export/eml');

export const GET: Operation = [getProjectEml()];

GET.apiDoc = {
  description: 'Produces an Ecological Metadata Language (EML) extract for a target data package.',
  tags: ['eml', 'dwc'],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      schema: {
        type: 'number',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Ecological Metadata Language (EML) extract production OK',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['eml'],
            properties: {
              eml: {
                type: 'string',
                description: 'Project EML data in XML format'
              }
            }
          },
          encoding: {
            eml: {
              contentType: 'application/xml; charset=utf-8'
            }
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

export function getProjectEml(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getProjectEml', message: 'params', files: req.params });

    const projectId = Number(req.params.projectId);

    const connection = getAPIUserDBConnection();

    try {
      await connection.open();

      const emlService = new EmlService({ projectId: projectId }, connection);

      const xmlData = await emlService.buildProjectEml();

      await connection.commit();

      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
      res.attachment(`project_${projectId}_eml.xml`);
      res.contentType('application/xml');

      console.log('req.params is', req.params);
      console.log('res header is:', res.header);
      console.log('res attachment is:', res.attachment);
      console.log('res content type is:', res.contentType);

      return res.status(200).send({ eml: xmlData });
    } catch (error) {
      defaultLog.error({ label: 'getProjectEml', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
