import { cleanup, render, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import useCodes from 'hooks/useCodes';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import React from 'react';
import { Router } from 'react-router';
import { codes } from 'test-helpers/code-helpers';
import ManageUsersPage from './ManageUsersPage';

const history = createMemoryHistory();

const renderContainer = () => {
  return render(
    <Router history={history}>
      <ManageUsersPage />
    </Router>
  );
};

jest.mock('../../../hooks/useRestorationTrackerApi');
const mockuseRestorationTrackerApi = {
  admin: {
    getAdministrativeActivities: jest.fn()
  },
  user: {
    getUsersList: jest.fn()
  }
};

const mockRestorationTrackerApi = ((useRestorationTrackerApi as unknown) as jest.Mock<
  typeof mockuseRestorationTrackerApi
>).mockReturnValue(mockuseRestorationTrackerApi);

jest.mock('../../../hooks/useCodes');
const mockUseCodes = (useCodes as unknown) as jest.MockedFunction<typeof useCodes>;

describe('ManageUsersPage', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockRestorationTrackerApi().admin.getAdministrativeActivities.mockClear();
    mockRestorationTrackerApi().user.getUsersList.mockClear();
    mockUseCodes.mockClear();

    // mock code set response
    mockUseCodes.mockReturnValue({ codes: codes, isLoading: false, isReady: true });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the main page content correctly', async () => {
    mockRestorationTrackerApi().admin.getAdministrativeActivities.mockReturnValue([]);
    mockRestorationTrackerApi().user.getUsersList.mockReturnValue([]);

    const { getByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('Manage Users')).toBeVisible();
    });
  });

  it('renders the access requests and active users component', async () => {
    mockRestorationTrackerApi().admin.getAdministrativeActivities.mockReturnValue([]);
    mockRestorationTrackerApi().user.getUsersList.mockReturnValue([]);

    const { getByText } = renderContainer();

    await waitFor(() => {
      expect(getByText('No Access Requests')).toBeVisible();
      expect(getByText('No Active Users')).toBeVisible();
    });
  });
});
