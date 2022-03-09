import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/custom-error';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { TreatmentService } from '../../../../services/treatment-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/treatments/list');

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
  getTreatments()
];

GET.apiDoc = {
  description: 'Fetches a list of treatments of a project.',
  tags: ['treatments'],
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
            type: 'object',
            properties: {
              treatmentsList: {
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

export function getTreatments(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Get treatment list', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    const projectId = Number(req.params.projectId);
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();



      const treatmentService = new TreatmentService(connection);

      const data = await treatmentService.getTreatments(projectId);

      await connection.commit();

      return res.status(200).json(data);
    } catch (error) {
      defaultLog.error({ label: 'getProjectTreatments', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
