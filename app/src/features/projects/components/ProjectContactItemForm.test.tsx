import { render } from '@testing-library/react';
import { Formik } from 'formik';
import React from 'react';
import ProjectContactItemForm, {
  IProjectContactItemForm,
  ProjectContactItemInitialValues,
  ProjectContactItemYupSchema
} from './ProjectContactItemForm';

const agencies = ['Agency 1', 'Agency 2', 'Agency 3'];

describe('ProjectContactItemForm', () => {
  it('renders correctly with default empty values', () => {
    const { getByTestId } = render(
      <Formik
        initialValues={ProjectContactItemInitialValues}
        validationSchema={ProjectContactItemYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectContactItemForm coordinator_agency={agencies} />}
      </Formik>
    );

    expect(getByTestId('coordinator.first_name')).toBeVisible();
    expect(getByTestId('coordinator.last_name')).toBeVisible();
    expect(getByTestId('coordinator.email_address')).toBeVisible();
    expect(getByTestId('coordinator.coordinator_agency')).toBeVisible();
  });

  it('renders renders correctly with exsisting values', () => {
    const exsistingValues: IProjectContactItemForm = {
      first_name: 'John',
      last_name: 'Doe',
      email_address: 'jd@example.com',
      agency: 'A Rocha Canada',
      is_public: 'true',
      is_primary: 'true'
    };

    const { getByTestId, getByDisplayValue } = render(
      <Formik
        initialValues={exsistingValues}
        validationSchema={ProjectContactItemYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectContactItemForm coordinator_agency={agencies} />}
      </Formik>
    );

    expect(getByTestId('coordinator.first_name')).toBeVisible();
    expect(getByTestId('coordinator.last_name')).toBeVisible();
    expect(getByTestId('coordinator.email_address')).toBeVisible();
    expect(getByTestId('coordinator.coordinator_agency')).toBeVisible();
    expect(getByDisplayValue('Nerea')).toBeVisible();
    expect(getByDisplayValue('Oneal')).toBeVisible();
    expect(getByDisplayValue('quxu@mailinator.com')).toBeVisible();
  });
});
