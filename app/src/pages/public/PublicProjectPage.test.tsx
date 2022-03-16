import { act, cleanup, render, waitFor } from '@testing-library/react';
import { DialogContextProvider } from 'contexts/dialogContext';
import { createMemoryHistory } from 'history';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
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
      getProjectForView: jest.fn<Promise<IGetProjectForViewResponse>, [number]>()
    }
  },
  codes: {
    getAllCodeSets: jest.fn<Promise<IGetAllCodeSetsResponse>, []>()
  }
};

const mockRestorationTrackerApi = ((useRestorationTrackerApi as unknown) as jest.Mock<
  typeof mockuseRestorationTrackerApi
>).mockReturnValue(mockuseRestorationTrackerApi);

describe('PublicProjectPage', () => {
  beforeEach(() => {
    mockRestorationTrackerApi().public.project.getProjectForView.mockClear();
    mockRestorationTrackerApi().codes.getAllCodeSets.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders a spinner if no project is loaded', async () => {
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
    mockRestorationTrackerApi().public.project.getProjectForView.mockResolvedValue({
      ...getProjectForViewResponse,
      project: { ...getProjectForViewResponse.project, end_date: '2100-02-26' }
    });

    const { getByTestId } = render(
      <DialogContextProvider>
        <Router history={history}>
          <PublicProjectPage />
        </Router>
      </DialogContextProvider>
    );

    await waitFor(() => {
      expect(getByTestId('loading_spinner')).toBeVisible();
    });
  });

  it('renders public project page when project is loaded (project is active)', async () => {
    mockRestorationTrackerApi().public.project.getProjectForView.mockResolvedValue({
      ...getProjectForViewResponse,
      project: { ...getProjectForViewResponse.project, end_date: '2100-02-26' }
    });

    mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue(codes);

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
    mockRestorationTrackerApi().public.project.getProjectForView.mockResolvedValue({
      ...getProjectForViewResponse,
      project: { ...getProjectForViewResponse.project }
    });

    mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue(codes);

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
    mockRestorationTrackerApi().public.project.getProjectForView.mockResolvedValue({
      ...getProjectForViewResponse,
      project: {
        ...getProjectForViewResponse.project,
        end_date: (null as unknown) as string
      }
    });

    mockRestorationTrackerApi().codes.getAllCodeSets.mockResolvedValue(codes);

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
