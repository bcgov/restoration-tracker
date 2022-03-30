import { cleanup, render, waitFor } from '@testing-library/react';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext, IAuthState } from 'contexts/authStateContext';
import { createMemoryHistory } from 'history';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { Router } from 'react-router';
import { getMockAuthState } from 'test-helpers/auth-helpers';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import ViewProjectPage from './ViewProjectPage';

const history = createMemoryHistory();

jest.mock('../../../hooks/useRestorationTrackerApi');
const mockuseRestorationTrackerApi = {
  project: {
    getProjectById: jest.fn<Promise<IGetProjectForViewResponse>, [number]>(),
    getProjectTreatmentsYears: jest.fn<Promise<{ year: number }[]>, [number]>()
  },
  codes: {
    getAllCodeSets: jest.fn<Promise<IGetAllCodeSetsResponse>, []>()
  }
};

const defaultAuthState = {
  keycloakWrapper: {
    keycloak: {
      authenticated: true
    },
    hasLoadedAllUserInfo: true,
    systemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN] as string[],
    getUserIdentifier: () => 'testuser',
    hasAccessRequest: false,
    hasSystemRole: () => true,
    getIdentitySource: () => 'idir',
    username: 'testusername',
    displayName: 'testdisplayname',
    email: 'test@email.com',
    firstName: 'testfirst',
    lastName: 'testlast',
    refresh: () => {}
  }
};

const mockRestorationTrackerApi = ((useRestorationTrackerApi as unknown) as jest.Mock<
  typeof mockuseRestorationTrackerApi
>).mockReturnValue(mockuseRestorationTrackerApi);

describe('ViewProjectPage', () => {
  beforeEach(() => {
    mockRestorationTrackerApi().project.getProjectById.mockClear();
    mockRestorationTrackerApi().project.getProjectTreatmentsYears.mockClear();
    mockRestorationTrackerApi().codes.getAllCodeSets.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders component correctly', async () => {
    history.push('/admin/projects/1/details');

    mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue(codes);

    mockRestorationTrackerApi().project.getProjectById.mockResolvedValue(getProjectForViewResponse);

    mockRestorationTrackerApi().project.getProjectTreatmentsYears.mockResolvedValue([{ year: 99 }]);

    const authState = getMockAuthState({
      keycloakWrapper: {
        ...defaultAuthState.keycloakWrapper,
        systemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN] as string[],
        hasSystemRole: () => true
      }
    });

    const { getByTestId } = render(
      <AuthStateContext.Provider value={(authState as unknown) as IAuthState}>
        <Router history={history}>
          <ViewProjectPage />
        </Router>
      </AuthStateContext.Provider>
    );

    await waitFor(() => {
      expect(getByTestId('view_project_page_component')).toBeVisible();
    });
  });

  it('renders spinner when no codes is loaded', async () => {
    history.push('/admin/projects/1/details');

    mockRestorationTrackerApi().project.getProjectById.mockResolvedValue(getProjectForViewResponse);

    const authState = getMockAuthState({
      keycloakWrapper: {
        ...defaultAuthState.keycloakWrapper,
        systemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN] as string[],
        hasSystemRole: () => true
      }
    });

    const { getByTestId } = render(
      <AuthStateContext.Provider value={(authState as unknown) as IAuthState}>
        <Router history={history}>
          <ViewProjectPage />
        </Router>
      </AuthStateContext.Provider>
    );

    await waitFor(() => {
      expect(getByTestId('loading_spinner')).toBeVisible();
    });
  });

  it('renders spinner when no project is loaded', async () => {
    history.push('/admin/projects/1/details');

    mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue(codes);

    const authState = getMockAuthState({
      keycloakWrapper: {
        ...defaultAuthState.keycloakWrapper,
        systemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN] as string[],
        hasSystemRole: () => true
      }
    });

    const { getByTestId } = render(
      <AuthStateContext.Provider value={(authState as unknown) as IAuthState}>
        <Router history={history}>
          <ViewProjectPage />
        </Router>
      </AuthStateContext.Provider>
    );

    await waitFor(() => {
      expect(getByTestId('loading_spinner')).toBeVisible();
    });
  });
});
