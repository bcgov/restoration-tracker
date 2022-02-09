import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { HTTP400 } from '../../../errors/custom-error';
import { geoJsonFeature } from '../../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { ProjectService } from '../../../services/project-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/update');

export const PUT: Operation = [
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
  updateProject()
];

PUT.apiDoc = {
  description: 'Update a project.',
  tags: ['project'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Project put request object.',
    content: {
      'application/json': {
        schema: {
          title: 'Project Put Object',
          required: ['project', 'iucn', 'coordinator', 'permit', 'funding', 'partnerships', 'location'],
          type: 'object',
          additionalProperties: false,
          properties: {
            project: {
              type: 'object',
              required: ['project_name', 'start_date', 'end_date', 'objectives'],
              properties: {
                project_name: {
                  type: 'string'
                },
                start_date: {
                  type: 'string',
                  oneOf: [{ format: 'date' }, { format: 'date-time' }],
                  description: 'ISO 8601 date string for the project start date'
                },
                end_date: {
                  type: 'string',
                  oneOf: [{ format: 'date' }, { format: 'date-time' }, { nullable: true }],
                  description: 'ISO 8601 date string for the project end date'
                },
                objectives: {
                  type: 'string'
                },
                revision_count: {
                  type: 'number'
                }
              }
            },
            iucn: {
              type: 'object',
              required: ['classificationDetails'],
              additionalProperties: false,
              properties: {
                classificationDetails: {
                  type: 'array',
                  items: {
                    title: 'IUCN classification',
                    required: ['classification', 'subClassification1', 'subClassification2'],
                    type: 'object',
                    properties: {
                      classification: {
                        type: 'number'
                      },
                      subClassification1: {
                        type: 'number'
                      },
                      subClassification2: {
                        type: 'number'
                      }
                    }
                  }
                }
              }
            },
            coordinator: {
              type: 'object',
              required: [
                'first_name',
                'last_name',
                'email_address',
                'coordinator_agency',
                'share_contact_details',
                'revision_count'
              ],
              properties: {
                first_name: {
                  type: 'string'
                },
                last_name: {
                  type: 'string'
                },
                email_address: {
                  type: 'string'
                },
                coordinator_agency: {
                  type: 'string'
                },
                share_contact_details: {
                  type: 'string'
                },
                revision_count: {
                  type: 'number'
                }
              }
            },
            permit: {
              type: 'object',
              required: ['permits'],
              additionalProperties: false,
              properties: {
                permits: {
                  type: 'array',
                  items: {
                    title: 'Project permit',
                    required: ['permit_number', 'permit_type'],
                    type: 'object',
                    properties: {
                      permit_number: {
                        type: 'string'
                      },
                      permit_type: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            },
            funding: {
              description: 'The project funding details',
              type: 'object',
              required: ['fundingSources'],
              additionalProperties: false,
              properties: {
                fundingSources: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: [], // TODO double check which fields are required
                    properties: {
                      id: {
                        type: 'number'
                      },
                      agency_id: {
                        type: 'number'
                      },
                      investment_action_category: {
                        type: 'number'
                      },
                      investment_action_category_name: {
                        type: 'string'
                      },
                      agency_name: {
                        type: 'string'
                      },
                      funding_amount: {
                        type: 'number'
                      },
                      start_date: {
                        type: 'string',
                        oneOf: [{ format: 'date' }, { format: 'date-time' }],
                        description: 'ISO 8601 date string for the funding start date'
                      },
                      end_date: {
                        type: 'string',
                        oneOf: [{ format: 'date' }, { format: 'date-time' }],
                        description: 'ISO 8601 date string for the funding end_date'
                      },
                      agency_project_id: {
                        type: 'string'
                      },
                      revision_count: {
                        type: 'number'
                      }
                    }
                  }
                }
              }
            },
            partnerships: {
              description: 'The project partners',
              type: 'object',
              required: ['indigenous_partnerships', 'stakeholder_partnerships'],
              additionalProperties: false,
              properties: {
                indigenous_partnerships: {
                  type: 'array',
                  items: {
                    type: 'number'
                  }
                },
                stakeholder_partnerships: {
                  type: 'array',
                  items: {
                    type: 'string'
                  }
                }
              }
            },
            location: {
              description: 'The project location object',
              type: 'object',
              required: ['geometry'],
              properties: {
                geometry: {
                  type: 'array',
                  items: {
                    ...(geoJsonFeature as object)
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Project with matching projectId.',
      content: {
        'application/json': {
          schema: {
            title: 'Project Response Object',
            type: 'object',
            required: ['id'],
            properties: {
              id: {
                type: 'number'
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

export interface IUpdateProject {
  coordinator: object | null;
  permit: object | null;
  project: object | null;
  location: object | null;
  iucn: object | null;
  funding: object | null;
  partnerships: object | null;
}

/**
 * Update a project.
 *
 * @returns {RequestHandler}
 */
export function updateProject(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const projectId = Number(req.params?.projectId);

      const entities: IUpdateProject = req.body;

      if (!projectId) {
        throw new HTTP400('Missing required path parameter: projectId');
      }

      if (!entities) {
        throw new HTTP400('Missing required request body');
      }

      await connection.open();

      const projectService = new ProjectService(connection);

      await projectService.updateProject(projectId, entities);

      await connection.commit();

      return res.status(200).json({ id: projectId });
    } catch (error) {
      defaultLog.error({ label: 'updateProject', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
