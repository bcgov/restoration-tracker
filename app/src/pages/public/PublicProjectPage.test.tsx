import { act, cleanup, render, waitFor } from '@testing-library/react';
import { DialogContextProvider } from 'contexts/dialogContext';
import { createMemoryHistory } from 'history';
import useCodes from 'hooks/useCodes';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import {
  IGetProjectAttachmentsResponse,
  IGetProjectForViewResponse,
  IGetProjectTreatmentsResponse,
  TreatmentSearchCriteria
} from 'interfaces/useProjectApi.interface';
import React from 'react';
import { Router } from 'react-router';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import PublicProjectPage from './PublicProjectPage';

const history = createMemoryHistory({ initialEntries: ['/admin/projects/1'] });

jest.mock('../../hooks/useRestorationTrackerApi');
const mockuseRestorationTrackerApi = {
  public: {
    project: {
      getProjectForView: jest.fn<Promise<IGetProjectForViewResponse>, [number]>(),
      getProjectAttachments: jest.fn<Promise<IGetProjectAttachmentsResponse>, [number]>(),
      getTreatments: jest.fn<Promise<IGetProjectTreatmentsResponse>, [number, TreatmentSearchCriteria]>()
    }
  }
};

jest.mock('../../hooks/useCodes');
const mockUseCodes = (useCodes as unknown) as jest.MockedFunction<typeof useCodes>;

const mockRestorationTrackerApi = ((useRestorationTrackerApi as unknown) as jest.Mock<
  typeof mockuseRestorationTrackerApi
>).mockReturnValue(mockuseRestorationTrackerApi);

describe('PublicProjectPage', () => {
  beforeEach(() => {
    mockRestorationTrackerApi().public.project.getProjectForView.mockClear();
    mockRestorationTrackerApi().public.project.getProjectAttachments.mockClear();
    mockRestorationTrackerApi().public.project.getTreatments.mockClear();

    mockUseCodes.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders a spinner if no project is loaded', async () => {
    mockUseCodes.mockReturnValue({ codes: codes, isLoading: false, isReady: true });

    await act(async () => {
      const { asFragment } = render(
        <DialogContextProvider>
          <Router history={history}>
            <PublicProjectPage />
          </Router>
        </DialogContextProvider>
      );

      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('renders spinner when no codes is loaded', async () => {
    mockUseCodes.mockReturnValue({ codes: undefined, isLoading: true, isReady: false });

    const mockGetProjectForView = mockRestorationTrackerApi().public.project.getProjectForView.mockResolvedValue(
      getProjectForViewResponse
    );

    const { getByTestId } = render(
      <DialogContextProvider>
        <Router history={history}>
          <PublicProjectPage />
        </Router>
      </DialogContextProvider>
    );

    await waitFor(() => {
      expect(mockUseCodes).toHaveBeenCalled();
      expect(mockGetProjectForView).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(getByTestId('loading_spinner')).toBeVisible();
    });
  });

  it('renders public project page when project is loaded (project is active)', async () => {
    mockUseCodes.mockReturnValue({ codes: codes, isLoading: false, isReady: true });

    mockRestorationTrackerApi().public.project.getProjectForView.mockResolvedValue({
      ...getProjectForViewResponse,
      project: { ...getProjectForViewResponse.project, end_date: '2100-02-26' }
    });

    const { asFragment, findByText } = render(
      <DialogContextProvider>
        <Router history={history}>
          <PublicProjectPage />
        </Router>
      </DialogContextProvider>
    );

    const projectHeaderText = await findByText('Test Project Name', { selector: 'h1' });
    expect(projectHeaderText).toBeVisible();

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('renders public project page when project is loaded (project is completed)', async () => {
    mockUseCodes.mockReturnValue({ codes: codes, isLoading: false, isReady: true });

    mockRestorationTrackerApi().public.project.getProjectForView.mockResolvedValue({
      ...getProjectForViewResponse,
      project: { ...getProjectForViewResponse.project }
    });

    const { asFragment, findByText } = render(
      <DialogContextProvider>
        <Router history={history}>
          <PublicProjectPage />
        </Router>
      </DialogContextProvider>
    );

    const projectHeaderText = await findByText('Test Project Name', { selector: 'h1' });
    expect(projectHeaderText).toBeVisible();

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('renders correctly with no end date', async () => {
    mockUseCodes.mockReturnValue({ codes: codes, isLoading: false, isReady: true });

    mockRestorationTrackerApi().public.project.getProjectForView.mockResolvedValue({
      ...getProjectForViewResponse,
      project: {
        ...getProjectForViewResponse.project,
        end_date: (null as unknown) as string
      }
    });

    const { asFragment, findByText } = render(
      <Router history={history}>
        <PublicProjectPage />
      </Router>
    );

    const projectHeaderText = await findByText('Test Project Name', { selector: 'h1' });
    expect(projectHeaderText).toBeVisible();

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
