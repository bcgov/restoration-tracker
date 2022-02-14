import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { geoJsonFeature } from '../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { AuthorizationService } from '../../services/authorization-service';
import { ProjectService } from '../../services/project-service';
import { ProjectSearchCriteria, SearchService } from '../../services/search-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/projects');

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
            type: 'number',
            nullable: true
          },
          {
            type: 'array',
            items: {
              type: 'number'
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
              required: ['project', 'permit', 'coordinator', 'location', 'iucn', 'funding', 'partnerships'],
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
                coordinator: {
                  title: 'Project coordinator',
                  type: 'object',
                  required: ['first_name', 'last_name', 'email_address', 'coordinator_agency', 'share_contact_details'],
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
                      type: 'string',
                      enum: ['true', 'false']
                    },
                    revision_count: {
                      type: 'number'
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

      let projectIds = projectIdsResponse.map((item) => item.project_id);

      const authorizationService = new AuthorizationService(connection, { systemUser: req['system_user'] });

      // Check if the user has system level access to all matching projects
      const hasSystemLevelAccess = await authorizationService.executeAuthorizationScheme({
        and: [
          {
            validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
            discriminator: 'SystemRole'
          }
        ]
      });

      if (!hasSystemLevelAccess) {
        // User does not have system level access to all matching projects
        // Determine if the user is a member for each project
        const isProjectMember: boolean[] = await Promise.all(
          projectIds.map(async (projectId) => {
            return authorizationService.executeAuthorizationScheme({
              and: [
                {
                  validProjectRoles: [],
                  projectId: projectId,
                  discriminator: 'ProjectRole'
                }
              ]
            });
          })
        );

        // Filter out any projects the user is not a member of
        projectIds = projectIds.filter((projectId, index) => isProjectMember[index]);
      }

      const projectService = new ProjectService(connection);

      // Get all projects for the remaining projectIds
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
