import { cleanup, render, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import React from 'react';
import { Router } from 'react-router';
import { useRestorationTrackerApi } from '../../../hooks/useRestorationTrackerApi';
import { IGetUserProjectsListResponse } from '../../../interfaces/useProjectApi.interface';
import { IGetUserResponse } from '../../../interfaces/useUserApi.interface';
import UsersDetailPage from './UsersDetailPage';

const history = createMemoryHistory();

jest.mock('../../../hooks/useRestorationTrackerApi');

const mockuseRestorationTrackerApi = {
  user: {
    getUserById: jest.fn<Promise<IGetUserResponse>, []>()
  },
  codes: {
    getAllCodeSets: jest.fn<Promise<IGetAllCodeSetsResponse>, []>()
  },
  project: {
    getAllUserProjectsParticipation: jest.fn<Promise<IGetUserProjectsListResponse>, []>()
  }
};

const mockRestorationTrackerApi = ((useRestorationTrackerApi as unknown) as jest.Mock<
  typeof mockuseRestorationTrackerApi
>).mockReturnValue(mockuseRestorationTrackerApi);

describe('UsersDetailPage', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockRestorationTrackerApi().user.getUserById.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows circular spinner when selectedUser not yet loaded', async () => {
    const { getAllByTestId } = render(
      <Router history={history}>
        <UsersDetailPage />
      </Router>
    );

    await waitFor(() => {
      expect(getAllByTestId('page-loading').length).toEqual(1);
    });
  });

  it('renders correctly when selectedUser are loaded', async () => {
    history.push('/admin/users/1');

    mockRestorationTrackerApi().user.getUserById.mockResolvedValue({
      id: 1,
      user_identifier: 'LongerUserName',
      record_end_date: 'end',
      role_names: ['role1', 'role2']
    });

    mockRestorationTrackerApi().project.getAllUserProjectsParticipation.mockResolvedValue({
      project: null
    } as any);

    mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue({
      coordinator_agency: [{ id: 1, name: 'agency 1' }]
    } as any);

    const { getAllByTestId } = render(
      <Router history={history}>
        <UsersDetailPage />
      </Router>
    );

    await waitFor(() => {
      expect(getAllByTestId('user-detail-title').length).toEqual(1);
      expect(getAllByTestId('projects_header').length).toEqual(1);
    });
  });
});
