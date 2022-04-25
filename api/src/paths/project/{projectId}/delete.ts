import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { HTTP400 } from '../../../errors/custom-error';
import { queries } from '../../../queries/queries';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { AttachmentService } from '../../../services/attachment-service';
import { AuthorizationService } from '../../../services/authorization-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/delete');

export const DELETE: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        },
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  deleteProject()
];

DELETE.apiDoc = {
  description: 'Delete a project.',
  tags: ['project'],
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
      description: 'Boolean true value representing successful deletion.',
      content: {
        'application/json': {
          schema: {
            title: 'Project delete response',
            type: 'boolean'
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

export function deleteProject(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Delete project', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param: `projectId`');
    }

    const projectId = Number(req.params.projectId);
    const connection = getDBConnection(req['keycloak_token']);

    try {
      /**
       * PART 1
       * Check that user is a system administrator - can delete a project (published or not)
       * Check that user is a project administrator - can delete a project (unpublished only)
       *
       */
      const getProjectSQLStatement = queries.project.getProjectSQL(projectId);

      if (!getProjectSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const projectData = await connection.query(getProjectSQLStatement.text, getProjectSQLStatement.values);

      const projectResult = (projectData && projectData.rows && projectData.rows[0]) || null;

      if (!projectResult) {
        throw new HTTP400('Failed to get the project');
      }

      if (
        projectResult.publish_date &&
        !AuthorizationService.userHasValidRole([SYSTEM_ROLE.SYSTEM_ADMIN], req['system_user']['role_names'])
      ) {
        throw new HTTP400('Cannot delete a published project if you are not a system administrator.');
      }

      /**
       * PART 2
       * Delete all the project related and all associated records/resources from S3
       */
      await new AttachmentService(connection).deleteAllS3Attachments(projectId);

      /**
       * PART 3
       * Delete the project and all associated records/resources from our DB
       */
      const deleteProjectSQLStatement = queries.project.deleteProjectSQL(projectId);

      if (!deleteProjectSQLStatement) {
        throw new HTTP400('Failed to build SQL delete statement');
      }

      await connection.query(deleteProjectSQLStatement.text, deleteProjectSQLStatement.values);

      await connection.commit();

      return res.status(200).json(true);
    } catch (error) {
      defaultLog.error({ label: 'deleteProject', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
