import ProjectsLayout from 'features/projects/ProjectsLayout';
import React from 'react';
import { Redirect, Switch } from 'react-router';
import AppRoute from 'utils/AppRoute';
import MyProjectsPage from './MyProjectsPage';

/**
 * Router for all user specific pages.
 *
 * @param {*} props
 * @return {*}
 */
const UserRouter: React.FC = () => {
  return (
    <Switch>
      <Redirect exact from="/admin/user" to="/admin/user/projects" />

      <AppRoute exact path="/admin/user/projects" layout={ProjectsLayout}>
        <ProjectsLayout>
          <MyProjectsPage />
        </ProjectsLayout>
      </AppRoute>

      {/*  Catch any unknown routes, and re-direct to the not found page */}
      <AppRoute path="/admin/user/projects/*">
        <Redirect to="/page-not-found" />
      </AppRoute>
    </Switch>
  );
};

export default UserRouter;
