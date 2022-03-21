import { render } from '@testing-library/react';
import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Route, Router } from 'react-router';
import { getMockAuthState } from 'test-helpers/auth-helpers';
import { AuthGuard, NoRoleGuard, ProjectRoleGuard, RoleGuard, SystemRoleGuard, UnAuthGuard } from './Guards';

const history = createMemoryHistory({ initialEntries: ['test/123'] });

describe('Guards', () => {
  describe('RoleGuard', () => {
    describe('with no fallback', () => {
      it('renders the child when user has a matching valid system role', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { hasSystemRole: () => true, hasProjectRole: () => false }
        });

        const { getByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <RoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]} validProjectRoles={[]}>
                  <div data-testid="child-component" />
                </RoleGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(getByTestId('child-component')).toBeInTheDocument();
      });

      it('renders the child when user has a matching valid project role', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { hasSystemRole: () => false, hasProjectRole: () => true }
        });

        const { getByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <RoleGuard validSystemRoles={[]} validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD]}>
                  <div data-testid="child-component" />
                </RoleGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(getByTestId('child-component')).toBeInTheDocument();
      });

      it('renders the child when user has both a matching valid system and project role', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { hasSystemRole: () => true, hasProjectRole: () => true }
        });

        const { getByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <RoleGuard
                  validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}
                  validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD]}>
                  <div data-testid="child-component" />
                </RoleGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(getByTestId('child-component')).toBeInTheDocument();
      });

      it('does not render the child when user has no matching valid system or project roles', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { hasSystemRole: () => false, hasProjectRole: () => false }
        });

        const { queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <RoleGuard
                  validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}
                  validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD]}>
                  <div data-testid="child-component" />
                </RoleGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(queryByTestId('child-component')).not.toBeInTheDocument();
      });
    });

    describe('with a fallback component', () => {
      it('renders the child when user has a matching valid system role', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { hasSystemRole: () => true, hasProjectRole: () => false }
        });

        const { queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <RoleGuard
                  validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}
                  validProjectRoles={[]}
                  fallback={<div data-testid="fallback-child-component" />}>
                  <div data-testid="child-component" />
                </RoleGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(queryByTestId('child-component')).toBeInTheDocument();
        expect(queryByTestId('fallback-child-component')).not.toBeInTheDocument();
      });

      it('renders the child when user has a matching valid project role', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { hasSystemRole: () => false, hasProjectRole: () => true }
        });

        const { getByTestId, queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <RoleGuard
                  validSystemRoles={[]}
                  validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD]}
                  fallback={<div data-testid="fallback-child-component" />}>
                  <div data-testid="child-component" />
                </RoleGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(getByTestId('child-component')).toBeInTheDocument();
        expect(queryByTestId('fallback-child-component')).not.toBeInTheDocument();
      });

      it('renders the child when user has both a matching valid system and project role', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { hasSystemRole: () => true, hasProjectRole: () => true }
        });

        const { getByTestId, queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <RoleGuard
                  validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}
                  validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD]}
                  fallback={<div data-testid="fallback-child-component" />}>
                  <div data-testid="child-component" />
                </RoleGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(getByTestId('child-component')).toBeInTheDocument();
        expect(queryByTestId('fallback-child-component')).not.toBeInTheDocument();
      });

      it('renders the fallback component when user has no matching valid system or project roles', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { hasSystemRole: () => false, hasProjectRole: () => false }
        });

        const { getByTestId, queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <RoleGuard
                  validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}
                  validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD]}
                  fallback={<div data-testid="fallback-child-component" />}>
                  <div data-testid="child-component" />
                </RoleGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(queryByTestId('child-component')).not.toBeInTheDocument();
        expect(getByTestId('fallback-child-component')).toBeInTheDocument();
      });
    });

    describe('with a fallback function', () => {
      it('renders the child when user has a matching valid system role', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { hasSystemRole: () => true, hasProjectRole: () => false }
        });

        const { getByTestId, queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <RoleGuard
                  validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}
                  validProjectRoles={[]}
                  fallback={(id) => <div data-testid="fallback-child-component">{id}</div>}>
                  <div data-testid="child-component" />
                </RoleGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(getByTestId('child-component')).toBeInTheDocument();
        expect(queryByTestId('fallback-child-component')).not.toBeInTheDocument();
      });

      it('renders the child when user has a matching valid project role', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { hasSystemRole: () => false, hasProjectRole: () => true }
        });

        const { getByTestId, queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <RoleGuard
                  validSystemRoles={[]}
                  validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD]}
                  fallback={(id) => <div data-testid="fallback-child-component">{id}</div>}>
                  <div data-testid="child-component" />
                </RoleGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(getByTestId('child-component')).toBeInTheDocument();
        expect(queryByTestId('fallback-child-component')).not.toBeInTheDocument();
      });

      it('renders the child when user has both a matching valid system and project role', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { hasSystemRole: () => true, hasProjectRole: () => true }
        });

        const { getByTestId, queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <RoleGuard
                  validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}
                  validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD]}
                  fallback={(id) => <div data-testid="fallback-child-component">{id}</div>}>
                  <div data-testid="child-component" />
                </RoleGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(getByTestId('child-component')).toBeInTheDocument();
        expect(queryByTestId('fallback-child-component')).not.toBeInTheDocument();
      });

      it('renders the fallback component when user has no matching valid system or project roles', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { hasSystemRole: () => false, hasProjectRole: () => false }
        });

        const { getByTestId, queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <RoleGuard
                  validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}
                  validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD]}
                  fallback={(id) => <div data-testid="fallback-child-component">{id}</div>}>
                  <div data-testid="child-component" />
                </RoleGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(queryByTestId('child-component')).not.toBeInTheDocument();
        expect(getByTestId('fallback-child-component')).toBeInTheDocument();
        expect(getByTestId('fallback-child-component').textContent).toEqual('123');
      });
    });
  });

  describe('NoRoleGuard', () => {
    describe('with no fallback', () => {
      it('renders the child when user has no matching valid system role and project role', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { hasSystemRole: () => false, hasProjectRole: () => false }
        });

        const { getByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <NoRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]} validProjectRoles={[]}>
                  <div data-testid="child-component" />
                </NoRoleGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(getByTestId('child-component')).toBeInTheDocument();
      });

      it('does not render the child when user has a matching valid system or project roles', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { hasSystemRole: () => true, hasProjectRole: () => true }
        });

        const { queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <NoRoleGuard
                  validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}
                  validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD]}>
                  <div data-testid="child-component" />
                </NoRoleGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(queryByTestId('child-component')).not.toBeInTheDocument();
      });
    });

    describe('with a fallback component', () => {
      it('renders the child when user has no matching valid system role and project role', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { hasSystemRole: () => false, hasProjectRole: () => false }
        });

        const { queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <NoRoleGuard
                  validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}
                  validProjectRoles={[]}
                  fallback={<div data-testid="fallback-child-component" />}>
                  <div data-testid="child-component" />
                </NoRoleGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(queryByTestId('child-component')).toBeInTheDocument();
        expect(queryByTestId('fallback-child-component')).not.toBeInTheDocument();
      });

      it('renders the fallback component when user has a matching valid system or project roles', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { hasSystemRole: () => true, hasProjectRole: () => true }
        });

        const { getByTestId, queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <NoRoleGuard
                  validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}
                  validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD]}
                  fallback={<div data-testid="fallback-child-component" />}>
                  <div data-testid="child-component" />
                </NoRoleGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(queryByTestId('child-component')).not.toBeInTheDocument();
        expect(getByTestId('fallback-child-component')).toBeInTheDocument();
      });
    });

    describe('with a fallback function', () => {
      it('renders the child when user has no matching valid system or project roles', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { hasSystemRole: () => false, hasProjectRole: () => false }
        });

        const { getByTestId, queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <NoRoleGuard
                  validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}
                  validProjectRoles={[]}
                  fallback={(id) => <div data-testid="fallback-child-component">{id}</div>}>
                  <div data-testid="child-component" />
                </NoRoleGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(getByTestId('child-component')).toBeInTheDocument();
        expect(queryByTestId('fallback-child-component')).not.toBeInTheDocument();
      });

      it('renders the fallback component when user has a matching valid system or project roles', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { hasSystemRole: () => true, hasProjectRole: () => true }
        });

        const { getByTestId, queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <NoRoleGuard
                  validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}
                  validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD]}
                  fallback={(id) => <div data-testid="fallback-child-component">{id}</div>}>
                  <div data-testid="child-component" />
                </NoRoleGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(queryByTestId('child-component')).not.toBeInTheDocument();
        expect(getByTestId('fallback-child-component')).toBeInTheDocument();
        expect(getByTestId('fallback-child-component').textContent).toEqual('123');
      });
    });
  });

  describe('SystemRoleGuard', () => {
    describe('with no fallback', () => {
      it('renders the child when user has a matching valid system role', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { hasSystemRole: () => true, hasProjectRole: () => false }
        });

        const { getByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}>
                  <div data-testid="child-component" />
                </SystemRoleGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(getByTestId('child-component')).toBeInTheDocument();
      });

      it('does not render the child when user has no matching valid system role', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { hasSystemRole: () => false, hasProjectRole: () => false }
        });

        const { queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}>
                  <div data-testid="child-component" />
                </SystemRoleGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(queryByTestId('child-component')).not.toBeInTheDocument();
      });
    });

    describe('with a fallback component', () => {
      it('renders the child when user has a matching valid system roles', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { hasSystemRole: () => true, hasProjectRole: () => false }
        });

        const { queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <SystemRoleGuard
                  validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}
                  fallback={<div data-testid="fallback-child-component" />}>
                  <div data-testid="child-component" />
                </SystemRoleGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(queryByTestId('child-component')).toBeInTheDocument();
        expect(queryByTestId('fallback-child-component')).not.toBeInTheDocument();
      });

      it('renders the fallback component when user has no matching valid system roles', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { hasSystemRole: () => false, hasProjectRole: () => false }
        });

        const { getByTestId, queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <SystemRoleGuard
                  validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}
                  fallback={<div data-testid="fallback-child-component" />}>
                  <div data-testid="child-component" />
                </SystemRoleGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(queryByTestId('child-component')).not.toBeInTheDocument();
        expect(getByTestId('fallback-child-component')).toBeInTheDocument();
      });
    });

    describe('with a fallback function', () => {
      it('renders the child when user has a matching valid system role', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { hasSystemRole: () => true, hasProjectRole: () => false }
        });

        const { getByTestId, queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <SystemRoleGuard
                  validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}
                  fallback={() => <div data-testid="fallback-child-component" />}>
                  <div data-testid="child-component" />
                </SystemRoleGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(getByTestId('child-component')).toBeInTheDocument();
        expect(queryByTestId('fallback-child-component')).not.toBeInTheDocument();
      });

      it('renders the fallback component when user has no matching valid system roles', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { hasSystemRole: () => false, hasProjectRole: () => false }
        });

        const { getByTestId, queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <SystemRoleGuard
                  validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}
                  fallback={() => <div data-testid="fallback-child-component" />}>
                  <div data-testid="child-component" />
                </SystemRoleGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(queryByTestId('child-component')).not.toBeInTheDocument();
        expect(getByTestId('fallback-child-component')).toBeInTheDocument();
      });
    });
  });

  describe('ProjectRoleGuard', () => {
    describe('with no fallback', () => {
      it('renders the child when user has a matching valid project role', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { hasSystemRole: () => false, hasProjectRole: () => true }
        });

        const { getByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <ProjectRoleGuard validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD]}>
                  <div data-testid="child-component" />
                </ProjectRoleGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(getByTestId('child-component')).toBeInTheDocument();
      });

      it('does not render the child when user has no matching valid project role', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { hasSystemRole: () => false, hasProjectRole: () => false }
        });

        const { queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <ProjectRoleGuard validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD]}>
                  <div data-testid="child-component" />
                </ProjectRoleGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(queryByTestId('child-component')).not.toBeInTheDocument();
      });
    });

    describe('with a fallback component', () => {
      it('renders the child when user has a matching valid project role', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { hasSystemRole: () => false, hasProjectRole: () => true }
        });

        const { getByTestId, queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <ProjectRoleGuard
                  validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD]}
                  fallback={<div data-testid="fallback-child-component" />}>
                  <div data-testid="child-component" />
                </ProjectRoleGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(getByTestId('child-component')).toBeInTheDocument();
        expect(queryByTestId('fallback-child-component')).not.toBeInTheDocument();
      });

      it('renders the fallback component when user has no matching valid project role', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { hasSystemRole: () => false, hasProjectRole: () => false }
        });

        const { getByTestId, queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <ProjectRoleGuard
                  validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD]}
                  fallback={<div data-testid="fallback-child-component" />}>
                  <div data-testid="child-component" />
                </ProjectRoleGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(queryByTestId('child-component')).not.toBeInTheDocument();
        expect(getByTestId('fallback-child-component')).toBeInTheDocument();
      });
    });

    describe('with a fallback function', () => {
      it('renders the child when user has a matching valid project role', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { hasSystemRole: () => false, hasProjectRole: () => true }
        });

        const { getByTestId, queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <ProjectRoleGuard
                  validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD]}
                  fallback={(id) => <div data-testid="fallback-child-component">{id}</div>}>
                  <div data-testid="child-component" />
                </ProjectRoleGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(getByTestId('child-component')).toBeInTheDocument();
        expect(queryByTestId('fallback-child-component')).not.toBeInTheDocument();
      });

      it('renders the fallback component when user has no matching valid project role', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { hasSystemRole: () => false, hasProjectRole: () => false }
        });

        const { getByTestId, queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <ProjectRoleGuard
                  validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD]}
                  fallback={(id) => <div data-testid="fallback-child-component">{id}</div>}>
                  <div data-testid="child-component" />
                </ProjectRoleGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(queryByTestId('child-component')).not.toBeInTheDocument();
        expect(getByTestId('fallback-child-component')).toBeInTheDocument();
        expect(getByTestId('fallback-child-component').textContent).toEqual('123');
      });
    });
  });

  describe('AuthGuard', () => {
    describe('with no fallback', () => {
      it('renders the child when user is authenticated', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { keycloak: { authenticated: true }, hasLoadedAllUserInfo: true }
        });

        const { getByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <AuthGuard>
                  <div data-testid="child-component" />
                </AuthGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(getByTestId('child-component')).toBeInTheDocument();
      });

      it('does not render the child when user is not authenticated', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { keycloak: { authenticated: false }, hasLoadedAllUserInfo: false }
        });

        const { queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <AuthGuard>
                  <div data-testid="child-component" />
                </AuthGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(queryByTestId('child-component')).not.toBeInTheDocument();
      });
    });

    describe('with a fallback component', () => {
      it('renders the child when user is authenticated', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { keycloak: { authenticated: true }, hasLoadedAllUserInfo: true }
        });

        const { getByTestId, queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <AuthGuard fallback={<div data-testid="fallback-child-component" />}>
                  <div data-testid="child-component" />
                </AuthGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(getByTestId('child-component')).toBeInTheDocument();
        expect(queryByTestId('fallback-child-component')).not.toBeInTheDocument();
      });

      it('renders the fallback component when user is not authenticated', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { keycloak: { authenticated: false }, hasLoadedAllUserInfo: false }
        });

        const { getByTestId, queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <AuthGuard fallback={<div data-testid="fallback-child-component" />}>
                  <div data-testid="child-component" />
                </AuthGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(queryByTestId('child-component')).not.toBeInTheDocument();
        expect(getByTestId('fallback-child-component')).toBeInTheDocument();
      });
    });

    describe('with a fallback function', () => {
      it('renders the child when user is authenticated', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { keycloak: { authenticated: true }, hasLoadedAllUserInfo: true }
        });

        const { getByTestId, queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <AuthGuard fallback={() => <div data-testid="fallback-child-component" />}>
                  <div data-testid="child-component" />
                </AuthGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(getByTestId('child-component')).toBeInTheDocument();
        expect(queryByTestId('fallback-child-component')).not.toBeInTheDocument();
      });

      it('renders the fallback component when user is not authenticated', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { keycloak: { authenticated: false }, hasLoadedAllUserInfo: false }
        });

        const { getByTestId, queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <AuthGuard fallback={() => <div data-testid="fallback-child-component" />}>
                  <div data-testid="child-component" />
                </AuthGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(queryByTestId('child-component')).not.toBeInTheDocument();
        expect(getByTestId('fallback-child-component')).toBeInTheDocument();
      });
    });
  });

  describe('UnAuthGuard', () => {
    describe('with no fallback', () => {
      it('renders the child when user is not authenticated', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { keycloak: { authenticated: false }, hasLoadedAllUserInfo: false }
        });

        const { getByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <UnAuthGuard>
                  <div data-testid="child-component" />
                </UnAuthGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(getByTestId('child-component')).toBeInTheDocument();
      });

      it('does not render the child when user is authenticated', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { keycloak: { authenticated: true }, hasLoadedAllUserInfo: true }
        });

        const { queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <UnAuthGuard>
                  <div data-testid="child-component" />
                </UnAuthGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(queryByTestId('child-component')).not.toBeInTheDocument();
      });
    });

    describe('with a fallback component', () => {
      it('renders the child when user is not authenticated', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { keycloak: { authenticated: false }, hasLoadedAllUserInfo: false }
        });

        const { getByTestId, queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <UnAuthGuard fallback={<div data-testid="fallback-child-component" />}>
                  <div data-testid="child-component" />
                </UnAuthGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(getByTestId('child-component')).toBeInTheDocument();
        expect(queryByTestId('fallback-child-component')).not.toBeInTheDocument();
      });

      it('renders the fallback component when user is authenticated', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { keycloak: { authenticated: true }, hasLoadedAllUserInfo: true }
        });

        const { getByTestId, queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <UnAuthGuard fallback={<div data-testid="fallback-child-component" />}>
                  <div data-testid="child-component" />
                </UnAuthGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(queryByTestId('child-component')).not.toBeInTheDocument();
        expect(getByTestId('fallback-child-component')).toBeInTheDocument();
      });
    });

    describe('with a fallback function', () => {
      it('renders the child when user is not authenticated', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { keycloak: { authenticated: false }, hasLoadedAllUserInfo: false }
        });

        const { getByTestId, queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <UnAuthGuard fallback={() => <div data-testid="fallback-child-component" />}>
                  <div data-testid="child-component" />
                </UnAuthGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(getByTestId('child-component')).toBeInTheDocument();
        expect(queryByTestId('fallback-child-component')).not.toBeInTheDocument();
      });

      it('renders the fallback component when user is authenticated', () => {
        const authState = getMockAuthState({
          keycloakWrapper: { keycloak: { authenticated: true }, hasLoadedAllUserInfo: true }
        });

        const { getByTestId, queryByTestId } = render(
          <Router history={history}>
            <Route path="test/:id">
              <AuthStateContext.Provider value={authState}>
                <UnAuthGuard fallback={(id) => <div data-testid="fallback-child-component" />}>
                  <div data-testid="child-component" />
                </UnAuthGuard>
              </AuthStateContext.Provider>
            </Route>
          </Router>
        );

        expect(queryByTestId('child-component')).not.toBeInTheDocument();
        expect(getByTestId('fallback-child-component')).toBeInTheDocument();
      });
    });
  });
});
