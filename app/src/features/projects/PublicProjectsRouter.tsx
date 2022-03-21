import { UnRoleGuard } from 'components/security/Guards';
import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import ProjectsLayout from 'features/projects/ProjectsLayout';
import PublicProjectPage from 'pages/public/PublicProjectPage';
import PublicProjectsListPage from 'pages/public/PublicProjectsListPage';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import AppRoute from 'utils/AppRoute';

/**
 * Router for all `/projects/*` pages.
 *
 * @param {*} props
 * @return {*}
 */
const PublicProjectsRouter: React.FC = () => {
  return (
    <Switch>
      <AppRoute exact path="/projects">
        <PublicProjectsListPage />
      </AppRoute>

      <Redirect exact from="/projects/:id" to="/projects/:id/details" />

      <AppRoute exact path="/projects/:id/details">
        {/* Catches Logged in users and redirects them to admin page */}
        <UnRoleGuard
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}
          validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR, PROJECT_ROLE.PROJECT_VIEWER]}
          fallback={(projectId) => <Redirect to={`/admin/projects/${projectId}`} />}>
          <ProjectsLayout>
            <PublicProjectPage />
          </ProjectsLayout>
        </UnRoleGuard>
      </AppRoute>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <AppRoute path="/projects/*">
        <Redirect to="/page-not-found" />
      </AppRoute>
    </Switch>
  );
};

export default PublicProjectsRouter;
