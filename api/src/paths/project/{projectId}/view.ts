import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { HTTP400 } from '../../../errors/custom-error';
import {
  GetCoordinatorData,
  GetIUCNClassificationData,
  GetLocationData,
  GetObjectivesData,
  GetPartnershipsData,
  GetPermitData,
  GetProjectData
} from '../../../models/project-view';
import { GetFundingData } from '../../../models/project-view-update';
import { geoJsonFeature } from '../../../openapi/schemas/geoJson';
import { queries } from '../../../queries/queries';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';
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
  getProjectForView()
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
            required: [
              'id',
              'project',
              'permit',
              'coordinator',
              'objectives',
              'location',
              'iucn',
              'funding',
              'partnerships'
            ],
            properties: {
              id: {
                description: 'Project id',
                type: 'number'
              },
              project: {
                description: 'Basic project metadata',
                type: 'object',
                required: [
                  'project_name',
                  'project_type',
                  'project_activities',
                  'start_date',
                  'end_date',
                  'comments',
                  'completion_status',
                  'publish_date'
                ],
                properties: {
                  project_name: {
                    type: 'string'
                  },
                  project_type: {
                    type: 'number'
                  },
                  project_activities: {
                    type: 'array',
                    items: {
                      type: 'number'
                    }
                  },
                  start_date: {
                    type: 'string',
                    format: 'date',
                    description: 'ISO 8601 date string for the project start date'
                  },
                  end_date: {
                    type: 'string',
                    format: 'date',
                    description: 'ISO 8601 date string for the project end date'
                  },
                  comments: {
                    type: 'string',
                    description: 'Comments'
                  },
                  completion_status: {
                    description: 'Status of the project being active/completed',
                    type: 'string'
                  },
                  publish_date: {
                    description: 'Status of the project being published/unpublished',
                    format: 'date',
                    type: 'string'
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
                  }
                }
              },
              objectives: {
                description: 'The project objectives and caveats',
                type: 'object',
                required: ['objectives', 'caveats'],
                properties: {
                  objectives: {
                    type: 'string'
                  },
                  caveats: {
                    type: 'string'
                  }
                }
              },
              location: {
                description: 'The project location object',
                type: 'object',
                required: ['location_description', 'geometry'],
                properties: {
                  location_description: {
                    type: 'string'
                  },
                  geometry: {
                    type: 'array',
                    items: {
                      ...(geoJsonFeature as object)
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
                          type: 'string'
                        },
                        subClassification1: {
                          type: 'string'
                        },
                        subClassification2: {
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
                          format: 'date',
                          description: 'ISO 8601 date string for the funding start date'
                        },
                        end_date: {
                          type: 'string',
                          format: 'date',
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
                      type: 'string'
                    }
                  },
                  stakeholder_partnerships: {
                    type: 'array',
                    items: {
                      type: 'string'
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
 * Get a project by its id.
 *
 * @returns {RequestHandler}
 */
export function getProjectForView(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const getProjectSQLStatement = queries.project.getProjectSQL(Number(req.params.projectId));
      const getProjectPermitsSQLStatement = queries.project.getProjectPermitsSQL(Number(req.params.projectId));
      const getProjectLocationSQLStatement = queries.project.getLocationByProjectSQL(Number(req.params.projectId));
      const getProjectActivitiesSQLStatement = queries.project.getActivitiesByProjectSQL(Number(req.params.projectId));
      const getProjectIUCNActionClassificationSQLStatement = queries.project.getIUCNActionClassificationByProjectSQL(
        Number(req.params.projectId)
      );
      const getProjectFundingSourceSQLStatement = queries.project.getFundingSourceByProjectSQL(
        Number(req.params.projectId)
      );
      const getProjectIndigenousPartnershipsSQLStatement = queries.project.getIndigenousPartnershipsByProjectSQL(
        Number(req.params.projectId)
      );
      const getProjectStakeholderPartnershipsSQLStatement = queries.project.getStakeholderPartnershipsByProjectSQL(
        Number(req.params.projectId)
      );

      if (
        !getProjectSQLStatement ||
        !getProjectPermitsSQLStatement ||
        !getProjectLocationSQLStatement ||
        !getProjectActivitiesSQLStatement ||
        !getProjectIUCNActionClassificationSQLStatement ||
        !getProjectFundingSourceSQLStatement ||
        !getProjectIndigenousPartnershipsSQLStatement ||
        !getProjectStakeholderPartnershipsSQLStatement
      ) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const [
        projectData,
        permitData,
        locationData,
        activityData,
        iucnClassificationData,
        fundingData,
        indigenousPartnerships,
        stakeholderPartnerships
      ] = await Promise.all([
        await connection.query(getProjectSQLStatement.text, getProjectSQLStatement.values),
        await connection.query(getProjectPermitsSQLStatement.text, getProjectPermitsSQLStatement.values),
        await connection.query(getProjectLocationSQLStatement.text, getProjectLocationSQLStatement.values),
        await connection.query(getProjectActivitiesSQLStatement.text, getProjectActivitiesSQLStatement.values),
        await connection.query(
          getProjectIUCNActionClassificationSQLStatement.text,
          getProjectIUCNActionClassificationSQLStatement.values
        ),
        await connection.query(getProjectFundingSourceSQLStatement.text, getProjectFundingSourceSQLStatement.values),
        await connection.query(
          getProjectIndigenousPartnershipsSQLStatement.text,
          getProjectIndigenousPartnershipsSQLStatement.values
        ),
        await connection.query(
          getProjectStakeholderPartnershipsSQLStatement.text,
          getProjectStakeholderPartnershipsSQLStatement.values
        )
      ]);

      await connection.commit();

      const getProjectData =
        (projectData &&
          projectData.rows &&
          activityData &&
          activityData.rows &&
          new GetProjectData(projectData.rows[0], activityData.rows)) ||
        null;

      const getPermitData = (permitData && permitData.rows && new GetPermitData(permitData.rows)) || null;

      const getObjectivesData = (projectData && projectData.rows && new GetObjectivesData(projectData.rows[0])) || null;

      const getLocationData = (locationData && locationData.rows && new GetLocationData(locationData.rows)) || null;

      const getCoordinatorData =
        (projectData && projectData.rows && new GetCoordinatorData(projectData.rows[0])) || null;

      const getPartnershipsData =
        (indigenousPartnerships &&
          indigenousPartnerships.rows &&
          stakeholderPartnerships &&
          stakeholderPartnerships.rows &&
          new GetPartnershipsData(indigenousPartnerships.rows, stakeholderPartnerships.rows)) ||
        null;

      const getIUCNClassificationData =
        (iucnClassificationData &&
          iucnClassificationData.rows &&
          new GetIUCNClassificationData(iucnClassificationData.rows)) ||
        null;

      const getFundingData = (fundingData && fundingData.rows && new GetFundingData(fundingData.rows)) || null;

      const result = {
        id: req.params.projectId,
        project: getProjectData,
        permit: getPermitData,
        coordinator: getCoordinatorData,
        objectives: getObjectivesData,
        location: getLocationData,
        iucn: getIUCNClassificationData,
        funding: getFundingData,
        partnerships: getPartnershipsData
      };

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'getProjectForView', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
