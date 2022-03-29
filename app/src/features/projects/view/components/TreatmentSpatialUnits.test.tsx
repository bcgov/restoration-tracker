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

  it('renders correctly with no Treatment Units', async () => {
    await act(async () => {
      mockRestorationTrackerApi().project.getProjectTreatmentsYears.mockResolvedValue([]);
      const { getByText } = render(
        <Router history={history}>
          <TreatmentSpatialUnits treatmentList={[]} getTreatments={jest.fn()} getAttachments={jest.fn()} />
        </Router>
      );

      expect(getByText('Filter Treatments (0)')).toBeInTheDocument();
    });
  });

  it('renders menu correctly with no Treatment Units', async () => {
    const { getByText } = render(
      <Router history={history}>
        <TreatmentSpatialUnits treatmentList={[]} getTreatments={jest.fn()} getAttachments={jest.fn()} />
      </Router>
    );

    fireEvent.click(getByText('Filter Treatments (0)'));
    await waitFor(() => {
      expect(getByText('TREATMENT UNIT LAYERS (0)')).toBeInTheDocument();
    });
  });

  it('renders popup correctly', async () => {
    const { getAllByText, getByTestId } = render(
      <Router history={history}>
        <TreatmentSpatialUnits treatmentList={[]} getTreatments={jest.fn()} getAttachments={jest.fn()} />
      </Router>
    );

    fireEvent.click(getByTestId('open-layer-menu'));
    await waitFor(() => {
      const items = getAllByText('Import Treatments');
      expect(items).toHaveLength(2);
    });
  });

  // it('renders correctly with Treatment Units', async () => {
  //   mockRestorationTrackerApi().project.getProjectTreatmentsYears.mockResolvedValue([{ year: 99 }]);

  //   const { getByText } = render(
  //     <Router history={history}>
  //       <TreatmentSpatialUnits treatmentList={[]} getTreatments={jest.fn()} getAttachments={jest.fn()} />
  //     </Router>
  //   );

  //   screen.debug();

  //   await waitFor(() => {
  //     expect(getByText('Filter Treatments (1)')).toBeInTheDocument();
  //   });
  // });

  // it('renders menu correctly with Treatment Units', async () => {
  //   mockRestorationTrackerApi().project.getProjectTreatmentsYears.mockResolvedValue([{ year: 99 }]);
  //   const { getByText } = render(
  //     <Router history={history}>
  //       <TreatmentSpatialUnits treatmentList={[]} getTreatments={jest.fn()} getAttachments={jest.fn()} />
  //     </Router>
  //   );

  //   await waitFor(() => {
  //     fireEvent.click(getByText('Project Layers (1)'));
  //   });
  //   await waitFor(() => {
  //     expect(getByText('TREATMENT UNIT LAYERS (1)')).toBeInTheDocument();
  //   });
  // });
});
