import { cleanup, render, waitFor } from '@testing-library/react';
import { Formik } from 'formik';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import React from 'react';
import { MemoryRouter } from 'react-router';
import ProjectAdvancedFilters from './ProjectAdvancedFilters';
import { IProjectAdvancedFilters, ProjectAdvancedFiltersInitialValues } from './ProjectFilter';

jest.mock('../../hooks/useRestorationTrackerApi');
const mockuseRestorationTrackerApi = {
  taxonomy: {
    searchSpecies: jest.fn().mockResolvedValue({ searchResponse: [] }),
    getSpeciesFromIds: jest.fn().mockResolvedValue({ searchResponse: [] })
  }
};

const mockRestorationTrackerApi = ((useRestorationTrackerApi as unknown) as jest.Mock<
  typeof mockuseRestorationTrackerApi
>).mockReturnValue(mockuseRestorationTrackerApi);

describe('ProjectAdvancedFilters', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockRestorationTrackerApi().taxonomy.searchSpecies.mockClear();
    mockRestorationTrackerApi().taxonomy.getSpeciesFromIds.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  test('renders properly when no props are given', async () => {
    const { getByLabelText } = render(
      <MemoryRouter>
        <Formik initialValues={ProjectAdvancedFiltersInitialValues} onSubmit={() => {}}>
          <ProjectAdvancedFilters funding_agency={[]} contact_agency={[]} ranges={[]} region={[]} />
        </Formik>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByLabelText('Contact Agency')).toBeInTheDocument();
      expect(getByLabelText('Start Date')).toBeInTheDocument();
      expect(getByLabelText('End Date')).toBeInTheDocument();
      expect(getByLabelText('Funding Agencies')).toBeInTheDocument();
      expect(getByLabelText('Species')).toBeInTheDocument();
      expect(getByLabelText('Permit Number')).toBeInTheDocument();
    });
  });

  test('renders properly when props are given', async () => {
    const funding_agency = [
      { value: 1, label: 'label1' },
      { value: 2, label: 'label2' },
      { value: 3, label: 'label3' }
    ];
    const contact_agency = ['agency1', 'agency2', 'agency3'];

    const { getByTestId, getAllByTestId } = render(
      <MemoryRouter>
        <Formik initialValues={ProjectAdvancedFiltersInitialValues} onSubmit={() => {}}>
          <ProjectAdvancedFilters
            funding_agency={funding_agency}
            contact_agency={contact_agency}
            ranges={[]}
            region={[]}
          />
        </Formik>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByTestId('advancedFilters')).toBeInTheDocument();
      expect(getByTestId('contact_agency')).toBeInTheDocument();
      expect(getAllByTestId('funding_agency').length).toEqual(2);
      expect(getByTestId('permit_number')).toBeInTheDocument();
      expect(getByTestId('start_date')).toBeInTheDocument();
      expect(getByTestId('end_date')).toBeInTheDocument();
      expect(getByTestId('species')).toBeInTheDocument();
    });
  });

  test('renders properly when props and inital values are given', async () => {
    mockRestorationTrackerApi().taxonomy.searchSpecies.mockResolvedValue({
      searchResponse: [{ id: 1, label: 'species1' }]
    });
    mockRestorationTrackerApi().taxonomy.getSpeciesFromIds.mockResolvedValue({
      searchResponse: [{ id: 1, label: 'species1' }]
    });

    const ProjectAdvancedFiltersInitialValues: IProjectAdvancedFilters = {
      contact_agency: 'agency1',
      permit_number: 'temp2',
      funding_agency: [1],
      start_date: '',
      end_date: '',
      keyword: 'temp3',
      species: [1]
    };
    const funding_agency = [
      { value: 1, label: 'label1' },
      { value: 2, label: 'label2' },
      { value: 3, label: 'label3' }
    ];
    const contact_agency = ['agency1', 'agency2', 'agency3'];

    const { queryByText } = render(
      <MemoryRouter>
        <Formik<IProjectAdvancedFilters> initialValues={ProjectAdvancedFiltersInitialValues} onSubmit={() => {}}>
          <ProjectAdvancedFilters
            funding_agency={funding_agency}
            contact_agency={contact_agency}
            ranges={[]}
            region={[]}
          />
        </Formik>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(queryByText('species1')).toBeInTheDocument();
      expect(queryByText('label1')).toBeInTheDocument();
    });
  });
});
