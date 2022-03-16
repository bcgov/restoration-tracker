import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import { HTTPError } from '../errors/custom-error';
import * as projectViewModels from '../models/project-view';
import { queries } from '../queries/queries';
import { getMockDBConnection } from '../__mocks__/db';
import { ProjectService } from './project-service';
import * as projectCreateModels from '../models/project-create';

chai.use(sinonChai);

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

  describe('getProjectById', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('returns project details on success', async () => {
      const mockRowObj = [{ project_id: 1 }];

      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'getProjectSQL').returns(SQL`valid sql`);

      const projectId = 1;
      const isPublic = false;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getProjectById(projectId, isPublic);

      expect(result).to.deep.include({
        project: new projectViewModels.GetProjectData(mockRowObj[0]),
        iucn: new projectViewModels.GetIUCNClassificationData(mockRowObj),
        contact: new projectViewModels.GetContactData(mockRowObj),
        permit: new projectViewModels.GetPermitData(mockRowObj),
        partnerships: new projectViewModels.GetPartnershipsData(mockRowObj, mockRowObj),
        funding: new projectViewModels.GetFundingData(mockRowObj),
        location: new projectViewModels.GetLocationData(mockRowObj)
      });
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

    it('returns row on success', async () => {
      const mockRowObj = [{ project_id: 1 }];

      const mockQueryResponse = ({ rows: mockRowObj } as unknown) as QueryResult<any>;
      const mockDBConnection = getMockDBConnection({ query: async () => mockQueryResponse });

      sinon.stub(queries.project, 'getProjectSQL').returns(SQL`valid sql`);

      const projectId = 1;

      const projectService = new ProjectService(mockDBConnection);

      const result = await projectService.getContactData(projectId, false);

      expect(result).to.deep.include(new projectViewModels.GetContactData(mockRowObj));
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

      const projectData = {
        ...new projectCreateModels.PostProjectData(),
        ...new projectCreateModels.PostContactData()
      };

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
});
