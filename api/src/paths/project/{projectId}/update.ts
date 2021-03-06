import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../../constants/roles';
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
      or: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        },
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
          required: ['project', 'species', 'iucn', 'contact', 'permit', 'funding', 'partnerships', 'location'],
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
                  oneOf: [
                    {
                      type: 'string',
                      anyOf: [{ format: 'date' }, { format: 'date-time' }],
                      description: 'ISO 8601 date string For the project end date',
                      nullable: true
                    },
                    {
                      type: 'string',
                      enum: ['']
                    }
                  ]
                },
                objectives: {
                  type: 'string'
                },
                revision_count: {
                  type: 'number'
                }
              }
            },
            species: {
              title: 'Project species',
              type: 'object',
              required: ['focal_species'],
              properties: {
                focal_species: {
                  type: 'array',
                  items: {
                    type: 'number'
                  }
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
            contact: {
              title: 'Project contact',
              type: 'object',
              required: ['contacts'],
              additionalProperties: false,
              properties: {
                contacts: {
                  type: 'array',
                  items: {
                    title: 'contacts',
                    type: 'object',
                    required: ['first_name', 'last_name', 'email_address', 'agency', 'is_public', 'is_primary'],
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
                      agency: {
                        type: 'string'
                      },
                      is_public: {
                        type: 'string',
                        enum: ['true', 'false']
                      },
                      is_primary: {
                        type: 'string',
                        enum: ['true', 'false']
                      }
                    }
                  }
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
                    required: [
                      'agency_id',
                      'investment_action_category',
                      'agency_project_id',
                      'funding_amount',
                      'start_date',
                      'end_date'
                    ],
                    properties: {
                      agency_id: {
                        type: 'number'
                      },
                      investment_action_category: {
                        type: 'number'
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
                        type: 'string',
                        nullable: true
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
              required: ['geometry', 'region'],
              additionalProperties: false,
              properties: {
                range: {
                  type: 'number',
                  nullable: true
                },
                priority: {
                  type: 'string',
                  enum: ['true', 'false']
                },
                geometry: {
                  type: 'array',
                  items: {
                    ...(geoJsonFeature as object)
                  }
                },
                region: {
                  type: 'number',
                  nullable: true
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
  contact: object | null;
  permit: object | null;
  project: object | null;
  location: object | null;
  iucn: object | null;
  funding: object | null;
  partnerships: object | null;
  species: object | null;
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
