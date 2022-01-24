import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection, IDBConnection } from '../../database/db';
import { HTTP400 } from '../../errors/custom-error';
import {
  IPostIUCN,
  IPostPermit,
  PostFundingSource,
  PostLocationData,
  PostProjectObject
} from '../../models/project-create';
import { geoJsonFeature } from '../../openapi/schemas/geoJson';
import { queries } from '../../queries/queries';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/project/create');

export const POST: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_CREATOR],
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
          required: ['project', 'iucn', 'coordinator', 'permit', 'funding', 'partnerships', 'location'],
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
            iucn: {
              title: 'Project IUCN classifications',
              type: 'object',
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
            permit: {
              title: 'Project permits',
              type: 'object',
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
              properties: {
                funding_sources: {
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
              properties: {
                range: {
                  type: 'number'
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
      const postProjectSQLStatement = queries.project.postProjectSQL({
        ...sanitizedProjectPostData.project,
        ...sanitizedProjectPostData.location,
        ...sanitizedProjectPostData.coordinator
      });

      if (!postProjectSQLStatement) {
        throw new HTTP400('Failed to build SQL insert statement');
      }

      let projectId: number;

      try {
        await connection.open();

        // Handle project details
        const createProjectResponse = await connection.query(
          postProjectSQLStatement.text,
          postProjectSQLStatement.values
        );

        const projectResult =
          (createProjectResponse && createProjectResponse.rows && createProjectResponse.rows[0]) || null;

        if (!projectResult || !projectResult.id) {
          throw new HTTP400('Failed to insert project general information data');
        }

        projectId = projectResult.id;

        const promises: Promise<any>[] = [];

        //Handle geometry

        promises.push(insertProjectSpatial(sanitizedProjectPostData.location, projectId, connection));

        // Handle funding sources
        promises.push(
          Promise.all(
            sanitizedProjectPostData.funding.funding_sources.map((fundingSource: PostFundingSource) =>
              insertFundingSource(fundingSource, projectId, connection)
            )
          )
        );

        // Handle indigenous partners
        promises.push(
          Promise.all(
            sanitizedProjectPostData.partnerships.indigenous_partnerships.map((indigenousNationId: number) =>
              insertIndigenousNation(indigenousNationId, projectId, connection)
            )
          )
        );

        // Handle stakeholder partners
        promises.push(
          Promise.all(
            sanitizedProjectPostData.partnerships.stakeholder_partnerships.map((stakeholderPartner: string) =>
              insertStakeholderPartnership(stakeholderPartner, projectId, connection)
            )
          )
        );

        // Handle new project permits
        promises.push(
          Promise.all(
            sanitizedProjectPostData.permit.permits.map((permit: IPostPermit) =>
              insertPermit(permit.permit_number, permit.permit_type, projectId, connection)
            )
          )
        );

        // Handle project IUCN classifications
        promises.push(
          Promise.all(
            sanitizedProjectPostData.iucn.classificationDetails.map((classificationDetail: IPostIUCN) =>
              insertClassificationDetail(classificationDetail.subClassification2, projectId, connection)
            )
          )
        );

        await Promise.all(promises);

        // The user that creates a project is automatically assigned a project lead role, for this project
        await insertProjectParticipantRole(projectId, PROJECT_ROLE.PROJECT_LEAD, connection);

        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      }

      return res.status(200).json({ id: projectId });
    } catch (error) {
      defaultLog.error({ label: 'createProject', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const insertProjectSpatial = async (
  locationData: PostLocationData,
  project_id: number,
  connection: IDBConnection
): Promise<number> => {
  const sqlStatement = queries.project.postProjectBoundarySQL(locationData, project_id);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rows && response.rows[0]) || null;

  if (!result || !result.id) {
    throw new HTTP400('Failed to insert project boundary data');
  }

  return result.id;
};

export const insertFundingSource = async (
  fundingSource: PostFundingSource,
  project_id: number,
  connection: IDBConnection
): Promise<number> => {
  const sqlStatement = queries.project.postProjectFundingSourceSQL(fundingSource, project_id);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rows && response.rows[0]) || null;

  if (!result || !result.id) {
    throw new HTTP400('Failed to insert project funding data');
  }

  return result.id;
};

export const insertIndigenousNation = async (
  indigenousNationId: number,
  project_id: number,
  connection: IDBConnection
): Promise<number> => {
  const sqlStatement = queries.project.postProjectIndigenousNationSQL(indigenousNationId, project_id);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rows && response.rows[0]) || null;

  if (!result || !result.id) {
    throw new HTTP400('Failed to insert project first nations partnership data');
  }

  return result.id;
};

export const insertStakeholderPartnership = async (
  stakeholderPartner: string,
  project_id: number,
  connection: IDBConnection
): Promise<number> => {
  const sqlStatement = queries.project.postProjectStakeholderPartnershipSQL(stakeholderPartner, project_id);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rows && response.rows[0]) || null;

  if (!result || !result.id) {
    throw new HTTP400('Failed to insert project stakeholder partnership data');
  }

  return result.id;
};

export const insertPermit = async (
  permitNumber: string,
  permitType: string,
  projectId: number,
  connection: IDBConnection
): Promise<number> => {
  const systemUserId = connection.systemUserId();

  if (!systemUserId) {
    throw new HTTP400('Failed to identify system user ID');
  }

  const sqlStatement = queries.permit.postProjectPermitSQL(permitNumber, permitType, projectId, systemUserId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rows && response.rows[0]) || null;

  if (!result || !result.id) {
    throw new HTTP400('Failed to insert project permit data');
  }

  return result.id;
};

export const insertClassificationDetail = async (
  iucn3_id: number,
  project_id: number,
  connection: IDBConnection
): Promise<number> => {
  const sqlStatement = queries.project.postProjectIUCNSQL(iucn3_id, project_id);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rows && response.rows[0]) || null;

  if (!result || !result.id) {
    throw new HTTP400('Failed to insert project IUCN data');
  }

  return result.id;
};

export const insertProjectParticipantRole = async (
  projectId: number,
  projectParticipantRole: string,
  connection: IDBConnection
): Promise<void> => {
  const systemUserId = connection.systemUserId();

  if (!systemUserId) {
    throw new HTTP400('Failed to identify system user ID');
  }

  const sqlStatement = queries.projectParticipation.addProjectRoleByRoleNameSQL(
    projectId,
    systemUserId,
    projectParticipantRole
  );

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response.rowCount) {
    throw new HTTP400('Failed to insert project team member');
  }
};
