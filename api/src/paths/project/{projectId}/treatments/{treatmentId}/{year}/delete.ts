import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/custom-error';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { TreatmentService } from '../../../../../../services/treatment-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/treatments/{treatmentId}/delete');

export const DELETE: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR],
          projectId: Number(req.params.projectId),
          treatmentId: Number(req.params.treatmentId),
          year: Number(req.params.year),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  deleteTreatmentSpatial()
];
DELETE.apiDoc = {
  description: 'Delete a project-specific treatment spatial file.',
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
    },
    {
      in: 'path',
      name: 'treatmentId',
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
 * Delete specified treatment layer media file from S3.
 * Also deletes the metadata from DB table
 *
 *
 * @returns {RequestHandler}
 */
export function deleteTreatmentSpatial(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Delete treatment spatial layer', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing projectId');
    }
    if (!req.params.treatmentId) {
      throw new HTTP400('Missing treatmentId');
    }
    if (!req.params.year) {
      throw new HTTP400('Missing year');
    }

    const projectId = Number(req.params.projectId);
    const treatmentUnitId = Number(req.params.treatmentId);
    const year = Number(req.params.year);
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const attachmentService = new TreatmentService(connection);

      await attachmentService.deleteTreatments(projectId, treatmentUnitId, year);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteAttachment', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
