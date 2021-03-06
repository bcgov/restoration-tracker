import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/custom-error';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { UserService } from '../../../../../services/user-service';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('paths/user/{userId}/projects/get');

export const GET: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getAllUserProjects()
];

GET.apiDoc = {
  description: 'Gets a list of projects based on user Id.',
  tags: ['projects'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'userId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Projects response object for given user.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              title: 'Project Get Response Object',
              type: 'object',
              properties: {
                project_id: {
                  type: 'number'
                },
                name: {
                  type: 'string'
                },
                system_user_id: {
                  type: 'number'
                },
                project_role_id: {
                  type: 'number'
                },
                project_role_name: {
                  type: 'string'
                },
                project_participation_id: {
                  type: 'number'
                }
              }
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

/**
 * Get all projects (potentially based on filter criteria).
 *
 * @returns {RequestHandler}
 */
export function getAllUserProjects(): RequestHandler {
  return async (req, res) => {
    if (!req.params.userId) {
      throw new HTTP400('Missing required param: userId');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const userId = Number(req.params.userId);

      await connection.open();

      const userService = new UserService(connection);

      const result = await userService.getUserProjectParticipation(userId);

      await connection.commit();

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getAllUserProjects', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
