import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { cleanup, render, waitFor } from '@testing-library/react';
import PublicProjectsListPage from './PublicProjectsListPage';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';

jest.mock('../../hooks/useRestorationTrackerApi');
const mockUseRestorationTrackerApi = {
  public: {
    project: {
      getProjectsList: jest.fn()
    }
  }
};

const mockRestorationTrackerApi = ((useRestorationTrackerApi as unknown) as jest.Mock<
  typeof mockUseRestorationTrackerApi
>).mockReturnValue(mockUseRestorationTrackerApi);

describe('PublicProjectsListPage', () => {
  beforeEach(() => {
    mockRestorationTrackerApi().public.project.getProjectsList.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  test('renders with a proper list of projects when completed', async () => {
    mockRestorationTrackerApi().public.project.getProjectsList.mockResolvedValue([
      {
        id: 1,
        name: 'Project 1',
        start_date: '11/01/2020',
        end_date: '12/01/2020',
        coordinator_agency: 'contact agency',
        permits_list: '1, 2, 3'
      }
    ]);

    const { getByText, getByTestId } = render(
      <MemoryRouter>
        <PublicProjectsListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByTestId('project-table')).toBeInTheDocument();
      expect(getByText('Completed')).toBeInTheDocument();
    });
  });

  test('renders with a proper list of projects when active', async () => {
    mockRestorationTrackerApi().public.project.getProjectsList.mockResolvedValue([
      {
        id: 1,
        name: 'Project 1',
        start_date: null,
        end_date: null,
        coordinator_agency: 'contact agency',
        permits_list: '1, 2, 3',
        completion_status: 'Active'
      }
    ]);

    const { getByText, getByTestId } = render(
      <MemoryRouter>
        <PublicProjectsListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByTestId('project-table')).toBeInTheDocument();
      expect(getByText('Active')).toBeInTheDocument();
    });
  });
});
