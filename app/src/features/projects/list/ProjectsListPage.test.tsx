// import { createMemoryHistory } from 'history';
// const history = createMemoryHistory();

import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import ProjectsListPage from './ProjectsListPage';
import { MemoryRouter, Router } from 'react-router';
import { createMemoryHistory } from 'history';
import { IGetProjectsListResponse } from 'interfaces/useProjectApi.interface';

const history = createMemoryHistory();

describe('ProjectsListPage', () => {
  test('renders properly when no projects are given', async () => {
    const { getByText } = render(
      <MemoryRouter>
        <ProjectsListPage projects={[]} drafts={[]} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByText('Found 0 projects')).toBeInTheDocument();
      expect(getByText('No Results')).toBeInTheDocument();
    });
  });

  test('renders with a proper list of a single project', async () => {
    const projectArray = [
      {
        project: {
          project_id: 1,
          project_name: 'Project 1',
          start_date: null,
          end_date: '2020-01-01', // date in the past
          project_type: 'project type',
          publish_status: 'Published'
        },
        permit: {
          permits: [{ permit_number: 1 }, { permit_number: 2 }, { permit_number: 3 }]
        },
        coordinator: {
          coordinator_agency: 'contact agency'
        }
      }
    ]);

    const { getByText, getByTestId } = render(
      <MemoryRouter>
        <ProjectsListPage projects={projectArray} drafts={[]} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByTestId('project-table')).toBeInTheDocument();
      expect(getByText('project name')).toBeInTheDocument();
      expect(getByText('Active')).toBeInTheDocument();
    });
  });

  test('renders with a proper list of multiple projects and drafts', async () => {
    const projectArray = [
      {
        project: {
          project_id: 1,
          project_name: 'Project 1',
          start_date: null,
          end_date: null,
          project_type: 'project type',
          publish_status: 'Unpublished'
        },
        permit: {
          permits: [{ permit_number: 1 }, { permit_number: 2 }, { permit_number: 3 }]
        },
        coordinator: {
          coordinator_agency: 'contact agency'
        }
      } as IGetProjectsListResponse,
      {
        id: 2,
        name: 'project name2',
        start_date: '2022-02-09',
        end_date: '2022-02-09',
        coordinator_agency: 'string',
        permits_list: 'string',
        publish_status: 'string',
        completion_status: 'Completed'
      } as IGetProjectsListResponse
    ];
    const draftArray = [
      {
        id: 1,
        name: 'draft name',
        start_date: '2022-02-09',
        end_date: '2022-02-09',
        coordinator_agency: 'string',
        permits_list: 'string',
        publish_status: 'string',
        completion_status: 'Draft'
      } as IGetProjectsListResponse
    ];

    const { getByText, getByTestId } = render(
      <MemoryRouter>
        <ProjectsListPage projects={projectArray} drafts={draftArray} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByTestId('project-table')).toBeInTheDocument();
      expect(getByText('project name')).toBeInTheDocument();
      expect(getByText('Active')).toBeInTheDocument();
      expect(getByText('project name2')).toBeInTheDocument();
      expect(getByText('Completed')).toBeInTheDocument();
      expect(getByText('draft name')).toBeInTheDocument();
      expect(getByText('Draft')).toBeInTheDocument();
    });
  });

  test('navigating to the project works', async () => {
    const projectArray = [
      {
        id: 1,
        name: 'Project 1',
        start_date: '2022-02-09',
        end_date: '2022-02-09',
        coordinator_agency: 'string',
        permits_list: 'string',
        publish_status: 'string',
        completion_status: 'Active'
      } as IGetProjectsListResponse
    ];

    const { getByTestId } = render(
      <Router history={history}>
        <ProjectsListPage projects={projectArray} drafts={[]} />
      </Router>
    );

    await waitFor(() => {
      expect(getByTestId('project-table')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('Project 1'));

    await waitFor(() => {
      expect(history.location.pathname).toEqual('/admin/projects/1');
    });
  });

  test('navigating to the project works', async () => {
    const draftArray = [
      {
        project: {
          project_id: 1,
          project_name: 'Project 1',
          start_date: null,
          end_date: null,
          publish_status: 'Published'
        },
        permit: {
          permits: [{ permit_number: 1 }, { permit_number: 2 }, { permit_number: 3 }]
        },
        coordinator: {
          coordinator_agency: 'contact agency'
        }
      }
    ]);

    const { getByTestId } = render(
      <Router history={history}>
        <ProjectsListPage projects={[]} drafts={draftArray} />
      </Router>
    );

    await waitFor(() => {
      expect(getByTestId('project-table')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('Draft 1'));

    await waitFor(() => {
      expect(history.location.pathname).toEqual('/admin/projects/create');
      expect(history.location.search).toEqual('?draftId=1');
    });
  });
});
