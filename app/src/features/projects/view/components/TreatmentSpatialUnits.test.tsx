import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
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
  afterEach(() => {
    cleanup();
  });

  it('renders correctly with no Treatment Units', () => {
    const { getByText } = render(
      <Router history={history}>
        <TreatmentSpatialUnits treatmentList={[]} getTreatments={jest.fn()} getAttachments={jest.fn()} />
      </Router>
    );

    expect(getByText('Project Layers (0)')).toBeInTheDocument();
  });

  it('renders menu correctly with no Treatment Units', async () => {
    const { getByText } = render(
      <Router history={history}>
        <TreatmentSpatialUnits treatmentList={[]} getTreatments={jest.fn()} getAttachments={jest.fn()} />
      </Router>
    );

    fireEvent.click(getByText('Project Layers (0)'));
    await waitFor(() => {
      expect(getByText('TREATMENT UNIT LAYERS (0)')).toBeInTheDocument();
    });
  });

  it('renders popup correctly', async () => {
    const { getByText } = render(
      <Router history={history}>
        <TreatmentSpatialUnits treatmentList={[]} getTreatments={jest.fn()} getAttachments={jest.fn()} />
      </Router>
    );

    fireEvent.click(getByText('Import'));
    await waitFor(() => {
      expect(getByText('Upload Treatments')).toBeInTheDocument();
    });
  });

  it('renders correctly with Treatment Units', async () => {
    mockRestorationTrackerApi().project.getProjectTreatmentsYears.mockResolvedValue([{ year: 99 }]);
    const { getByText } = render(
      <Router history={history}>
        <TreatmentSpatialUnits treatmentList={[]} getTreatments={jest.fn()} getAttachments={jest.fn()} />
      </Router>
    );

    await waitFor(() => {
      expect(getByText('Project Layers (1)')).toBeInTheDocument();
    });
  });

  it('renders menu correctly with Treatment Units', async () => {
    mockRestorationTrackerApi().project.getProjectTreatmentsYears.mockResolvedValue([{ year: 99 }]);
    const { getByText } = render(
      <Router history={history}>
        <TreatmentSpatialUnits treatmentList={[]} getTreatments={jest.fn()} getAttachments={jest.fn()} />
      </Router>
    );

    await waitFor(() => {
      fireEvent.click(getByText('Project Layers (1)'));
    });
    await waitFor(() => {
      expect(getByText('TREATMENT UNIT LAYERS (1)')).toBeInTheDocument();
    });
  });
});
