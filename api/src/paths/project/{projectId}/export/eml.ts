import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { AuthorizationService } from '../../../../services/authorization-service';
import { EmlService } from '../../../../services/eml-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/export/eml');

export const GET: Operation = [getProjectEml()];

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

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const authorizationService = new AuthorizationService(connection);

      const isAuthorizedForSensitiveEMLData = await authorizationService.executeAuthorizationScheme({
        or: [
          {
            validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
            discriminator: 'SystemRole'
          },
          {
            validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR, PROJECT_ROLE.PROJECT_VIEWER],
            projectId: projectId,
            discriminator: 'ProjectRole'
          }
        ]
      });

      const emlService = new EmlService({ projectId: projectId }, connection);

      const xmlData = await emlService.buildProjectEml(isAuthorizedForSensitiveEMLData);

      await connection.commit();

      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
      res.attachment(`project_${projectId}_eml.xml`);
      res.contentType('application/xml');

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
