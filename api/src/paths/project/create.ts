import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { PostProjectObject } from '../../models/project-create';
import { geoJsonFeature } from '../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { ProjectService } from '../../services/project-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/project/create');

export const POST: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.PROJECT_CREATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  createProject()
];

POST.apiDoc = {
  description: 'Create a new Project.',
  tags: ['project'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Project post request object.',
    content: {
      'application/json': {
        schema: {
          title: 'Project post request object',
          type: 'object',
          required: ['project', 'iucn', 'contact', 'permit', 'funding', 'partnerships', 'location'],
          additionalProperties: false,
          properties: {
            project: {
              title: 'Project general information',
              type: 'object',
              properties: {
                project_name: {
                  type: 'string'
                },
                start_date: {
                  type: 'string',
                  description: 'ISO 8601 date string'
                },
                end_date: {
                  type: 'string',
                  description: 'ISO 8601 date string'
                },
                objectives: {
                  type: 'string'
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
              title: 'Project IUCN classifications',
              type: 'object',
              required: ['classificationDetails'],
              additionalProperties: false,
              properties: {
                classificationDetails: {
                  type: 'array',
                  items: {
                    title: 'IUCN classification',
                    type: 'object',
                    required: ['classification', 'subClassification1', 'subClassification2'],
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
              title: 'Project permits',
              type: 'object',
              required: ['permits'],
              additionalProperties: false,
              properties: {
                permits: {
                  type: 'array',
                  required: ['permit_number', 'permit_type'],
                  items: {
                    title: 'Project permit',
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
              title: 'Project funding sources',
              type: 'object',
              required: ['fundingSources'],
              additionalProperties: false,
              properties: {
                fundingSources: {
                  type: 'array',
                  items: {
                    title: 'Project funding agency',
                    type: 'object',
                    required: ['agency_id', 'funding_amount', 'start_date', 'end_date'],
                    properties: {
                      agency_id: {
                        type: 'number'
                      },
                      investment_action_category: {
                        type: 'number'
                      },
                      agency_project_id: {
                        type: 'string'
                      },
                      funding_amount: {
                        type: 'number'
                      },
                      start_date: {
                        type: 'string',
                        description: 'ISO 8601 date string'
                      },
                      end_date: {
                        type: 'string',
                        description: 'ISO 8601 date string'
                      }
                    }
                  }
                }
              }
            },
            partnerships: {
              title: 'Project partnerships',
              type: 'object',
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
              title: 'Location',
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
                  type: 'number'
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
      description: 'Project response object.',
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

/**
 * Creates a new project record.
 *
 * @returns {RequestHandler}
 */
export function createProject(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    const sanitizedProjectPostData = new PostProjectObject(req.body);

    try {
      await connection.open();

      const projectService = new ProjectService(connection);

      const projectId = await projectService.createProject(sanitizedProjectPostData);

      await connection.commit();

      return res.status(200).json({ id: projectId });
    } catch (error) {
      defaultLog.error({ label: 'createProject', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
