import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/custom-error';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { AttachmentService } from '../../../../services/attachment-service';
import { TreatmentService } from '../../../../services/treatment-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/treatments/delete');

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
  deleteTreatments()
];
DELETE.apiDoc = {
  description: 'Delete all treatments for specified project.',
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
    }
  ],
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
 * Delete all treatment units from project.
 * Also deletes the metadata related to treatment unit.
 *
 *
 * @returns {RequestHandler}
 */
export function deleteTreatments(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Delete treatments ', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing projectId');
    }

    const projectId = Number(req.params.projectId);
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const treatmentService = new TreatmentService(connection);

      await treatmentService.deleteTreatments(projectId);

      const attachmentService = new AttachmentService(connection);

      await attachmentService.deleteAttachmentsByType(projectId, 'treatments');

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteTreatments', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
