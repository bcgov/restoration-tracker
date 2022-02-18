import { cleanup, render, waitFor } from '@testing-library/react';
import { AuthStateContext } from 'contexts/authStateContext';
import { createMemoryHistory } from 'history';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetDraftsListResponse } from 'interfaces/useDraftApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { Router } from 'react-router-dom';
import { getMockAuthState } from 'test-helpers/auth-helpers';
import MyProjectsPage from './MyProjectsPage';

const history = createMemoryHistory();

jest.mock('../../hooks/useRestorationTrackerApi');
const mockUseRestorationTrackerApi = {
  codes: {
    getAllCodeSets: jest.fn<Promise<object>, []>()
  },
  project: {
    getUserProjectsList: jest.fn<Promise<IGetProjectForViewResponse[]>, []>()
  },
  draft: {
    getDraftsList: jest.fn<Promise<IGetDraftsListResponse[]>, []>()
  }
};

const mockRestorationTrackerApi = ((useRestorationTrackerApi as unknown) as jest.Mock<
  typeof mockUseRestorationTrackerApi
>).mockReturnValue(mockUseRestorationTrackerApi);

describe('MyProjectsPage', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders with the create project button when user has a valid system role', async () => {
    // Mock child projects list component
    jest.mock('../projects/list/ProjectsListPage', () => {
      return <></>;
    });

    mockRestorationTrackerApi().project.getUserProjectsList.mockResolvedValue([]);
    mockRestorationTrackerApi().draft.getDraftsList.mockResolvedValue([]);

    const authState = getMockAuthState({
      keycloakWrapper: {
        hasSystemRole: () => true
      }
    });

    const { getByText, getByTestId } = render(
      <Router history={history}>
        <AuthStateContext.Provider value={authState}>
          <MyProjectsPage />
        </AuthStateContext.Provider>
      </Router>
    );

    await waitFor(() => {
      expect(getByText('My Projects')).toBeInTheDocument();
      expect(getByTestId('create-project-button')).toBeInTheDocument();
    });
  });

  it('renders without the create project button when user does not have a valid system role', async () => {
    // Mock child projects list component
    jest.mock('../projects/list/ProjectsListPage', () => {
      return <></>;
    });

    const authState = getMockAuthState();

    const { getByText, queryByTestId } = render(
      <Router history={history}>
        <AuthStateContext.Provider value={authState}>
          <MyProjectsPage />
        </AuthStateContext.Provider>
      </Router>
    );

    await waitFor(() => {
      expect(getByText('My Projects')).toBeInTheDocument();
      expect(queryByTestId('create-project-button')).not.toBeInTheDocument();
    });
  });
});
