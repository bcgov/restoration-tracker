import chai, { expect } from 'chai';
import { Feature } from 'geojson';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import { HTTPError } from '../errors/custom-error';
import * as projectCreateModels from '../models/project-create';
import * as projectUpdateModels from '../models/project-update';
import * as projectViewModels from '../models/project-view';
import { IUpdateProject } from '../paths/project/{projectId}/update';
import { queries } from '../queries/queries';
import { getMockDBConnection } from '../__mocks__/db';
import { ProjectService } from './project-service';

chai.use(sinonChai);

const entitiesInitValue = {
  project: null,
  contact: null,
  permit: null,
  partnerships: null,
  iucn: null,
  funding: null,
  location: null,
  species: null
};

describe('ProjectService', () => {
  describe('ensureProjectParticipant', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('does not add a new project participant if one already exists', async () => {
      const mockDBConnection = getMockDBConnection();

      const getProjectParticipantStub = sinon
        .stub(ProjectService.prototype, 'getProjectParticipant')
        .resolves('existing participant');

      const addProjectParticipantStub = sinon.stub(ProjectService.prototype, 'addProjectParticipant');

      const projectId = 1;
      const systemUserId = 1;
      const projectParticipantRoleId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.ensureProjectParticipant(systemUserId, projectId, projectParticipantRoleId);
      } catch (actualError) {
        expect.fail();
      }

      expect(getProjectParticipantStub).to.have.been.calledOnce;
      expect(addProjectParticipantStub).not.to.have.been.called;
    });

    it('adds a new project participant if one did not already exist', async () => {
      const mockDBConnection = getMockDBConnection();

      const getProjectParticipantStub = sinon.stub(ProjectService.prototype, 'getProjectParticipant').resolves(null);

      const addProjectParticipantStub = sinon.stub(ProjectService.prototype, 'addProjectParticipant');

      const projectId = 1;
      const systemUserId = 1;
      const projectParticipantRoleId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.ensureProjectParticipant(systemUserId, projectId, projectParticipantRoleId);
      } catch (actualError) {
        expect.fail();
      }

      expect(getProjectParticipantStub).to.have.been.calledOnce;
      expect(addProjectParticipantStub).to.have.been.calledOnce;
    });
  });

  describe('getProjectParticipant', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 response when response has no rowCount', async () => {
      const mockQueryResponse = (null as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ sql: async () => mockQueryResponse });

      sinon.stub(queries.projectParticipation, 'getAllUserProjectsSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const systemUserId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.getProjectParticipant(systemUserId, projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to get project team members');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns null if there are no rows', async () => {
      const mockQueryResponse = ({ rows: [] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ sql: async () => mockQueryResponse });

      sinon.stub(queries.projectParticipation, 'getAllUserProjectsSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const systemUserId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getProjectParticipant(systemUserId, projectId);

      expect(result).to.equal(null);
    });

    it('returns the first row on success', async () => {
      const mockRowObj = { id: 123 };
      const mockQueryResponse = ({ rows: [mockRowObj] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ sql: async () => mockQueryResponse });

      sinon.stub(queries.projectParticipation, 'getAllUserProjectsSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const systemUserId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getProjectParticipant(systemUserId, projectId);

      expect(result).to.equal(mockRowObj);
    });
  });

  describe('getProjectParticipants', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(queries.projectParticipation, 'getAllProjectParticipantsSQL').returns(null);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.getProjectParticipants(projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL select statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when response has no rowCount', async () => {
      const mockQueryResponse = (null as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.projectParticipation, 'getAllProjectParticipantsSQL').returns(SQL`valid sql`);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.getProjectParticipants(projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to get project team members');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns empty array if there are no rows', async () => {
      const mockQueryResponse = ({ rows: [] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.projectParticipation, 'getAllProjectParticipantsSQL').returns(SQL`valid sql`);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getProjectParticipants(projectId);

      expect(result).to.eql([]);
    });

    it('returns rows on success', async () => {
      const mockRowObj = [{ id: 123 }];
      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.projectParticipation, 'getAllProjectParticipantsSQL').returns(SQL`valid sql`);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getProjectParticipants(projectId);

      expect(result).to.equal(mockRowObj);
    });
  });

  describe('addProjectParticipant', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(queries.projectParticipation, 'addProjectRoleByRoleIdSQL').returns(null);

      const projectId = 1;
      const systemUserId = 1;
      const projectParticipantRoleId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.addProjectParticipant(systemUserId, projectId, projectParticipantRoleId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL insert statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when response has no rowCount', async () => {
      const mockQueryResponse = ({ rowCount: 0 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.projectParticipation, 'addProjectRoleByRoleIdSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const systemUserId = 1;
      const projectParticipantRoleId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.addProjectParticipant(systemUserId, projectId, projectParticipantRoleId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to insert project team member');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should not throw an error on success', async () => {
      const mockQueryResponse = ({ rowCount: 1 } as unknown) as QueryResult<any>;
      const mockQuery = sinon.fake.resolves(mockQueryResponse);
      const mockDBConnection = getMockDBConnection({ query: mockQuery });

      const addProjectRoleByRoleIdSQLStub = sinon
        .stub(queries.projectParticipation, 'addProjectRoleByRoleIdSQL')
        .returns(SQL`valid sql`);

      const projectId = 1;
      const systemUserId = 1;
      const projectParticipantRoleId = 1;

      const projectService = new ProjectService(mockDBConnection);

      await projectService.addProjectParticipant(systemUserId, projectId, projectParticipantRoleId);

      expect(addProjectRoleByRoleIdSQLStub).to.have.been.calledOnce;
      expect(mockQuery).to.have.been.calledOnce;
    });
  });

  describe('getProjectData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(queries.project, 'getProjectSQL').returns(null);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.getProjectData(projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL get statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when response has no rowCount', async () => {
      const mockQueryResponse = (null as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'getProjectSQL').returns(SQL`valid sql`);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.getProjectData(projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to get project data');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when there are no rows', async () => {
      const mockQueryResponse = ({ rows: [] } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'getProjectSQL').returns(SQL`valid sql`);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.getProjectData(projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to get project data');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns row on success', async () => {
      const mockRowObj = [{ project_id: 1 }];

      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'getProjectSQL').returns(SQL`valid sql`);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getProjectData(projectId);

      expect(result).to.deep.include(new projectViewModels.GetProjectData(mockRowObj[0]));
    });
  });

  describe('getIUCNClassificationData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 response when response has no rowCount', async () => {
      const mockQueryResponse = (null as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.getIUCNClassificationData(projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to get project IUCN data');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns row on success', async () => {
      const mockRowObj = [{ project_id: 1 }];

      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'getProjectSQL').returns(SQL`valid sql`);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getIUCNClassificationData(projectId);

      expect(result).to.deep.include(new projectViewModels.GetIUCNClassificationData(mockRowObj));
    });
  });

  describe('getContactData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 response when response has no rowCount', async () => {
      const mockQueryResponse = (null as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.getContactData(projectId, false);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to get project contact data');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns row on success when isPublic is false', async () => {
      const mockRowObj = [{ project_id: 1 }];

      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'getProjectSQL').returns(SQL`valid sql`);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getContactData(projectId, false);

      const { contacts } = new projectViewModels.GetContactData(mockRowObj);

      expect(result).to.deep.include({ contacts: [...contacts, ...contacts] });
    });

    it('returns row on success when isPublic is true', async () => {
      const mockRowObj = [
        {
          first_name: '',
          last_name: '',
          email_address: '',
          agency: '',
          is_public: 'Y',
          is_primary: 'Y'
        },
        {
          first_name: '',
          last_name: '',
          email_address: '',
          agency: 'Agency_name',
          is_public: 'N',
          is_primary: 'N'
        }
      ];

      const mockQuery = sinon
        .stub()
        .onCall(0)
        .returns(Promise.resolve({ rows: [mockRowObj[0]] }))
        .onCall(1)
        .returns(Promise.resolve({ rows: [mockRowObj[1]] }));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      sinon.stub(queries.project, 'getProjectSQL').returns(SQL`valid sql`);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getContactData(projectId, true);

      const { contacts } = new projectViewModels.GetContactData(mockRowObj);

      expect(result).to.deep.include({ contacts: [...contacts] });
    });
  });

  describe('getPermitData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 response when response has no rowCount', async () => {
      const mockQueryResponse = (null as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.getPermitData(projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to get project permit data');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns row on success', async () => {
      const mockRowObj = [{ project_id: 1 }];

      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'getProjectSQL').returns(SQL`valid sql`);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getPermitData(projectId);

      expect(result).to.deep.include(new projectViewModels.GetPermitData(mockRowObj));
    });
  });

  describe('getPartnershipsData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 response when getIndigenousPartnershipsRows response has no rowCount', async () => {
      const mockDBConnection = getMockDBConnection();

      const projectService = new ProjectService(mockDBConnection);

      sinon.stub(projectService, 'getIndigenousPartnershipsRows').resolves();

      const projectId = 1;

      try {
        await projectService.getPartnershipsData(projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to get indigenous partnership data');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when getStakeholderPartnershipsRows response has no rowCount', async () => {
      const mockDBConnection = getMockDBConnection();

      const projectService = new ProjectService(mockDBConnection);

      sinon.stub(projectService, 'getIndigenousPartnershipsRows').resolves([]);
      sinon.stub(projectService, 'getStakeholderPartnershipsRows').resolves();

      const projectId = 1;

      try {
        await projectService.getPartnershipsData(projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to get stakeholder partnership data');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns row on success', async () => {
      const mockRowObj = [{ project_id: 1 }];

      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getPartnershipsData(projectId);

      expect(result).to.deep.include(new projectViewModels.GetPartnershipsData(mockRowObj, mockRowObj));
    });
  });

  describe('getFundingData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 response when response has no rowCount', async () => {
      const mockQueryResponse = (null as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.getFundingData(projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to get project funding data');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns row on success', async () => {
      const mockRowObj = [{ project_id: 1 }];

      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'getProjectSQL').returns(SQL`valid sql`);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getFundingData(projectId);

      expect(result).to.deep.include(new projectViewModels.GetFundingData(mockRowObj));
    });
  });

  describe('getLocationData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 response when response has no geometry data', async () => {
      const mockQueryResponse = (null as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.getLocationData(projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to get geometry data');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when response has no region data', async () => {
      const dbConnectionObj = getMockDBConnection();

      const projectService = new ProjectService(dbConnectionObj);

      sinon.stub(ProjectService.prototype, 'getGeometryData').resolves([
        {
          project_id: 1
        }
      ]);

      sinon.stub(ProjectService.prototype, 'getRegionData').resolves(null);

      const projectId = 1;

      try {
        await projectService.getLocationData(projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to get region data');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns row on success', async () => {
      const mockRowObj = [{ project_id: 1 }];

      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'getProjectSQL').returns(SQL`valid sql`);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getLocationData(projectId);

      expect(result).to.deep.include(new projectViewModels.GetLocationData(mockRowObj));
    });
  });

  describe('getLocationData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 response when response has no species data', async () => {
      const mockQueryResponse = (null as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.getSpeciesData(projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to get species data');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns row on success', async () => {
      const mockRowObj = [{ project_id: 1 }];

      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'getProjectSQL').returns(SQL`valid sql`);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getSpeciesData(projectId);

      expect(result).to.deep.include(new projectViewModels.GetSpeciesData(mockRowObj));
    });
  });

  describe('createProject', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns project id on success', async () => {
      const mockRowObj = [{ id: 1 }];
      const mockQueryResponseGeneral = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockQueryResponseForAddProjectRole = ({ rowCount: 1 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({
        query: async (a) =>
          a === 'valid sql projectParticipation' ? mockQueryResponseForAddProjectRole : mockQueryResponseGeneral,
        systemUserId: () => 1
      });

      sinon
        .stub(queries.projectParticipation, 'addProjectRoleByRoleNameSQL')
        .returns(SQL`valid sql projectParticipation`);

      const projectData = {
        contact: new projectCreateModels.PostContactData(),
        species: new projectCreateModels.PostSpeciesData(),
        permit: new projectCreateModels.PostPermitData(),
        project: new projectCreateModels.PostProjectData(),
        location: new projectCreateModels.PostLocationData({ geometry: [{ something: true }] }),
        funding: new projectCreateModels.PostFundingData(),
        iucn: new projectCreateModels.PostIUCNData(),
        partnerships: new projectCreateModels.PostPartnershipsData()
      };

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.createProject(projectData);

      expect(result).equals(mockRowObj[0].id);
    });

    it('works as expected with full project details', async () => {
      const mockRowObj = [{ id: 1 }];
      const mockQueryResponseGeneral = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockQueryResponseForAddProjectRole = ({ rowCount: 1 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({
        query: async (a) =>
          a === 'valid sql projectParticipation' ? mockQueryResponseForAddProjectRole : mockQueryResponseGeneral,
        systemUserId: () => 1
      });

      sinon
        .stub(queries.projectParticipation, 'addProjectRoleByRoleNameSQL')
        .returns(SQL`valid sql projectParticipation`);

      const projectData = {
        project: {
          name: 'My project',
          start_date: '1955-02-15',
          end_date: '2084-06-23',
          objectives: 'Culpa sint ex iust'
        },
        species: { focal_species: [15573] },
        iucn: { classificationDetails: [{ classification: 3, subClassification1: 6, subClassification2: 35 }] },
        contact: {
          contacts: [
            {
              first_name: 'John',
              last_name: 'Smith',
              email_address: 'john@smith.com',
              agency: 'ABC Consulting',
              is_public: false,
              is_primary: true
            }
          ]
        },
        permit: { permits: [{ permit_number: '849', permit_type: 'Road Use Permit' }] },
        funding: {
          funding_sources: [
            {
              id: 0,
              agency_id: 20,
              agency_name: '',
              investment_action_category: 59,
              investment_action_category_name: '',
              agency_project_id: 'Agency123',
              funding_amount: 123,
              start_date: '2022-02-27',
              end_date: '2022-03-26',
              revision_count: 0
            }
          ]
        },
        partnerships: {
          indigenous_partnerships: [5, 123],
          stakeholder_partnerships: ['Canada Nature Fund', 'BC Parks Living Labs']
        },
        location: {
          geometry: [({} as unknown) as Feature],
          priority: true,
          region: 3640,
          range: 1234
        }
      };
      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.createProject(projectData);

      expect(result).equals(mockRowObj[0].id);
    });
  });

  describe('insertProject', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(queries.project, 'postProjectSQL').returns(null);

      const projectData = {
        ...new projectCreateModels.PostProjectData(),
        ...new projectCreateModels.PostContactData()
      };

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.insertProject(projectData);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL insert statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when response has no rowCount', async () => {
      const mockQueryResponse = (null as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      const projectData = {
        ...new projectCreateModels.PostProjectData(),
        ...new projectCreateModels.PostContactData()
      };

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.insertProject(projectData);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to insert project boundary data');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns project id on success', async () => {
      const mockRowObj = [{ id: 1 }];

      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'getProjectSQL').returns(SQL`valid sql`);

      const projectData = new projectCreateModels.PostProjectData();

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.insertProject(projectData);

      expect(result).equals(mockRowObj[0].id);
    });
  });

  describe('insertProjectSpatial', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(queries.project, 'postProjectBoundarySQL').returns(null);

      const projectId = 1;
      const locationData = new projectCreateModels.PostLocationData();

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.insertProjectSpatial(locationData, projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL insert statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when response has no rowCount', async () => {
      const mockQueryResponse = (null as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'postProjectBoundarySQL').returns(SQL`valid sql`);

      const projectId = 1;
      const locationData = new projectCreateModels.PostLocationData();

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.insertProjectSpatial(locationData, projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to insert project boundary data');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when response has no id', async () => {
      const mockQueryResponse = ({ noId: true } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'postProjectBoundarySQL').returns(SQL`valid sql`);

      const projectId = 1;
      const locationData = new projectCreateModels.PostLocationData();

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.insertProjectSpatial(locationData, projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to insert project boundary data');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns project id on success', async () => {
      const mockRowObj = [{ id: 1 }];
      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'postProjectBoundarySQL').returns(SQL`valid sql`);

      const projectId = 1;
      const locationData = new projectCreateModels.PostLocationData();

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.insertProjectSpatial(locationData, projectId);

      expect(result).equals(mockRowObj[0].id);
    });
  });

  describe('insertFundingSource', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(queries.project, 'postProjectFundingSourceSQL').returns(null);

      const projectId = 1;
      const fundingSource = new projectCreateModels.PostFundingSource();

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.insertFundingSource(fundingSource, projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL insert statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when response has no rowCount', async () => {
      const mockQueryResponse = (null as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'postProjectFundingSourceSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const fundingSource = new projectCreateModels.PostFundingSource();

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.insertFundingSource(fundingSource, projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to insert project funding data');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when response has no id', async () => {
      const mockQueryResponse = ({ noId: true } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'postProjectFundingSourceSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const fundingSource = new projectCreateModels.PostFundingSource();

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.insertFundingSource(fundingSource, projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to insert project funding data');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns id on success', async () => {
      const mockRowObj = [{ id: 1 }];
      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'postProjectFundingSourceSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const fundingSource = new projectCreateModels.PostFundingSource();

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.insertFundingSource(fundingSource, projectId);

      expect(result).equals(mockRowObj[0].id);
    });
  });

  describe('insertIndigenousNation', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 response when response has no id', async () => {
      const mockQueryResponse = ({ noId: true } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      const indigenousNationId = 1;
      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.insertIndigenousNation(indigenousNationId, projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to insert project first nations partnership data');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns id on success', async () => {
      const mockRowObj = [{ id: 1 }];
      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      const indigenousNationId = 1;
      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.insertIndigenousNation(indigenousNationId, projectId);

      expect(result).equals(mockRowObj[0].id);
    });
  });

  describe('insertStakeholderPartnership', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 response when response has no id', async () => {
      const mockQueryResponse = ({ noId: true } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      const stakeholderPartner = 'something';
      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.insertStakeholderPartnership(stakeholderPartner, projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to insert project stakeholder partnership data');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns id on success', async () => {
      const mockRowObj = [{ id: 1 }];
      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      const stakeholderPartner = 'something';
      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.insertStakeholderPartnership(stakeholderPartner, projectId);

      expect(result).equals(mockRowObj[0].id);
    });
  });

  describe('insertPermit', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 response when failed to identify system user ID', async () => {
      const mockRowObj = [{ id: 1 }];
      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({
        query: async () => mockQueryResponse,
        systemUserId: () => (null as any) as number
      });

      const permitNumber = '123456';
      const permitType = 'something';
      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.insertPermit(permitNumber, permitType, projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to identify system user ID');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when response has no id', async () => {
      const mockQueryResponse = ({ noId: true } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({
        query: async () => mockQueryResponse,
        systemUserId: () => 1
      });

      const permitNumber = '123456';
      const permitType = 'something';
      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.insertPermit(permitNumber, permitType, projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to insert project permit data');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns id on success', async () => {
      const mockRowObj = [{ id: 1 }];
      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({
        query: async () => mockQueryResponse,
        systemUserId: () => 1
      });

      const permitNumber = '123456';
      const permitType = 'something';
      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.insertPermit(permitNumber, permitType, projectId);

      expect(result).equals(mockRowObj[0].id);
    });
  });

  describe('insertClassificationDetail', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      const mockDBConnection = getMockDBConnection();

      sinon.stub(queries.project, 'postProjectIUCNSQL').returns(null);

      const iucn3_id = 1;
      const project_id = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.insertClassificationDetail(iucn3_id, project_id);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL insert statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when response has no id', async () => {
      const mockQueryResponse = ({ noId: true } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'postProjectBoundarySQL').returns(SQL`valid sql`);

      const iucn3_id = 1;
      const project_id = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.insertClassificationDetail(iucn3_id, project_id);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to insert project IUCN data');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns id on success', async () => {
      const mockRowObj = [{ id: 1 }];
      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'postProjectBoundarySQL').returns(SQL`valid sql`);

      const iucn3_id = 1;
      const project_id = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.insertClassificationDetail(iucn3_id, project_id);

      expect(result).equals(mockRowObj[0].id);
    });
  });

  describe('insertProjectParticipantRole', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 response when failed to identify system user ID', async () => {
      const mockRowObj = [{ id: 1 }];
      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({
        query: async () => mockQueryResponse,
        systemUserId: () => (null as any) as number
      });

      const projectId = 1;
      const projectParticipantRole = 'something';

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.insertProjectParticipantRole(projectId, projectParticipantRole);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to identify system user ID');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      const mockRowObj = [{ id: 1 }];
      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({
        query: async () => mockQueryResponse,
        systemUserId: () => 1
      });

      sinon.stub(queries.projectParticipation, 'addProjectRoleByRoleNameSQL').returns(null);

      const projectId = 1;
      const projectParticipantRole = 'something';

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.insertProjectParticipantRole(projectId, projectParticipantRole);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL insert statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when response has no rowCount', async () => {
      const mockQueryResponse = (null as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({
        query: async () => mockQueryResponse,
        systemUserId: () => 1
      });

      sinon.stub(queries.projectParticipation, 'addProjectRoleByRoleNameSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const projectParticipantRole = 'something';

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.insertProjectParticipantRole(projectId, projectParticipantRole);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to insert project team member');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });
  });

  describe('insertSpecies', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 response when failed to identify system user ID', async () => {
      const mockQueryResponse = ({ rowCount: 1 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({
        query: async () => mockQueryResponse,
        systemUserId: () => (null as any) as number
      });

      const species_id = 1;
      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.insertSpecies(species_id, projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to identify system user ID');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 error when no sql statement produced', async () => {
      const mockQueryResponse = ({ rowCount: 1 } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({
        query: async () => mockQueryResponse,
        systemUserId: () => 1
      });

      sinon.stub(queries.project, 'postProjectSpeciesSQL').returns(null);

      const species_id = 1;
      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.insertSpecies(species_id, projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL insert statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when response has no rowCount', async () => {
      const mockQueryResponse = ({ rowCount: null } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({
        query: async () => mockQueryResponse,
        systemUserId: () => 1
      });

      sinon.stub(queries.project, 'postProjectSpeciesSQL').returns(SQL`valid sql`);

      const species_id = 1;
      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.insertSpecies(species_id, projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to insert project species');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });
  });

  describe('insertRegion', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 response when response has no id', async () => {
      const mockQueryResponse = ({ noId: true } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      const regionNumber = 1;
      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.insertRegion(regionNumber, projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to insert project region data');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns id on success', async () => {
      const mockRowObj = [{ id: 1 }];
      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      const regionNumber = 1;
      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.insertRegion(regionNumber, projectId);

      expect(result).equals(mockRowObj[0].id);
    });
  });

  describe('insertRange', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 response when response has no id', async () => {
      const mockQueryResponse = ({ noId: true } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      const rangeNumber = 1;
      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.insertRange(rangeNumber, projectId);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to insert project range data');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns id on success', async () => {
      const mockRowObj = [{ id: 1 }];
      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      const rangeNumber = 1;
      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.insertRange(rangeNumber, projectId);

      expect(result).equals(mockRowObj[0].id);
    });
  });

  describe('insertContact', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 response when response has no id', async () => {
      const mockQueryResponse = ({ noId: true } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.insertContact(
          {
            first_name: 'John',
            last_name: 'Smith',
            agency: 'Agency123',
            email_address: 'a@b.com',
            is_public: true,
            is_primary: false
          },
          projectId
        );
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to insert project contact data');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('returns id on success', async () => {
      const mockRowObj = [{ id: 1 }];
      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.insertContact(
        {
          first_name: 'John',
          last_name: 'Smith',
          agency: 'Agency123',
          email_address: 'a@b.com',
          is_public: true,
          is_primary: false
        },
        projectId
      );

      expect(result).equals(mockRowObj[0].id);
    });
  });

  describe('updateProject', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('makes no call to update entities', async () => {
      const mockDBConnection = getMockDBConnection();

      const projectId = 1;
      const entities: IUpdateProject = entitiesInitValue;

      const projectService = new ProjectService(mockDBConnection);

      const projectServiceSpy = sinon.spy(projectService);

      await projectService.updateProject(projectId, entities);
      expect(projectServiceSpy.updateProjectData).not.to.have.been.called;
      expect(projectServiceSpy.updateContactData).not.to.have.been.called;
      expect(projectServiceSpy.updateProjectPermitData).not.to.have.been.called;
      expect(projectServiceSpy.updateProjectIUCNData).not.to.have.been.called;
      expect(projectServiceSpy.updateProjectPartnershipsData).not.to.have.been.called;
      expect(projectServiceSpy.updateProjectFundingData).not.to.have.been.called;
      expect(projectServiceSpy.updateProjectSpatialData).not.to.have.been.called;
      expect(projectServiceSpy.updateProjectRegionData).not.to.have.been.called;
      expect(projectServiceSpy.updateProjectRangeData).not.to.have.been.called;
      expect(projectServiceSpy.updateProjectSpeciesData).not.to.have.been.called;
    });

    it('makes call to update entities', async () => {
      const mockDBConnection = getMockDBConnection();

      const projectId = 1;
      const entities: IUpdateProject = {
        project: new projectUpdateModels.PutProjectData(),
        contact: new projectCreateModels.PostContactData(),
        permit: new projectCreateModels.PostPermitData(),
        partnerships: new projectUpdateModels.PutPartnershipsData(),
        iucn: new projectUpdateModels.PutIUCNData(),
        funding: new projectUpdateModels.PutFundingData(),
        location: new projectUpdateModels.PutLocationData(),
        species: new projectUpdateModels.PutSpeciesData()
      };

      const projectService = new ProjectService(mockDBConnection);

      const projectServiceSpy = sinon.spy(projectService);

      try {
        await projectService.updateProject(projectId, entities);
      } catch (actualError) {
        expect(projectServiceSpy.updateProjectData).to.have.been.called;
        expect(projectServiceSpy.updateContactData).to.have.been.called;
        expect(projectServiceSpy.updateProjectPermitData).to.have.been.called;
        expect(projectServiceSpy.updateProjectIUCNData).to.have.been.called;
        expect(projectServiceSpy.updateProjectPartnershipsData).to.have.been.called;
        expect(projectServiceSpy.updateProjectFundingData).to.have.been.called;
        expect(projectServiceSpy.updateProjectSpatialData).to.have.been.called;
        expect(projectServiceSpy.updateProjectRegionData).to.have.been.called;
        expect(projectServiceSpy.updateProjectRangeData).to.have.been.called;
        expect(projectServiceSpy.updateProjectSpeciesData).to.have.been.called;
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });
  });

  describe('updateProjectData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 response when response has no revision_count', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([]));

      sinon.stub(queries.project, 'putProjectSQL').returns(SQL`valid sql`);

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        project: new projectCreateModels.PostProjectData()
      };

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.updateProjectData(projectId, entities);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to parse request body');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when no sql statement produced', async () => {
      const mockQueryResponse = ({ noId: true } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'putProjectSQL').returns(null);

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        project: {
          ...new projectUpdateModels.PutProjectData(),
          revision_count: 1
        }
      };

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.updateProjectData(projectId, entities);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL update statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when no sql statement produced', async () => {
      const mockQueryResponse = ({ rowCount: null } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'putProjectSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        project: {
          ...new projectUpdateModels.PutProjectData(),
          revision_count: 1
        }
      };

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.updateProjectData(projectId, entities);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to update stale project data');
        expect((actualError as HTTPError).status).to.equal(409);
      }
    });
  });

  describe('updateContactData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 response when no sql statement produced', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      sinon.stub(queries.project, 'deleteContactSQL').returns(null);

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        contact: new projectCreateModels.PostContactData()
      };

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.updateContactData(projectId, entities);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL delete statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 409 response when delete contact fails', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve(null));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        contact: new projectCreateModels.PostContactData()
      };

      sinon.stub(queries.project, 'deleteContactSQL').returns(SQL`valid sql`);

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.updateContactData(projectId, entities);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to delete project contact data');
        expect((actualError as HTTPError).status).to.equal(409);
      }
    });

    it('should insert the new contact information', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        contact: {
          contacts: [
            {
              first_name: 'Katelyn',
              last_name: 'Williams',
              email_address: 'fuvaxacix@mailinator.com',
              agency: 'Non ut ullamco incid',
              is_public: 'true',
              is_primary: 'true'
            }
          ]
        }
      };

      sinon.stub(queries.project, 'deleteContactSQL').returns(SQL`valid sql`);

      const insertContactStub = sinon.stub(ProjectService.prototype, 'insertContact').resolves(1);

      const projectService = new ProjectService(mockDBConnection);

      await projectService.updateContactData(projectId, entities);

      expect(insertContactStub).to.have.been.calledOnce;
    });
  });

  describe('updateProjectPermitData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 response when there is no permit data', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      sinon.stub(queries.project, 'deletePermitSQL').returns(null);

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue
      };

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.updateProjectPermitData(projectId, entities);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Missing request body entity `permit`');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when no sql statement produced', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      sinon.stub(queries.project, 'deletePermitSQL').returns(null);

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        permit: new projectCreateModels.PostPermitData()
      };

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.updateProjectPermitData(projectId, entities);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL delete statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 409 response when delete permit fails', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve(null));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        contact: new projectCreateModels.PostPermitData()
      };

      sinon.stub(queries.project, 'deletePermitSQL').returns(SQL`valid sql`);

      sinon.stub(ProjectService.prototype, 'updateProjectPermitData');
      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.updateContactData(projectId, entities);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to delete project contact data');
        expect((actualError as HTTPError).status).to.equal(409);
      }
    });

    it('should insert the new permit information', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        permit: {
          permits: [
            {
              permit_number: 1,
              permit_type: 'License of occupation'
            }
          ]
        }
      };

      sinon.stub(queries.project, 'deletePermitSQL').returns(SQL`valid sql`);

      const insertPermitStub = sinon.stub(ProjectService.prototype, 'insertPermit').resolves(1);

      const projectService = new ProjectService(mockDBConnection);

      await projectService.updateProjectPermitData(projectId, entities);

      expect(insertPermitStub).to.have.been.calledOnce;
    });
  });

  describe('updateProjectIUCNData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 response when no sql statement produced', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      sinon.stub(queries.project, 'deleteIUCNSQL').returns(null);

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        iucn: new projectCreateModels.PostIUCNData()
      };

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.updateProjectIUCNData(projectId, entities);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL delete statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 409 response when delete iucn fails', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve(null));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        iucn: new projectCreateModels.PostIUCNData()
      };

      sinon.stub(queries.project, 'deleteIUCNSQL').returns(SQL`valid sql`);

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.updateProjectIUCNData(projectId, entities);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to delete project IUCN data');
        expect((actualError as HTTPError).status).to.equal(409);
      }
    });

    it('should insert the new iucn information', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        iucn: {
          classificationDetails: [
            {
              classification: 1,
              subclassification1: 1,
              subclassification2: 1
            }
          ]
        }
      };

      sinon.stub(queries.project, 'deleteIUCNSQL').returns(SQL`valid sql`);

      const insertIUCNStub = sinon.stub(ProjectService.prototype, 'insertClassificationDetail').resolves(1);

      const projectService = new ProjectService(mockDBConnection);

      await projectService.updateProjectIUCNData(projectId, entities);

      expect(insertIUCNStub).to.have.been.calledOnce;
    });
  });

  describe('updateProjectPartnershipsData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 response when no sql statement produced for Indigenous Partnerships', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([])).onCall(1).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      sinon.stub(queries.project, 'deleteIndigenousPartnershipsSQL').returns(null);

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        partnerships: new projectCreateModels.PostPartnershipsData()
      };

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.updateProjectPartnershipsData(projectId, entities);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL delete statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 400 response when no sql statement produced for Stakeholder Partnerships', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([])).onCall(1).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      sinon.stub(queries.project, 'deleteStakeholderPartnershipsSQL').returns(null);

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        partnerships: new projectCreateModels.PostPartnershipsData()
      };

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.updateProjectPartnershipsData(projectId, entities);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL delete statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 409 response when delete indigenous partnerships fails', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve(null)).onCall(1).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        iucn: new projectCreateModels.PostPartnershipsData()
      };

      sinon.stub(queries.project, 'deleteIndigenousPartnershipsSQL').returns(SQL`valid sql`);
      sinon.stub(queries.project, 'deleteStakeholderPartnershipsSQL').returns(SQL`valid sql`);

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.updateProjectPartnershipsData(projectId, entities);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to delete project indigenous partnerships data');
        expect((actualError as HTTPError).status).to.equal(409);
      }
    });

    it('should throw a 409 response when delete stakeholder partnerships fails', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([])).onCall(1).returns(Promise.resolve(null));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        partnerships: new projectCreateModels.PostPartnershipsData()
      };

      sinon.stub(queries.project, 'deleteIndigenousPartnershipsSQL').returns(SQL`valid sql`);
      sinon.stub(queries.project, 'deleteStakeholderPartnershipsSQL').returns(SQL`valid sql`);

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.updateProjectPartnershipsData(projectId, entities);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to delete project stakeholder partnerships data');
        expect((actualError as HTTPError).status).to.equal(409);
      }
    });

    it('should insert the new partnerships information', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([])).onCall(1).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        partnerships: {
          indigenous_partnerships: [1, 2, 3],
          stakeholder_partnerships: ['partner1', 'partner2']
        }
      };

      sinon.stub(queries.project, 'deleteIndigenousPartnershipsSQL').returns(SQL`valid sql`);
      sinon.stub(queries.project, 'deleteStakeholderPartnershipsSQL').returns(SQL`valid sql`);

      const insertIndigenousPartnershipStub = sinon
        .stub(ProjectService.prototype, 'insertIndigenousNation')
        .resolves(1);
      const insertStakeholderPartnershipStub = sinon
        .stub(ProjectService.prototype, 'insertStakeholderPartnership')
        .resolves(1);

      const projectService = new ProjectService(mockDBConnection);

      await projectService.updateProjectPartnershipsData(projectId, entities);

      expect(insertIndigenousPartnershipStub).to.have.been.calledThrice;
      expect(insertStakeholderPartnershipStub).to.have.been.calledTwice;
    });
  });

  describe('updateProjectFundingData', () => {
    afterEach(() => {
      sinon.restore();
    });
    it('should throw a 409 response when deleting funding data fails', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve(null)).onCall(1).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue
      };

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.updateProjectPermitData(projectId, entities);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Missing request body entity `permit`');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should insert the new funding information', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([])).onCall(1).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        funding: {
          fundingSources: [
            {
              agency_id: 16,
              agency_name: 'My agency',
              agency_project_id: 'ABC123',
              start_date: '2022-03-01',
              end_date: '2022-03-26',
              funding_amount: 222,
              id: 0,
              investment_action_category: 55,
              investment_action_category_name: '',
              revision_count: 0
            }
          ]
        }
      };

      const insertFundingSourceStub = sinon.stub(ProjectService.prototype, 'insertFundingSource').resolves(1);

      const projectService = new ProjectService(mockDBConnection);

      await projectService.updateProjectFundingData(projectId, entities);

      expect(insertFundingSourceStub).to.have.been.calledOnce;
    });
  });

  describe('updateProjectSpatialData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 response when no sql statement produced for deleteProjectSpatialSQL', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([])).onCall(1).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      sinon.stub(queries.project, 'deleteProjectSpatialSQL').returns(null);

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        location: new projectUpdateModels.PutLocationData()
      };

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.updateProjectSpatialData(projectId, entities);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL delete statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 409 response when if fails to delete the spatial data', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve(null)).onCall(1).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      sinon.stub(queries.project, 'deleteProjectSpatialSQL').returns(SQL`valid SQL`);

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        location: new projectUpdateModels.PutLocationData()
      };

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.updateProjectSpatialData(projectId, entities);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to delete spatial data');
        expect((actualError as HTTPError).status).to.equal(409);
      }
    });

    it('should throw a 400 response when no sql statement produced for postProjectBoundarySQL', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([])).onCall(1).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      sinon.stub(queries.project, 'deleteProjectSpatialSQL').returns(SQL`valid sql`);
      sinon.stub(queries.project, 'postProjectBoundarySQL').returns(null);

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        location: new projectUpdateModels.PutLocationData()
      };

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.updateProjectSpatialData(projectId, entities);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL update statement');
        expect((actualError as HTTPError).status).to.equal(400);
      }
    });

    it('should throw a 409 when it fails to update the project spatial data', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([])).onCall(1).returns(Promise.resolve(null));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });
      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        location: {
          geometry: [({} as unknown) as Feature],
          priority: 'true',
          region: 3640,
          range: 1234
        }
      };

      sinon.stub(queries.project, 'deleteProjectSpatialSQL').returns(SQL`valid sql`);
      sinon.stub(queries.project, 'postProjectBoundarySQL').returns(SQL`valid sql`);

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.updateProjectSpatialData(projectId, entities);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to insert project spatial data');
        expect((actualError as HTTPError).status).to.equal(409);
      }
    });
  });

  describe('updateProjectRegionData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 response when no sql statement produced for deleteProjectRegionSQL', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([])).onCall(1).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      sinon.stub(queries.project, 'deleteProjectRegionSQL').returns(null);

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        location: new projectUpdateModels.PutLocationData()
      };

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.updateProjectRegionData(projectId, entities);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL delete statement');
        expect((actualError as HTTPError).status).to.equal(500);
      }
    });

    it('should insert the new region information', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([])).onCall(1).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        location: {
          geometry: [({} as unknown) as Feature],
          priority: 'true',
          region: 3640,
          range: 1234
        }
      };

      sinon.stub(queries.project, 'deleteProjectRegionSQL').returns(SQL`valid sql`);

      const insertRegionStub = sinon.stub(ProjectService.prototype, 'insertRegion').resolves(1);

      const projectService = new ProjectService(mockDBConnection);

      await projectService.updateProjectRegionData(projectId, entities);

      expect(insertRegionStub).to.have.been.calledOnce;
    });
  });

  describe('updateProjectRangeData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 response when no sql statement produced for deleteProjectRangeSQL', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([])).onCall(1).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      sinon.stub(queries.project, 'deleteProjectRangeSQL').returns(null);

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        location: new projectUpdateModels.PutLocationData()
      };

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.updateProjectRangeData(projectId, entities);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL delete statement');
        expect((actualError as HTTPError).status).to.equal(500);
      }
    });

    it('should insert the new range information', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([])).onCall(1).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        location: {
          geometry: [({} as unknown) as Feature],
          priority: 'true',
          region: 3640,
          range: 1234
        }
      };

      sinon.stub(queries.project, 'deleteProjectRangeSQL').returns(SQL`valid sql`);

      const insertRangeStub = sinon.stub(ProjectService.prototype, 'insertRange').resolves(1);

      const projectService = new ProjectService(mockDBConnection);

      await projectService.updateProjectRangeData(projectId, entities);

      expect(insertRangeStub).to.have.been.calledOnce;
    });
  });

  describe('updateProjectSpeciesData', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 response when no sql statement produced for deleteProjectSpeciesSQL', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([])).onCall(1).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      sinon.stub(queries.project, 'deleteProjectSpeciesSQL').returns(null);

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        species: new projectUpdateModels.PutSpeciesData()
      };

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.updateProjectSpeciesData(projectId, entities);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Failed to build SQL delete statement');
        expect((actualError as HTTPError).status).to.equal(500);
      }
    });

    it('should insert the new species information', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([])).onCall(1).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      const projectId = 1;
      const entities: IUpdateProject = {
        ...entitiesInitValue,
        species: {
          focal_species: [1, 2],
          focal_species_names: ['abc', 'def']
        }
      };

      sinon.stub(queries.project, 'deleteProjectSpeciesSQL').returns(SQL`valid sql`);

      const insertSpeciesStub = sinon.stub(ProjectService.prototype, 'insertSpecies').resolves();

      const projectService = new ProjectService(mockDBConnection);

      await projectService.updateProjectSpeciesData(projectId, entities);

      expect(insertSpeciesStub).to.have.been.calledTwice;
    });
  });

  describe('getProjectsByIds', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should get a project list that is not public', async () => {
      const mockQuery = sinon.stub().onCall(0).returns(Promise.resolve([])).onCall(1).returns(Promise.resolve([]));

      const mockDBConnection = getMockDBConnection({
        query: mockQuery
      });

      const projectIds = [1, 2, 3];
      const isPublic = false;

      const getProjectByIdStub = sinon.stub(ProjectService.prototype, 'getProjectById').resolves();

      const projectService = new ProjectService(mockDBConnection);

      await projectService.getProjectsByIds(projectIds, isPublic);

      expect(getProjectByIdStub).to.have.been.calledThrice;
    });
  });
});
