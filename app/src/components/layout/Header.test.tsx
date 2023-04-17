import { fireEvent, render, waitFor } from '@testing-library/react';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { createMemoryHistory } from 'history';
import { SYSTEM_IDENTITY_SOURCE } from 'hooks/useKeycloakWrapper';
import React from 'react';
import { Router } from 'react-router-dom';
import { getMockAuthState } from 'test-helpers/auth-helpers';
import Header from './Header';

const history = createMemoryHistory();

describe('Header', () => {
  it('renders correctly with project admin role', () => {
    const mockHasSystemRole = jest.fn();

    mockHasSystemRole.mockReturnValueOnce(false); // Return false when the `Manage Users` secure link is parsed

    const authState = getMockAuthState({
      keycloakWrapper: {
        keycloak: {
          authenticated: true
        },
        hasLoadedAllUserInfo: true,
        systemRoles: [SYSTEM_ROLE.PROJECT_CREATOR],
        getUserIdentifier: () => 'testuser',
        hasAccessRequest: false,
        hasSystemRole: mockHasSystemRole,
        getIdentitySource: () => 'idir',
        username: 'testusername',
        displayName: 'testdisplayname',
        email: 'test@email.com',
        refresh: () => {}
      }
    });

    const { getByText, queryByText } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <Header />
        </Router>
      </AuthStateContext.Provider>
    );

    expect(getByText('Projects')).toBeVisible();
    expect(queryByText('Manage Users')).not.toBeInTheDocument();
  });

  it('renders correctly with system admin role', () => {
    const mockHasSystemRole = jest.fn();

    mockHasSystemRole
      .mockReturnValueOnce(true) // Return true when the `Projects` secure link is parsed
      .mockReturnValueOnce(true) // Return true when the `Manage Users` secure link is parsed
      .mockReturnValueOnce(true); // Return true when the `Map` secure link is parsed

    const authState = getMockAuthState({
      keycloakWrapper: {
        keycloak: {
          authenticated: true
        },
        hasLoadedAllUserInfo: true,
        systemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN],
        getUserIdentifier: () => 'testuser',
        hasAccessRequest: false,
        hasSystemRole: mockHasSystemRole,
        getIdentitySource: () => SYSTEM_IDENTITY_SOURCE.IDIR,
        username: 'testusername',
        displayName: 'IDID / testusername',
        email: 'test@email',
        refresh: () => {}
      }
    });

    const { getByText } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <Header />
        </Router>
      </AuthStateContext.Provider>
    );

    expect(getByText('Projects')).toBeVisible();
    expect(getByText('Map')).toBeVisible();
    expect(getByText('Manage Users')).toBeVisible();
  });

  it('renders the username and logout button', () => {
    const authState = getMockAuthState({
      keycloakWrapper: {
        keycloak: {
          authenticated: true
        },
        hasLoadedAllUserInfo: true,
        systemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN],
        getUserIdentifier: () => 'testuser',
        hasAccessRequest: false,
        hasSystemRole: jest.fn(),
        getIdentitySource: () => SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS,
        username: 'testusername',
        displayName: 'testdisplayname',
        email: 'test@email.com',
        refresh: () => {}
      }
    });

    const { getByTestId, getByText } = render(
      <AuthStateContext.Provider value={authState}>
        <Router history={history}>
          <Header />
        </Router>
      </AuthStateContext.Provider>
    );

    expect(getByTestId('menu_log_out')).toBeVisible();

    expect(getByText('BCeID Business/testuser')).toBeVisible();
  });

  describe('Log Out', () => {
    it('redirects to the `/logout` page', async () => {
      const authState = getMockAuthState({
        keycloakWrapper: {
          keycloak: {
            authenticated: true
          },
          hasLoadedAllUserInfo: true,
          hasAccessRequest: false,
          systemRoles: [],
          getUserIdentifier: jest.fn(),
          hasSystemRole: jest.fn(),
          getIdentitySource: jest.fn(),
          username: 'testusername',
          displayName: 'testdisplayname',
          email: 'test@email.com',
          refresh: () => {}
        }
      });

      const { getByTestId } = render(
        <AuthStateContext.Provider value={authState}>
          <Router history={history}>
            <Header />
          </Router>
        </AuthStateContext.Provider>
      );

      fireEvent.click(getByTestId('menu_log_out'));

      waitFor(() => {
        expect(history.location.pathname).toEqual('/logout');
      });
    });
  });
});
