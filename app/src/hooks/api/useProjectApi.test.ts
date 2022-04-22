import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  ICreateProjectRequest,
  IGetProjectForViewResponseContact,
  IGetProjectForViewResponseDetails,
  IGetProjectForViewResponseFundingData,
  IGetProjectForViewResponseIUCN,
  IGetProjectForViewResponseLocation,
  IGetProjectForViewResponsePartnerships,
  IGetProjectForViewResponsePermit,
  IGetProjectForViewResponseSpecies,
  IPostTreatmentUnitResponse
} from 'interfaces/useProjectApi.interface';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import useProjectApi, { usePublicProjectApi } from './useProjectApi';

describe('useProjectApi', () => {
  let mock: any;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  const userId = 123;
  const projectId = 1;
  const attachmentId = 1;
  const treatmentUnitId = 1;

  it('getAllUserProjectsParticipation works as expected', async () => {
    mock.onGet(`/api/user/${userId}/projects/participation/list`).reply(200, [
      {
        project_id: 321,
        name: 'test',
        system_user_id: 1,
        project_role_id: 2,
        project_participation_id: 3
      }
    ]);

    const result = await useProjectApi(axios).getAllUserProjectsParticipation(123);

    expect(result[0]).toEqual({
      project_id: 321,
      name: 'test',
      system_user_id: 1,
      project_role_id: 2,
      project_participation_id: 3
    });
  });

  it('getUserProjectsList works as expected', async () => {
    mock.onGet(`/api/user/${userId}/projects/list`).reply(200, [
      {
        project: {
          project_id: 1
        }
      }
    ]);

    const result = await useProjectApi(axios).getUserProjectsList(123);

    expect(result[0]).toEqual({
      project: {
        project_id: 1
      }
    });
  });

  it('getProjectAttachments works as expected', async () => {
    mock.onGet(`/api/project/${projectId}/attachments/list`).reply(200, {
      attachmentsList: [
        {
          id: 1,
          fileName: 'filename',
          lastModified: '2020/04/04',
          size: 3028
        }
      ]
    });

    const result = await useProjectApi(axios).getProjectAttachments(projectId);

    expect(result.attachmentsList).toEqual([
      {
        id: 1,
        fileName: 'filename',
        lastModified: '2020/04/04',
        size: 3028
      }
    ]);
  });

  it('deleteProject works as expected', async () => {
    mock.onDelete(`/api/project/${projectId}/delete`).reply(200, true);

    const result = await useProjectApi(axios).deleteProject(projectId);

    expect(result).toEqual(true);
  });

  it('deleteProjectAttachment works as expected', async () => {
    mock.onDelete(`/api/project/${projectId}/attachments/${attachmentId}/delete`).reply(200, 1);

    const result = await useProjectApi(axios).deleteProjectAttachment(projectId, attachmentId);

    expect(result).toEqual(1);
  });

  it('getProjectsList works as expected', async () => {
    const response = [
      {
        id: 1,
        name: 'project name',
        objectives: 'objectives',
        start_date: '2020/04/04',
        end_date: '2020/05/05',
        focal_species_name_list: 'focal'
      }
    ];

    mock.onGet(`/api/project/list`).reply(200, response);

    const result = await useProjectApi(axios).getProjectsList();

    expect(result).toEqual(response);
  });

  it('getProjectById works as expected', async () => {
    mock.onGet(`/api/project/${projectId}/view`).reply(200, getProjectForViewResponse);

    const result = await useProjectApi(axios).getProjectById(projectId);

    expect(result).toEqual(getProjectForViewResponse);
  });

  it('addFundingSource works as expected', async () => {
    mock.onPost(`/api/project/${projectId}/funding-sources/add`).reply(200, {
      id: 1
    });

    const result = await useProjectApi(axios).addFundingSource(projectId, {
      funding_source_name: 'funding source name'
    });

    expect(result).toEqual({ id: 1 });
  });

  it('deleteFundingSource works as expected', async () => {
    const pfsId = 2;

    mock.onDelete(`/api/project/${projectId}/funding-sources/${pfsId}/delete`).reply(200, true);

    const result = await useProjectApi(axios).deleteFundingSource(projectId, pfsId);

    expect(result).toEqual(true);
  });

  it('uploadProjectAttachments works as expected', async () => {
    const file = new File(['foo'], 'foo.txt', {
      type: 'text/plain'
    });

    mock.onPost(`/api/project/${projectId}/attachments/upload`).reply(200, 'result 1');

    const result = await useProjectApi(axios).uploadProjectAttachments(projectId, file);

    expect(result).toEqual('result 1');
  });

  it('createProject works as expected', async () => {
    const projectData = ({} as unknown) as ICreateProjectRequest;

    mock.onPost('/api/project/create').reply(200, {
      id: 1
    });

    const result = await useProjectApi(axios).createProject(projectData);

    expect(result).toEqual({ id: 1 });
  });

  it('getProjectParticipants works as expected', async () => {
    const mockResponse = { participants: [] };
    mock.onGet(`/api/project/${projectId}/participants/get`).reply(200, mockResponse);

    const result = await useProjectApi(axios).getProjectParticipants(projectId);

    expect(result).toEqual(mockResponse);
  });

  it('addProjectParticipants works as expected', async () => {
    mock.onPost(`/api/project/${projectId}/participants/create`).reply(200);

    const result = await useProjectApi(axios).addProjectParticipants(projectId, [
      { userIdentifier: 'user1', identitySource: 'idir', roleId: 1 }
    ]);

    expect(result).toEqual(true);
  });

  it('removeProjectParticipant works as expected', async () => {
    const projectParticipationId = 1;

    mock.onDelete(`/api/project/${projectId}/participants/${projectParticipationId}/delete`).reply(200);

    const result = await useProjectApi(axios).removeProjectParticipant(projectId, projectParticipationId);

    expect(result).toEqual(true);
  });

  it('removeProjectParticipant works as expected', async () => {
    const projectParticipationId = 1;
    const projectRoleId = 1;

    mock.onPut(`/api/project/${projectId}/participants/${projectParticipationId}/update`).reply(200);

    const result = await useProjectApi(axios).updateProjectParticipantRole(
      projectId,
      projectParticipationId,
      projectRoleId
    );

    expect(result).toEqual(true);
  });

  it('deleteProjectTreatmentUnit works as expected', async () => {
    mock.onDelete(`/api/project/${projectId}/treatments/treatment-unit/${treatmentUnitId}/delete`).reply(200);

    const result = await useProjectApi(axios).deleteProjectTreatmentUnit(projectId, treatmentUnitId);

    expect(result).toEqual(true);
  });

  it('deleteProjectTreatments works as expected', async () => {
    mock.onDelete(`/api/project/${projectId}/treatments/delete`).reply(200);

    const result = await useProjectApi(axios).deleteProjectTreatments(projectId);

    expect(result).toEqual(true);
  });

  it('getProjectTreatments works as expected', async () => {
    const mockResponse = { treatmentList: [] };
    mock.onGet(`/api/project/${projectId}/treatments/list`).reply(200, mockResponse);

    const result = await useProjectApi(axios).getProjectTreatments(projectId);

    expect(result).toEqual(mockResponse);
  });

  it('getProjectTreatmentsYears works as expected', async () => {
    const mockResponse = [{ year: 1 }];
    mock.onGet(`/api/project/${projectId}/treatments/year/list`).reply(200, mockResponse);

    const result = await useProjectApi(axios).getProjectTreatmentsYears(projectId);

    expect(result).toEqual(mockResponse);
  });

  it('importProjectTreatmentSpatialFile works as expected', async () => {
    const treatmentResponse = { treatment_unit_id: 1, revision_count: 2 } as IPostTreatmentUnitResponse;

    mock.onPost(`/api/project/${projectId}/treatments/upload`).reply(200, treatmentResponse);

    const result = await useProjectApi(axios).importProjectTreatmentSpatialFile(1, {} as File);

    expect(result).toEqual(treatmentResponse);
  });

  it('updateProject works as expected', async () => {
    const mockResponse = [{ id: 1 }];
    mock.onPut(`/api/project/${projectId}/update`).reply(200, mockResponse);

    const newProjectData = {
      project: {} as IGetProjectForViewResponseDetails,
      species: {} as IGetProjectForViewResponseSpecies,
      permit: {} as IGetProjectForViewResponsePermit,
      location: {} as IGetProjectForViewResponseLocation,
      contact: {} as IGetProjectForViewResponseContact,
      iucn: {} as IGetProjectForViewResponseIUCN,
      funding: {} as IGetProjectForViewResponseFundingData,
      partnerships: {} as IGetProjectForViewResponsePartnerships
    };

    const result = await useProjectApi(axios).updateProject(projectId, newProjectData);

    expect(result).toEqual([{ id: 1 }]);
  });
});

