import CreateProjectPage from 'features/projects/create/CreateProjectPage';
import ProjectsListPage from 'features/projects/list/ProjectsListPage';
import ProjectsLayout from 'features/projects/ProjectsLayout';
import ProjectPage from 'features/projects/view/ProjectPage';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import AppRoute from 'utils/AppRoute';
import ProjectParticipantsPage from './participants/ProjectParticipantsPage';

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
          <ProjectsListPage />
        </ProjectsLayout>
      </AppRoute>

      <AppRoute exact path="/admin/projects/create" layout={ProjectsLayout}>
        <ProjectsLayout>
          <CreateProjectPage />
        </ProjectsLayout>
      </AppRoute>

      <Redirect exact from="/admin/projects/:id?" to="/admin/projects/:id?/details" />

      <AppRoute exact path="/admin/projects/:id?/details" layout={ProjectsLayout}>
        <ProjectsLayout>
          <ProjectPage />
        </ProjectsLayout>
      </AppRoute>

      <AppRoute exact path="/admin/projects/:id?/users" layout={ProjectsLayout}>
        <ProjectsLayout>
          <ProjectParticipantsPage />
        </ProjectsLayout>
      </AppRoute>

      <AppRoute exact path="/admin/projects/:id?/attachments" layout={ProjectsLayout}>
        <ProjectPage />
      </AppRoute>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <AppRoute path="/admin/projects/*">
        <Redirect to="/page-not-found" />
      </AppRoute>
    </Switch>
  );
};

export default ProjectsRouter;
