import { render } from '@testing-library/react';
import ProjectCoordinatorForm, {
  ProjectCoordinatorInitialValues,
  ProjectCoordinatorYupSchema
} from 'features/projects/components/ProjectCoordinatorForm';
import { Formik } from 'formik';
import React from 'react';

const handleSaveAndNext = jest.fn();

const agencies = ['Agency 1', 'Agency 2', 'Agency 3'];

const projectCoordinatorFilledValues = {
  coordinator: {
    first_name: 'Nerea',
    last_name: 'Oneal',
    email_address: 'quxu@mailinator.com',
    coordinator_agency: 'Agency 3',
    share_contact_details: 'true'
  }
};

describe('Project Contact Form', () => {
  it('renders correctly the empty component correctly', () => {
    const { getByTestId } = render(
      <Formik
        initialValues={ProjectCoordinatorInitialValues}
        validationSchema={ProjectCoordinatorYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async (values) => {
          handleSaveAndNext(values);
        }}>
        {() => <ProjectCoordinatorForm coordinator_agency={[]} />}
      </Formik>
    );

    expect(getByTestId('coordinator.first_name')).toBeVisible();
    expect(getByTestId('coordinator.last_name')).toBeVisible();
    expect(getByTestId('coordinator.email_address')).toBeVisible();
    expect(getByTestId('coordinator.coordinator_agency')).toBeVisible();
  });

  it('renders correctly the filled component correctly', () => {
    const { getByTestId, getByDisplayValue } = render(
      <Formik
        initialValues={projectCoordinatorFilledValues}
        validationSchema={ProjectCoordinatorYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async (values, helper) => {
          handleSaveAndNext(values);
        }}>
        {() => <ProjectCoordinatorForm coordinator_agency={agencies} />}
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