describe('usePublicProjectApi', () => {
  let mock: any;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  const projectId = 1;

  it('getProjectsList works as expected', async () => {
    const response = [
      {
        id: 1,
        name: 'project name',
        objectives: 'objectives',
        start_date: '2020/04/04',
        end_date: '2020/05/05',
        focal_species_name_list: 'focal'
      }
    ];

    mock.onGet(`/api/public/projects`).reply(200, response);

    const result = await usePublicProjectApi(axios).getProjectsList();

    expect(result).toEqual(response);
  });

  it('getProjectById works as expected', async () => {
    mock.onGet(`/api/public/project/${projectId}/view`).reply(200, getProjectForViewResponse);

    const result = await usePublicProjectApi(axios).getProjectForView(projectId);

    expect(result).toEqual(getProjectForViewResponse);
  });

  it('getProjectAttachments works as expected', async () => {
    mock.onGet(`/api/public/project/${projectId}/attachments/list`).reply(200, {
      attachmentsList: [
        {
          id: 1,
          fileName: 'filename',
          lastModified: '2020/04/04',
          size: 3028
        }
      ]
    });

    const result = await usePublicProjectApi(axios).getProjectAttachments(projectId);

    expect(result.attachmentsList).toEqual([
      {
        id: 1,
        fileName: 'filename',
        lastModified: '2020/04/04',
        size: 3028
      }
    ]);
  });

  it('getProjectTreatments works as expected', async () => {
    const mockResponse = { treatmentList: [] };
    mock.onGet(`/api/public/project/${projectId}/treatments/list`).reply(200, mockResponse);

    const result = await usePublicProjectApi(axios).getProjectTreatments(projectId);

    expect(result).toEqual(mockResponse);
  });

  it('getProjectTreatmentsYears works as expected', async () => {
    const mockResponse = [{ year: 1 }];
    mock.onGet(`/api/public/project/${projectId}/treatments/year/list`).reply(200, mockResponse);

    const result = await usePublicProjectApi(axios).getProjectTreatmentsYears(projectId);

    expect(result).toEqual(mockResponse);
  });
});
