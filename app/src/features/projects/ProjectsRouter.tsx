import { RoleGuard } from 'components/security/Guards';
import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import EditProjectPage from 'features/edit/EditProjectPage';
import CreateProjectPage from 'features/projects/create/CreateProjectPage';
import ProjectsLayout from 'features/projects/ProjectsLayout';
import ViewProjectPage from 'features/projects/view/ViewProjectPage';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import AppRoute from 'utils/AppRoute';
import ProjectParticipantsPage from './participants/ProjectParticipantsPage';
import ProjectsPage from './ProjectsPage';

/**
 * Router for all `/admin/project/*` pages.
 *
 * @param {*} props
 * @return {*}
 */
const ProjectsRouter: React.FC = () => {
  return (
    <Switch>
      <AppRoute exact path="/admin/projects" layout={ProjectsLayout}>
        <ProjectsLayout>
          <ProjectsPage />
        </ProjectsLayout>
      </AppRoute>

      <AppRoute exact path="/admin/projects/create" layout={ProjectsLayout}>
        <ProjectsLayout>
          <CreateProjectPage />
        </ProjectsLayout>
      </AppRoute>

      <AppRoute exact path="/admin/projects/:id/edit" layout={ProjectsLayout}>
        <RoleGuard
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}
          validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR]}
          fallback={(projectId) => <Redirect to={`/projects/${projectId}`} path="" />}>
          <ProjectsLayout>
            <EditProjectPage />
          </ProjectsLayout>
        </RoleGuard>
      </AppRoute>

      <Redirect exact from="/admin/projects/:id" to="/admin/projects/:id/details" />

      <AppRoute exact path="/admin/projects/:id/details" layout={ProjectsLayout}>
        <RoleGuard
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}
          validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR, PROJECT_ROLE.PROJECT_VIEWER]}
          fallback={(projectId) => <Redirect to={`/projects/${projectId}`} />}>
          <ProjectsLayout>
            <ViewProjectPage />
          </ProjectsLayout>
        </RoleGuard>
      </AppRoute>

      <AppRoute exact path="/admin/projects/:id/users" layout={ProjectsLayout}>
        <RoleGuard
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}
          validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR]}
          fallback={(projectId) => <Redirect to={`/projects/${projectId}`} />}>
          <ProjectsLayout>
            <ProjectParticipantsPage />
          </ProjectsLayout>
        </RoleGuard>
      </AppRoute>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <AppRoute path="/admin/projects/*">
        <Redirect to="/page-not-found" />
      </AppRoute>
    </Switch>
  );
};

export default ProjectsRouter;
