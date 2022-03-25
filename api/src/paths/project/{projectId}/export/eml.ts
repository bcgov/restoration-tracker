import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import xml2js from 'xml2js';
import { getDBConnection } from '../../../../database/db';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { EmlService } from '../../../../services/eml-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/export/eml');

export const GET: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          discriminator: 'SystemUser'
        }
      ]
    };
  }),
  getProjectEml()
];

GET.apiDoc = {
  description: 'Produces an Ecological Metadata Language (EML) extract for a target data package.',
  tags: ['eml', 'dwc'],
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
            title: 'Draft Get Response Object'
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
    defaultLog.debug({ label: 'getProjectEml', message: 'params', files: req.body });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const projectId = Number(req.params.projectId);

      await connection.open();

      const emlService = new EmlService({ projectId: projectId }, connection);

      const jsonResponse = await emlService.buildProjectEml();

      const xml2jsBuilder = new xml2js.Builder();

      const xmlResponse = xml2jsBuilder.buildObject(jsonResponse);

      await connection.commit();

      res.attachment(`project_${projectId}_eml.xml`);
      res.type('xml');

      return res.status(200).send(xmlResponse);
    } catch (error) {
      defaultLog.error({ label: 'getProjectEml', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
