import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../../../database/db';
import { geoJsonFeature } from '../../../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { ProjectService } from '../../../../services/project-service';
import { SearchService } from '../../../../services/search-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/user/{userId}/projects/get');
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
  getUserProjectsList()
];

GET.apiDoc = {
  description: 'Gets a list of projects based on user Id.',
  tags: ['projects'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'userId',
      schema: {
        type: 'number'
      },
      required: true
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
              required: ['project', 'permit', 'contact', 'location', 'iucn', 'funding', 'partnerships'],
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
 * Get all projects that a user is a participant (member) of.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function getUserProjectsList(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const searchService = new SearchService(connection);

      const projectIdsResponse = await searchService.findProjectIdsByProjectParticipation(connection.systemUserId());

      const projectIds = projectIdsResponse.map((item) => item.project_id);

      const projectService = new ProjectService(connection);

      const projects = await projectService.getProjectsByIds(projectIds);

      await connection.commit();

      return res.status(200).json(projects);
    } catch (error) {
      defaultLog.error({ label: 'getAllUserProjects', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
