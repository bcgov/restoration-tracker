import { fireEvent, render, waitFor } from '@testing-library/react';
import { Formik } from 'formik';
import React from 'react';
import ProjectPermitForm, {
  IProjectPermitForm,
  ProjectPermitFormInitialValues,
  ProjectPermitFormYupSchema
} from './ProjectPermitForm';

describe('ProjectPermitForm', () => {
  it('renders correctly with default empty values', () => {
    const { getByTestId } = render(
      <Formik
        initialValues={ProjectPermitFormInitialValues}
        validationSchema={ProjectPermitFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectPermitForm />}
      </Formik>
    );

    expect(getByTestId('permit.permits.[0].permit_number')).toBeVisible();
  });

  it('renders correctly with existing permit values', () => {
    const existingFormValues: IProjectPermitForm = {
      permit: {
        permits: [
          {
            permit_number: '123',
            permit_type: 'Forestry License to Cut'
          },
          {
            permit_number: '3213123123',
            permit_type: 'Road Use Permit'
          }
        ]
      }
    };

    const { getByTestId, getByText } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectPermitFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectPermitForm />}
      </Formik>
    );

    expect(getByTestId('permit.permits.[0].permit_number')).toBeVisible();
    expect(getByText('Forestry License to Cut')).toBeVisible();
    expect(getByText('Road Use Permit')).toBeVisible();
  });

  it('renders correctly with errors on the permit_number and permit_type fields', () => {
    const existingFormValues: IProjectPermitForm = {
      permit: {
        permits: [
          {
            permit_number: '123',
            permit_type: 'Forestry License to Cut'
          }
        ]
      }
    };

    const { asFragment } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectPermitFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        initialErrors={{
          permits: [{ permit_number: 'Error here', permit_type: 'Error here as well' }]
        }}
        initialTouched={{
          permits: [{ permit_number: true, permit_type: true }]
        }}
        onSubmit={async () => {}}>
        {() => <ProjectPermitForm />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with error on the permits field due to duplicates', () => {
    const existingFormValues: IProjectPermitForm = {
      permit: {
        permits: [
          {
            permit_number: '123',
            permit_type: 'Forestry License to Cut'
          },
          {
            permit_number: '123',
            permit_type: 'Road Use Permit'
          }
        ]
      }
    };

    const { asFragment } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectPermitFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        initialErrors={{ permits: 'Error is here' }}
        onSubmit={async () => {}}>
        {() => <ProjectPermitForm />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('deletes existing permits when delete icon is clicked', async () => {
    const existingFormValues: IProjectPermitForm = {
      permit: {
        permits: [
          {
            permit_number: '123',
            permit_type: 'Forestry License to Cut'
          }
        ]
      }
    };

    const { getByTestId, queryByText } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectPermitFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectPermitForm />}
      </Formik>
    );

    expect(queryByText('Permit Number')).toBeInTheDocument();

    fireEvent.click(getByTestId('delete-icon'));

    await waitFor(() => {
      expect(queryByText('Permit Number')).toBeNull();
    });
  });
});
