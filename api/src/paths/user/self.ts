import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../database/db';
import { HTTP400 } from '../../errors/custom-error';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { UserService } from '../../services/user-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/user/{userId}');

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
  getUser()
];

GET.apiDoc = {
  description: 'Get user details for the currently authenticated user.',
  tags: ['user'],
  security: [
    {
      Bearer: []
    }
  ],
  responses: {
    200: {
      description: 'User details for the currently authenticated user.',
      content: {
        'application/json': {
          schema: {
            title: 'User Response Object',
            type: 'object',
            required: ['id', 'user_identifier', 'role_ids', 'role_names'],
            properties: {
              id: {
                description: 'user id',
                type: 'number'
              },
              user_identifier: {
                description: 'The unique user identifier',
                type: 'string'
              },
              record_end_date: {
                oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                description: 'Determines if the user record has expired',
                nullable: true
              },
              role_ids: {
                description: 'list of system role ids for the user',
                type: 'array',
                items: {
                  type: 'number'
                }
              },
              role_names: {
                description: 'list of system role names for the user',
                type: 'array',
                items: {
                  type: 'string'
                }
              },
              projects: {
                type: 'array',
                description: 'An array of projects the user is a participant (member) of',
                items: {
                  type: 'object',
                  required: [
                    'project_id',
                    'name',
                    'system_user_id',
                    'project_role_id',
                    'project_role_name',
                    'project_participation_id'
                  ],
                  properties: {
                    project_id: {
                      description: 'The project id',
                      type: 'number'
                    },
                    name: {
                      description: 'The project name',
                      type: 'string'
                    },
                    system_user_id: {
                      description: 'user id',
                      type: 'number'
                    },
                    project_role_id: {
                      description: 'The users role id for this project',
                      type: 'number'
                    },
                    project_role_name: {
                      description: 'The users role name for this project',
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
 * Get a user by its user identifier.
 *
 * @returns {RequestHandler}
 */
export function getUser(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const userId = connection.systemUserId();

      if (!userId) {
        throw new HTTP400('Failed to identify system user ID');
      }

      const userService = new UserService(connection);

      const userObject = await userService.getUserById(userId);

      if (!userObject) {
        throw new HTTP400('Failed to get system user');
      }

      const projectObjects = await userService.getUserProjectParticipation(userId);

      if (!projectObjects) {
        throw new HTTP400('Failed to get system user projects');
      }

      await connection.commit();

      return res.status(200).json({ ...userObject, projects: projectObjects });
    } catch (error) {
      defaultLog.error({ label: 'getUser', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
