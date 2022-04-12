import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Router } from 'react-router';
import { useRestorationTrackerApi } from '../../../hooks/useRestorationTrackerApi';
import UsersDetailProjects from './UsersDetailProjects';
import { DialogContextProvider } from 'contexts/dialogContext';
import { IGetUserProjectsListResponse } from '../../../interfaces/useProjectApi.interface';
import { IGetUserResponse } from 'interfaces/useUserApi.interface';
import useCodes from 'hooks/useCodes';
import { codes } from 'test-helpers/code-helpers';

const history = createMemoryHistory();

jest.mock('../../../hooks/useRestorationTrackerApi');

const mockuseRestorationTrackerApi = {
  project: {
    getAllUserProjectsParticipation: jest.fn<Promise<IGetUserProjectsListResponse[]>, []>(),
    removeProjectParticipant: jest.fn<Promise<boolean>, []>(),
    updateProjectParticipantRole: jest.fn<Promise<boolean>, []>()
  }
};

const mockRestorationTrackerApi = ((useRestorationTrackerApi as unknown) as jest.Mock<
  typeof mockuseRestorationTrackerApi
>).mockReturnValue(mockuseRestorationTrackerApi);

jest.mock('../../../hooks/useCodes');
const mockUseCodes = (useCodes as unknown) as jest.MockedFunction<typeof useCodes>;

const mockUser = {
  id: 1,
  record_end_date: 'ending',
  user_identifier: 'testUser',
  role_names: ['system']
} as IGetUserResponse;

