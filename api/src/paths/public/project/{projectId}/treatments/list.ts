import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getAPIUserDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/custom-error';
import { geoJsonFeature } from '../../../../../openapi/schemas/geoJson';
import { TreatmentSearchCriteria, TreatmentService } from '../../../../../services/treatment-service';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/treatments/list');

export const GET: Operation = [getPublicTreatments()];

GET.apiDoc = {
  description: 'Fetches a list of treatments of a published project.',
  tags: ['treatments'],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      schema: {
        type: 'number'
      },
      required: true
    },
    {
      in: 'query',
      name: 'year',
      schema: {
        oneOf: [
          {
            type: 'string',
            nullable: true
          },
          {
            type: 'array',
            items: {
              type: 'string'
            },
            nullable: true
          }
        ]
      },
      allowEmptyValue: true
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
              treatmentList: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      nullable: true
                    },
                    type: {
                      type: 'string',
                      nullable: true
                    },
                    width: {
                      type: 'number',
                      nullable: true
                    },
                    length: {
                      type: 'number',
                      nullable: true
                    },
                    area: {
                      type: 'number',
                      nullable: true
                    },
                    description: {
                      type: 'string',
                      nullable: true
                    },
                    comments: {
                      type: 'string',
                      nullable: true
                    },
                    geometry: {
                      ...(geoJsonFeature as object)
                    },
                    treatments: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          treatment_name: {
                            type: 'string',
                            nullable: true
                          },
                          treatment_year: {
                            type: 'string',
                            nullable: true
                          }
                        }
                      },
                      nullable: true
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

export function getPublicTreatments(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Get treatment list', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    const projectId = Number(req.params.projectId);
    const connection = getAPIUserDBConnection();

    const searchCriteria: TreatmentSearchCriteria = req.query || {};

    try {
      await connection.open();

      const treatmentService = new TreatmentService(connection);

      const data = await treatmentService.getTreatmentsByCriteria(projectId, searchCriteria);

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
