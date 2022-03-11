import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/custom-error';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { TreatmentService } from '../../../../../../services/treatment-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/treatments/{year}/delete');

export const DELETE: Operation = [
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
  deleteTreatmentsByYear()
];
DELETE.apiDoc = {
  description: 'Delete a treatments for specified year.',
  tags: ['treatment'],
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
    },
    {
      in: 'path',
      name: 'year',
      required: true
    }
  ],
  requestBody: {
    description: 'Treatment delete post request object.',
    content: {
      'application/json': {
        schema: {
          type: 'object'
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Treatment delete OK.'
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
 * Delete specified treatment unit.
 * Also deletes the metadata related to treatment unit.
 *
 *
 * @returns {RequestHandler}
 */
export function deleteTreatmentsByYear(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Delete treatments by year', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing projectId');
    }
    if (!req.params.year) {
      throw new HTTP400('Missing year');
    }

    const projectId = Number(req.params.projectId);
    const year = Number(req.params.year);
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const treatmentService = new TreatmentService(connection);

      await treatmentService.deleteTreatmentsByYear(projectId, year);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteTreatmentUnit', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
