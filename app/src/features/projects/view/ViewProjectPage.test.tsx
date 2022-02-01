import { render, cleanup } from '@testing-library/react';
import { SYSTEM_ROLE } from 'constants/roles';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { Router } from 'react-router';
import { createMemoryHistory } from 'history';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import React from 'react';
import ViewProjectPage from './ViewProjectPage';
import { AuthStateContext, IAuthState } from 'contexts/authStateContext';
import { DialogContextProvider } from 'contexts/dialogContext';

//import { codes } from 'test-helpers/code-helpers';

const history = createMemoryHistory();

jest.mock('../../../hooks/useRestorationTrackerApi');
const mockuseRestorationTrackerApi = {
  project: {
    getProjectById: jest.fn<Promise<IGetProjectForViewResponse>, [number]>()
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
//const mockRefresh = jest.fn();

describe('IUCNClassification', () => {
  beforeEach(() => {
    mockRestorationTrackerApi().project.getProjectById.mockClear();
    mockRestorationTrackerApi().codes.getAllCodeSets.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders component correctly', async () => {
    history.push('/admin/projects/1/details');

    mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue({
      coordinator_agency: [{ id: 1, name: 'agency 1' }]
    } as any);

    mockRestorationTrackerApi().project.getProjectById.mockResolvedValue(getProjectForViewResponse);

    const authState = {
      keycloakWrapper: {
        ...defaultAuthState.keycloakWrapper,
        systemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN] as string[],
        hasSystemRole: () => true
      }
    };

    const { getByTestId } = render(
      <AuthStateContext.Provider value={(authState as unknown) as IAuthState}>
        <DialogContextProvider>
          <Router history={history}>
            <ViewProjectPage />
          </Router>
        </DialogContextProvider>
      </AuthStateContext.Provider>
    );

    expect(getByTestId('viewProjectPageContainer')).toBeVisible();
  });
});
