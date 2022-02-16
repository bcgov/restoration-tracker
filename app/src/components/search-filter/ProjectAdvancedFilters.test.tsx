// import { createMemoryHistory } from 'history';
// const history = createMemoryHistory();

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ProjectAdvancedFilters from './ProjectAdvancedFilters';
import { MemoryRouter } from 'react-router';
import { Formik } from 'formik';
import { IProjectAdvancedFilters } from './ProjectFilter';
// import { createMemoryHistory } from 'history';

// const history = createMemoryHistory();

describe('ProjectAdvancedFilters', () => {
  test('renders properly when no props are given', async () => {
    const { getByLabelText } = render(
      <MemoryRouter>
        <Formik initialValues={[]} onSubmit={() => {}}>
          <ProjectAdvancedFilters species={[]} funding_agency={[]} contact_agency={[]} />
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
    const species = [
      { value: 1, label: 'species1' },
      { value: 2, label: 'species2' },
      { value: 3, label: 'species3' }
    ];
    const funding_agency = [
      { value: 1, label: 'label1' },
      { value: 2, label: 'label2' },
      { value: 3, label: 'label3' }
    ];
    const contact_agency = ['agency1', 'agency2', 'agency3'];

    const { getByTestId, getAllByTestId } = render(
      <MemoryRouter>
        <Formik initialValues={[]} onSubmit={() => {}}>
          <ProjectAdvancedFilters species={species} funding_agency={funding_agency} contact_agency={contact_agency} />
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
    const ProjectAdvancedFiltersInitialValues: IProjectAdvancedFilters = {
      contact_agency: 'agency1',
      permit_number: 'temp2',
      funding_agency: [1],
      start_date: '',
      end_date: '',
      keyword: 'temp3',
      species: [1]
    };
    const species = [
      { value: 1, label: 'species1' },
      { value: 2, label: 'species2' },
      { value: 3, label: 'species3' }
    ];
    const funding_agency = [
      { value: 1, label: 'label1' },
      { value: 2, label: 'label2' },
      { value: 3, label: 'label3' }
    ];
    const contact_agency = ['agency1', 'agency2', 'agency3'];

    const { queryByText } = render(
      <MemoryRouter>
        <Formik<IProjectAdvancedFilters> initialValues={ProjectAdvancedFiltersInitialValues} onSubmit={() => {}}>
          <ProjectAdvancedFilters species={species} funding_agency={funding_agency} contact_agency={contact_agency} />
        </Formik>
      </MemoryRouter>
    );

    screen.debug();

    await waitFor(() => {
      expect(queryByText('species1')).toBeInTheDocument();
      expect(queryByText('label1')).toBeInTheDocument();
    });
  });
});
