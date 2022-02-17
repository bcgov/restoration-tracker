import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { geoJsonFeature } from '../../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
import { ProjectService } from '../../../services/project-service';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/view');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR, PROJECT_ROLE.PROJECT_VIEWER],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  viewProject()
];

GET.apiDoc = {
  description: 'Get a project, for view-only purposes.',
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
      description: 'Project with matching projectId.',
      content: {
        'application/json': {
          schema: {
            title: 'Project get response object, for view purposes',
            type: 'object',
            required: ['project', 'species', 'permit', 'contact', 'location', 'iucn', 'funding', 'partnerships'],
            properties: {
              project: {
                description: 'Basic project metadata',
                type: 'object',
                required: ['project_id', 'project_name', 'start_date', 'end_date', 'publish_date'],
                properties: {
                  id: {
                    description: 'Project id',
                    type: 'number'
                  },
                  project_name: {
                    type: 'string'
                  },
                  start_date: {
                    oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                    description: 'ISO 8601 date string for the project start date'
                  },
                  end_date: {
                    oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                    description: 'ISO 8601 date string for the project end date',
                    nullable: true
                  },
                  objectives: {
                    type: 'string'
                  },
                  publish_date: {
                    oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                    description: 'Status of the project being published/unpublished',
                    nullable: true
                  },
                  revision_count: {
                    type: 'number'
                  }
                }
              },
              species: {
                description: 'The project species',
                type: 'object',
                required: ['focal_species', 'focal_species_names'],
                properties: {
                  focal_species: {
                    type: 'array',
                    items: {
                      type: 'number'
                    }
                  },
                  focal_species_names: {
                    type: 'array',
                    items: {
                      type: 'string'
                    }
                  }
                }
              },
              iucn: {
                description: 'The International Union for Conservation of Nature number',
                type: 'object',
                required: ['classificationDetails'],
                properties: {
                  classificationDetails: {
                    type: 'array',
                    items: {
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
                          oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
                          description: 'ISO 8601 date string for the funding start date'
                        },
                        end_date: {
                          oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }],
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
 * Get a project by its id.
 *
 * @returns {RequestHandler}
 */
export function viewProject(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const projectService = new ProjectService(connection);

      const result = await projectService.getProjectById(Number(req.params.projectId), false);

      await connection.commit();

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'viewProject', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
