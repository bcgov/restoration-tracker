import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../database/db';
import { geoJsonFeature } from '../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { ProjectService } from '../../services/project-service';
import { ProjectSearchCriteria, SearchService } from '../../services/search-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/projects/list');

export const GET: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          discriminator: 'SystemUser'
        }
      ]
    };
  }),
  getProjectList()
];

GET.apiDoc = {
  description: 'Gets a list of projects based on search parameters if passed in.',
  tags: ['projects'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'query',
      name: 'keyword',
      schema: {
        type: 'string',
        nullable: true
      },
      allowEmptyValue: true
    },
    {
      in: 'query',
      name: 'contact_agency',
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
    },
    {
      in: 'query',
      name: 'funding_agency',
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
    },
    {
      in: 'query',
      name: 'permit_number',
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
    },
    {
      in: 'query',
      name: 'species',
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
    },
    {
      in: 'query',
      name: 'start_date',
      schema: {
        type: 'string',
        oneOf: [{ format: 'date' }, { format: 'date-time' }],
        description: 'ISO 8601 date string',
        nullable: true
      },
      allowEmptyValue: true
    },
    {
      in: 'query',
      name: 'end_date',
      schema: {
        type: 'string',
        oneOf: [{ format: 'date' }, { format: 'date-time' }],
        description: 'ISO 8601 date string',
        nullable: true
      },
      allowEmptyValue: true
    },
    {
      in: 'query',
      name: 'ranges',
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
    },
    {
      in: 'query',
      name: 'region',
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
      description: 'Project response object.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
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
                  type: 'object',
                  properties: {
                    contacts: {
                      type: 'array',
                      items: {
                        title: 'Project contact',
                        type: 'object',
                        required: ['first_name', 'last_name', 'email_address', 'agency', 'is_public'],
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
                            type: 'string'
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
                        required: [
                          'agency_id',
                          'funding_amount',
                          'investment_action_category',
                          'start_date',
                          'end_date'
                        ],
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
                  properties: {
                    geometry: {
                      type: 'array',
                      items: {
                        ...(geoJsonFeature as object)
                      }
                    },
                    range: {
                      type: 'number',
                      nullable: true
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
 * Get all projects (potentially based on filter criteria).
 *
 * @returns {RequestHandler}
 */
export function getProjectList(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    const searchCriteria: ProjectSearchCriteria = req.query || {};

    try {
      await connection.open();

      const searchService = new SearchService(connection);

      // Fetch all projectIds that match the search criteria
      const projectIdsResponse = await searchService.findProjectIdsByCriteria(searchCriteria);

      const projectIds = projectIdsResponse.map((item) => item.project_id);

      const projectService = new ProjectService(connection);

      // Get all projects data for the projectIds
      const projects = await projectService.getProjectsByIds(projectIds);

      await connection.commit();

      return res.status(200).json(projects);
    } catch (error) {
      defaultLog.error({ label: 'getProjectList', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
