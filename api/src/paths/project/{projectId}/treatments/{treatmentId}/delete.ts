import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/custom-error';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { TreatmentService } from '../../../../../services/treatment-service';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/treatments/{treatmentId}/delete');

export const DELETE: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR],
          projectId: Number(req.params.projectId),
          treatmentId: Number(req.params.treatmentId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  deleteTreatmentUnit()
];
DELETE.apiDoc = {
  description: 'Delete a project-specific treatment unit.',
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
      name: 'treatmentId',
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
      description: 'Treatment delete response.',
      content: {
        'application/json': {
          schema: {
            type: 'object'
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
 * Delete specified treatment unit.
 * Also deletes the metadata related to treatment unit.
 *
 *
 * @returns {RequestHandler}
 */
export function deleteTreatmentUnit(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Delete treatment unit', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing projectId');
    }
    if (!req.params.treatmentId) {
      throw new HTTP400('Missing treatmentId');
    }

    const projectId = Number(req.params.projectId);
    const treatmentUnitId = Number(req.params.treatmentId);
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const treatmentService = new TreatmentService(connection);

      await treatmentService.deleteTreatmentUnit(projectId, treatmentUnitId);

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
