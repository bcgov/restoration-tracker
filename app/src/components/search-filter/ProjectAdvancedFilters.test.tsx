// import { createMemoryHistory } from 'history';
// const history = createMemoryHistory();

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import ProjectAdvancedFilters from './ProjectAdvancedFilters';
import { MemoryRouter } from 'react-router';
import { Formik } from 'formik';
import { IProjectAdvancedFilters } from './ProjectFilter';
// import { createMemoryHistory } from 'history';

// const history = createMemoryHistory();

describe('ProjectAdvancedFilters', () => {
  test('renders properly when no props are given', async () => {
    const { getByText, getAllByText } = render(
      <MemoryRouter>
        <Formik initialValues={[]} onSubmit={() => {}}>
          <ProjectAdvancedFilters species={[]} funding_sources={[]} coordinator_agency={[]} />
        </Formik>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByText('Agency')).toBeInTheDocument();
      expect(getByText('Funding Agencies and Partnerships')).toBeInTheDocument();
      expect(getByText('Permits')).toBeInTheDocument();
      expect(getByText('Date Range')).toBeInTheDocument();
      expect(getAllByText('Species').length).toEqual(3);
    });
  });

  test('renders properly when props are given', async () => {
    const species = [
      { value: 1, label: 'species1' },
      { value: 2, label: 'species2' },
      { value: 3, label: 'species3' }
    ];
    const funding_sources = [
      { value: 1, label: 'label1' },
      { value: 2, label: 'label2' },
      { value: 3, label: 'label3' }
    ];
    const coordinator_agency = ['agency1', 'agency2', 'agency3'];

    const { getByTestId } = render(
      <MemoryRouter>
        <Formik initialValues={[]} onSubmit={() => {}}>
          <ProjectAdvancedFilters
            species={species}
            funding_sources={funding_sources}
            coordinator_agency={coordinator_agency}
          />
        </Formik>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByTestId('advancedFilters')).toBeInTheDocument();
      expect(getByTestId('coordinator_agency')).toBeInTheDocument();
      expect(getByTestId('agency_id')).toBeInTheDocument();
      expect(getByTestId('permit_number')).toBeInTheDocument();
      expect(getByTestId('start_date')).toBeInTheDocument();
      expect(getByTestId('end_date')).toBeInTheDocument();
      expect(getByTestId('species')).toBeInTheDocument();
    });
  });

  test('renders properly when props and inital values are given', async () => {

    const ProjectAdvancedFiltersInitialValues: IProjectAdvancedFilters[] = [{
      coordinator_agency: 'temp1',
      permit_number: 'temp2',
      start_date: '',
      end_date: '',
      keyword: 'temp3',
      project_name: 'temp4',
      agency_id: ('3' as unknown) as number,
      agency_project_id: 'temp6',
      species: [7]
    }];

    const species = [
      { value: 1, label: 'species1' },
      { value: 2, label: 'species2' },
      { value: 3, label: 'species3' }
    ];
    const funding_sources = [
      { value: 1, label: 'label1' },
      { value: 2, label: 'label2' },
      { value: 3, label: 'label3' }
    ];
    const coordinator_agency = ['agency1', 'agency2', 'agency3'];

    const { getByText } = render(
      <MemoryRouter>
        <Formik initialValues={ProjectAdvancedFiltersInitialValues} onSubmit={() => {}}>
          <ProjectAdvancedFilters
            species={species}
            funding_sources={funding_sources}
            coordinator_agency={coordinator_agency}
          />
        </Formik>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByText('temp1')).toBeInTheDocument();
      expect(getByText('temp2')).toBeInTheDocument();
      expect(getByText('temp3')).toBeInTheDocument();
      expect(getByText('temp4')).toBeInTheDocument();
    });

  });
});