describe('UsersDetailProjects', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockRestorationTrackerApi().project.getAllUserProjectsParticipation.mockClear();
    mockUseCodes.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows circular spinner when assignedProjects not yet loaded', async () => {
    history.push('/admin/users/1');
    mockUseCodes.mockReturnValue({ codes: undefined, isLoading: true, isReady: false });

    const { getAllByTestId } = render(
      <Router history={history}>
        <UsersDetailProjects userDetails={mockUser} />
      </Router>
    );

    await waitFor(() => {
      expect(getAllByTestId('project-loading').length).toEqual(1);
    });
  });

  it('renders empty list correctly when assignedProjects empty and loaded', async () => {
    history.push('/admin/users/1');

    mockUseCodes.mockReturnValue({ codes: codes, isLoading: false, isReady: true });

    mockRestorationTrackerApi().project.getAllUserProjectsParticipation.mockResolvedValue({
      assignedProjects: []
    } as any);

    const { getAllByTestId, getAllByText } = render(
      <Router history={history}>
        <UsersDetailProjects userDetails={mockUser} />
      </Router>
    );

    await waitFor(() => {
      expect(getAllByTestId('projects_header').length).toEqual(1);
      expect(getAllByText('Assigned Projects ()').length).toEqual(1);
      expect(getAllByText('No Projects').length).toEqual(1);
    });
  });

  it('renders list of a single project correctly when assignedProjects are loaded', async () => {
    history.push('/admin/users/1');

    mockUseCodes.mockReturnValue({ codes: codes, isLoading: false, isReady: true });

    mockRestorationTrackerApi().project.getAllUserProjectsParticipation.mockResolvedValue([
      {
        project_id: 2,
        name: 'projectName',
        system_user_id: 1,
        project_role_id: 3,
        project_participation_id: 4
      }
    ]);

    const { getAllByTestId, getAllByText } = render(
      <Router history={history}>
        <UsersDetailProjects userDetails={mockUser} />
      </Router>
    );

    await waitFor(() => {
      expect(getAllByTestId('projects_header').length).toEqual(1);
      expect(getAllByText('Assigned Projects (1)').length).toEqual(1);
      expect(getAllByText('projectName').length).toEqual(1);
    });
  });

  it('renders list of a multiple projects correctly when assignedProjects are loaded', async () => {
    history.push('/admin/users/1');

    mockUseCodes.mockReturnValue({ codes: codes, isLoading: false, isReady: true });

    mockRestorationTrackerApi().project.getAllUserProjectsParticipation.mockResolvedValue([
      {
        project_id: 1,
        name: 'projectName',
        system_user_id: 2,
        project_role_id: 3,
        project_participation_id: 4
      },
      {
        project_id: 5,
        name: 'secondProjectName',
        system_user_id: 6,
        project_role_id: 7,
        project_participation_id: 8
      }
    ]);

    const { getAllByTestId, getAllByText } = render(
      <Router history={history}>
        <UsersDetailProjects userDetails={mockUser} />
      </Router>
    );

    await waitFor(() => {
      expect(getAllByTestId('projects_header').length).toEqual(1);
      expect(getAllByText('Assigned Projects (2)').length).toEqual(1);
      expect(getAllByText('projectName').length).toEqual(1);
      expect(getAllByText('secondProjectName').length).toEqual(1);
    });
  });

  it('routes to project id details on click', async () => {
    history.push('/admin/users/1');

    mockUseCodes.mockReturnValue({ codes: codes, isLoading: false, isReady: true });

    mockRestorationTrackerApi().project.getAllUserProjectsParticipation.mockResolvedValue([
      {
        project_id: 1,
        name: 'projectName',
        system_user_id: 2,
        project_role_id: 3,
        project_participation_id: 4
      }
    ]);

    const { getAllByText, getByText } = render(
      <Router history={history}>
        <UsersDetailProjects userDetails={mockUser} />
      </Router>
    );

    await waitFor(() => {
      expect(getAllByText('projectName').length).toEqual(1);
    });

    fireEvent.click(getByText('projectName'));

    await waitFor(() => {
      expect(history.location.pathname).toEqual('/admin/projects/1/details');
    });
  });

  describe('Are you sure? Dialog', () => {
    it('does nothing if the user clicks `No` or away from the dialog', async () => {
      history.push('/admin/users/1');

      mockUseCodes.mockReturnValue({ codes: codes, isLoading: false, isReady: true });

      mockRestorationTrackerApi().project.getAllUserProjectsParticipation.mockResolvedValue([
        {
          project_id: 1,
          name: 'projectName',
          system_user_id: 2,
          project_role_id: 3,
          project_participation_id: 4
        }
      ]);

      const { getAllByText, getByTestId, getByText } = render(
        <DialogContextProvider>
          <Router history={history}>
            <UsersDetailProjects userDetails={mockUser} />
          </Router>
        </DialogContextProvider>
      );

      await waitFor(() => {
        expect(getAllByText('projectName').length).toEqual(1);
      });

      fireEvent.click(getByTestId('remove-project-participant-button'));

      await waitFor(() => {
        expect(getAllByText('Remove User From Project').length).toEqual(1);
      });

      fireEvent.click(getByText('Cancel'));

      await waitFor(() => {
        expect(history.location.pathname).toEqual('/admin/users/1');
      });
    });

    it('deletes User from project if the user clicks on `Remove User` ', async () => {
      history.push('/admin/users/1');

      mockUseCodes.mockReturnValue({ codes: codes, isLoading: false, isReady: true });

      mockRestorationTrackerApi().project.removeProjectParticipant.mockResolvedValue(true);

      mockRestorationTrackerApi().project.getAllUserProjectsParticipation.mockResolvedValue([
        {
          project_id: 1,
          name: 'projectName',
          system_user_id: 2,
          project_role_id: 3,
          project_participation_id: 4
        },
        {
          project_id: 5,
          name: 'secondProjectName',
          system_user_id: 6,
          project_role_id: 7,
          project_participation_id: 8
        }
      ]);

      const { getAllByText, getByText, getAllByTestId } = render(
        <DialogContextProvider>
          <Router history={history}>
            <UsersDetailProjects userDetails={mockUser} />
          </Router>
        </DialogContextProvider>
      );

      await waitFor(() => {
        expect(getAllByText('Assigned Projects (2)').length).toEqual(1);
        expect(getAllByText('projectName').length).toEqual(1);
        expect(getAllByText('secondProjectName').length).toEqual(1);
      });

      mockRestorationTrackerApi().project.getAllUserProjectsParticipation.mockResolvedValue([
        {
          project_id: 5,
          name: 'secondProjectName',
          system_user_id: 6,
          project_role_id: 7,
          project_participation_id: 8
        }
      ]);

      fireEvent.click(getAllByTestId('remove-project-participant-button')[0]);

      await waitFor(() => {
        expect(getAllByText('Remove User From Project').length).toEqual(1);
      });

      fireEvent.click(getByText('Remove User'));

      await waitFor(() => {
        expect(getAllByText('Assigned Projects (1)').length).toEqual(1);
        expect(getAllByText('secondProjectName').length).toEqual(1);
      });
    });
  });

  describe('Change users Project Role', () => {
    it('renders list of roles to change per project', async () => {
      history.push('/admin/users/1');

      mockUseCodes.mockReturnValue({
        codes: {
          ...codes,
          coordinator_agency: [{ id: 1, name: 'agency 1' }],
          project_roles: [
            { id: 1, name: 'Project Lead' },
            { id: 2, name: 'Editor' },
            { id: 3, name: 'Viewer' }
          ]
        },
        isLoading: false,
        isReady: true
      });

      mockRestorationTrackerApi().project.getAllUserProjectsParticipation.mockResolvedValue([
        {
          project_id: 2,
          name: 'projectName',
          system_user_id: 1,
          project_role_id: 3,
          project_participation_id: 4
        }
      ]);

      const { getAllByText, getByText } = render(
        <Router history={history}>
          <UsersDetailProjects userDetails={mockUser} />
        </Router>
      );

      await waitFor(() => {
        expect(getAllByText('Assigned Projects (1)').length).toEqual(1);
        expect(getAllByText('projectName').length).toEqual(1);
      });

      fireEvent.click(getByText('Viewer'));

      await waitFor(() => {
        expect(getAllByText('Project Lead').length).toEqual(1);
        expect(getAllByText('Editor').length).toEqual(1);
        expect(getAllByText('Viewer').length).toEqual(2);
      });
    });

    it('renders dialog pop on role selection, does nothing if user clicks `Cancel` ', async () => {
      history.push('/admin/users/1');

      mockUseCodes.mockReturnValue({
        codes: {
          ...codes,
          coordinator_agency: [{ id: 1, name: 'agency 1' }],
          project_roles: [
            { id: 1, name: 'Project Lead' },
            { id: 2, name: 'Editor' },
            { id: 3, name: 'Viewer' }
          ]
        },
        isLoading: false,
        isReady: true
      });

      mockRestorationTrackerApi().project.getAllUserProjectsParticipation.mockResolvedValue([
        {
          project_id: 2,
          name: 'projectName',
          system_user_id: 1,
          project_role_id: 3,
          project_participation_id: 4
        }
      ]);

      const { getAllByText, getByText } = render(
        <DialogContextProvider>
          <Router history={history}>
            <UsersDetailProjects userDetails={mockUser} />
          </Router>
        </DialogContextProvider>
      );

      await waitFor(() => {
        expect(getAllByText('Assigned Projects (1)').length).toEqual(1);
        expect(getAllByText('projectName').length).toEqual(1);
      });

      fireEvent.click(getByText('Viewer'));

      await waitFor(() => {
        expect(getAllByText('Project Lead').length).toEqual(1);
        expect(getAllByText('Editor').length).toEqual(1);
        expect(getAllByText('Viewer').length).toEqual(2);
      });

      fireEvent.click(getByText('Editor'));

      await waitFor(() => {
        expect(getAllByText('Change Project Role?').length).toEqual(1);
      });

      fireEvent.click(getByText('Cancel'));

      await waitFor(() => {
        expect(history.location.pathname).toEqual('/admin/users/1');
      });
    });

    it('renders dialog pop on role selection, Changes role on click of `Change Role` ', async () => {
      history.push('/admin/users/1');

      mockUseCodes.mockReturnValue({
        codes: {
          ...codes,
          coordinator_agency: [{ id: 1, name: 'agency 1' }],
          project_roles: [
            { id: 1, name: 'Project Lead' },
            { id: 2, name: 'Editor' },
            { id: 3, name: 'Viewer' }
          ]
        },
        isLoading: false,
        isReady: true
      });

      mockRestorationTrackerApi().project.getAllUserProjectsParticipation.mockResolvedValue([
        {
          project_id: 2,
          name: 'projectName',
          system_user_id: 1,
          project_role_id: 3,
          project_participation_id: 4
        }
      ]);

      mockRestorationTrackerApi().project.updateProjectParticipantRole.mockResolvedValue(true);

      const { getAllByText, getByText } = render(
        <DialogContextProvider>
          <Router history={history}>
            <UsersDetailProjects userDetails={mockUser} />
          </Router>
        </DialogContextProvider>
      );

      await waitFor(() => {
        expect(getAllByText('Assigned Projects (1)').length).toEqual(1);
        expect(getAllByText('projectName').length).toEqual(1);
      });

      fireEvent.click(getByText('Viewer'));

      await waitFor(() => {
        expect(getAllByText('Project Lead').length).toEqual(1);
        expect(getAllByText('Editor').length).toEqual(1);
        expect(getAllByText('Viewer').length).toEqual(2);
      });

      fireEvent.click(getByText('Editor'));

      await waitFor(() => {
        expect(getAllByText('Change Project Role?').length).toEqual(1);
      });

      fireEvent.click(getByText('Change Role'));

      await waitFor(() => {
        expect(getAllByText('Editor').length).toEqual(1);
      });
    });
  });
});
