import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/custom-error';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { TreatmentService } from '../../../../services/treatment-service';
import { generateS3FileKey, scanFileForVirus, uploadFileToS3 } from '../../../../utils/file-utils';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/treatments/upload');

export const POST: Operation = [
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
  uploadTreatmentSpatial()
];
POST.apiDoc = {
  description: 'Upload a project-specific treatment spatial file.',
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
    }
  ],
  requestBody: {
    description: 'Treatment upload post request object.',
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          required: ['media'],
          properties: {
            media: {
              type: 'string',
              format: 'binary'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Treatment upload response.',
      content: {
        'application/json': {
          schema: {
            title: 'Treatment Response Object',
            type: 'object',
            required: ['unitIds'],
            properties: {
              unitIds: {
                type: 'array',
                items: {
                  type: 'number'
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

/**
 * Uploads any treatment shape file to the db
 * Does nothing if no media is present in the request.
 *
 *
 * @returns {RequestHandler}
 */
export function uploadTreatmentSpatial(): RequestHandler {
  return async (req, res) => {
    if (!req.params.projectId) {
      throw new HTTP400('Missing projectId');
    }
    if (!req.files || !req.files.length) {
      throw new HTTP400('Missing upload data');
    }
    if (!req.body) {
      throw new HTTP400('Missing request body');
    }

    const projectId = Number(req.params.projectId);
    const rawMediaFile: Express.Multer.File = req.files[0];

    const connection = getDBConnection(req['keycloak_token']);

    if (!(await scanFileForVirus(rawMediaFile))) {
      throw new HTTP400('Malicious content detected, upload cancelled');
    }

    defaultLog.debug({
      label: 'uploadTreatmentSpatial',
      message: 'file',
      file: { ...rawMediaFile, buffer: 'Too big to print' }
    });

    try {
      await connection.open();

      const treatmentService = new TreatmentService(connection);

      const shapeFileFeatures = await treatmentService.handleShapeFileFeatures(rawMediaFile);

      if (!shapeFileFeatures) {
        return;
      }

      const checkFeaturePropertiesValid = treatmentService.validateAllTreatmentUnitProperties(shapeFileFeatures);

      if (checkFeaturePropertiesValid.length >= 1) {
        defaultLog.error({ label: 'uploadTreatmentSpatial', message: 'error', checkFeaturePropertiesValid });
        return res.status(400).json(checkFeaturePropertiesValid);
      }

      const responsePostProjectAllTreatments = await treatmentService.insertAllProjectTreatmentUnits(
        projectId,
        shapeFileFeatures
      );

      //upload to s3
      const metadata = {
        filename: rawMediaFile.originalname,
        username: (req['auth_payload'] && req['auth_payload'].preferred_username) || '',
        email: (req['auth_payload'] && req['auth_payload'].email) || ''
      };

      const key = generateS3FileKey({ projectId: projectId, fileName: rawMediaFile.originalname });

      await uploadFileToS3(rawMediaFile, key, metadata);

      await connection.commit();

      return res.status(200).json({ unitIds: responsePostProjectAllTreatments });
    } catch (error) {
      defaultLog.error({ label: 'uploadTreatmentSpatial', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
