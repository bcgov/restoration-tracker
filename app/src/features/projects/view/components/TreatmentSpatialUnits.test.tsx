import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import React from 'react';
import { Router } from 'react-router';
import TreatmentSpatialUnits from './TreatmentSpatialUnits';

const history = createMemoryHistory();

jest.mock('../../../../hooks/useRestorationTrackerApi');
const mockuseRestorationTrackerApi = {
  project: {
    getProjectTreatmentsYears: jest.fn<Promise<{ year: number }[]>, [number]>()
  }
};

const mockRestorationTrackerApi = ((useRestorationTrackerApi as unknown) as jest.Mock<
  typeof mockuseRestorationTrackerApi
>).mockReturnValue(mockuseRestorationTrackerApi);

describe('TreatmentSpatialUnits', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockRestorationTrackerApi().project.getProjectTreatmentsYears.mockClear();
  });
  afterEach(() => {
    cleanup();
  });

  it('renders correctly with no Treatment Years', async () => {
    await act(async () => {
      mockRestorationTrackerApi().project.getProjectTreatmentsYears.mockResolvedValue([]);
      const { getByText } = render(
        <Router history={history}>
          <TreatmentSpatialUnits treatmentList={[]} getTreatments={jest.fn()} getAttachments={jest.fn()} />
        </Router>
      );

      expect(getByText('Filter Treatment Years (0)', { exact: false })).toBeInTheDocument();
    });
  });

  it('renders menu correctly with no Treatment Years', async () => {
    const { getByText } = render(
      <Router history={history}>
        <TreatmentSpatialUnits treatmentList={[]} getTreatments={jest.fn()} getAttachments={jest.fn()} />
      </Router>
    );

    fireEvent.click(getByText('Filter Treatment Years (0)'));
    await waitFor(() => {
      expect(getByText('No Treatment Years Available', { exact: false })).toBeInTheDocument();
    });
  });

  it('renders popup correctly', async () => {
    const { getAllByText, getByTestId } = render(
      <Router history={history}>
        <TreatmentSpatialUnits treatmentList={[]} getTreatments={jest.fn()} getAttachments={jest.fn()} />
      </Router>
    );

    fireEvent.click(getByTestId('upload-spatial'));
    await waitFor(() => {
      const items = getAllByText('Import Treatments');
      expect(items).toHaveLength(2);
    });
  });

  it('renders correctly with Treatment Years', async () => {
    mockRestorationTrackerApi().project.getProjectTreatmentsYears.mockResolvedValue([{ year: 99 }]);

    const { getByText } = render(
      <Router history={history}>
        <TreatmentSpatialUnits treatmentList={[]} getTreatments={jest.fn()} getAttachments={jest.fn()} />
      </Router>
    );

    await waitFor(() => {
      expect(getByText('Filter Treatment Years (1)')).toBeInTheDocument();
    });
  });
});
