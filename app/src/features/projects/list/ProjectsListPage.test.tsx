import { fireEvent, render, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { MemoryRouter, Router } from 'react-router';
import ProjectsListPage from './ProjectsListPage';

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
      ({
        project: {
          project_id: 1,
          project_name: 'Project 1',
          start_date: null,
          end_date: '2020-01-01', // date in the past
          project_type: 'project type'
        },
        permit: {
          permits: [{ permit_number: 1 }, { permit_number: 2 }, { permit_number: 3 }]
        },
        contact: {
          contacts: [
            {
              coordinator_agency: 'contact agency'
            }
          ]
        }
      } as unknown) as IGetProjectForViewResponse
    ];

    const { getByText, getByTestId } = render(
      <MemoryRouter>
        <ProjectsListPage projects={projectArray} drafts={[]} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByTestId('project-table')).toBeInTheDocument();
      expect(getByText('Project 1')).toBeInTheDocument();
    });
  });

  test('renders with a proper list of multiple projects and drafts', async () => {
    const projectArray = [
      ({
        project: {
          project_id: 1,
          project_name: 'Project 1',
          start_date: '2022-02-09',
          end_date: '2022-02-09',
          project_type: 'project type'
        },
        permit: {
          permits: [{ permit_number: 1 }, { permit_number: 2 }, { permit_number: 3 }]
        },
        contact: {
          contacts: [
            {
              coordinator_agency: 'contact agency'
            }
          ]
        }
      } as unknown) as IGetProjectForViewResponse
    ];
    const draftArray = [
      {
        id: 1,
        name: 'draft name',
        start_date: '2022-02-09',
        end_date: '2022-02-09',
        coordinator_agency: 'string',
        permits_list: 'string',
        completion_status: 'Draft'
      }
    ];

    const { getByText, getByTestId } = render(
      <MemoryRouter>
        <ProjectsListPage projects={projectArray} drafts={draftArray} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByTestId('project-table')).toBeInTheDocument();
      expect(getByText('Project 1')).toBeInTheDocument();

      expect(getByText('Completed')).toBeInTheDocument();
      expect(getByText('draft name')).toBeInTheDocument();
      expect(getByText('Draft')).toBeInTheDocument();
    });
  });

  test('navigating to the project works', async () => {
    const projectArray = [
      ({
        project: {
          project_id: 1,
          project_name: 'Project 1',
          start_date: '2022-02-09',
          end_date: '2022-02-09',
          project_type: 'project type'
        },
        permit: {
          permits: [{ permit_number: 1 }, { permit_number: 2 }, { permit_number: 3 }]
        },
        contact: {
          contacts: [
            {
              coordinator_agency: 'contact agency'
            }
          ]
        }
      } as unknown) as IGetProjectForViewResponse
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

  test('navigating to the draft project works', async () => {
    const draftArray = [
      {
        id: 1,
        name: 'draft name',
        start_date: '2022-02-09',
        end_date: '2022-02-09',
        coordinator_agency: 'string',
        permits_list: 'string',
        completion_status: 'Draft'
      }
    ];

    const { getByTestId } = render(
      <Router history={history}>
        <ProjectsListPage projects={[]} drafts={draftArray} />
      </Router>
    );

    await waitFor(() => {
      expect(getByTestId('project-table')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('draft name'));

    await waitFor(() => {
      expect(history.location.pathname).toEqual('/admin/projects/create');
      expect(history.location.search).toEqual('?draftId=1');
    });
  });
});
