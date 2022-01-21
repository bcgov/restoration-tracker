import { render } from '@testing-library/react';
import { Formik } from 'formik';
import React from 'react';
import ProjectGeneralInformationForm, {
  IProjectGeneralInformationForm,
  ProjectGeneralInformationFormInitialValues,
  ProjectGeneralInformationFormYupSchema
} from './ProjectGeneralInformationForm';

describe('ProjectGeneralInformationForm', () => {
  it('renders correctly with default empty values', () => {
    const { asFragment } = render(
      <Formik
        initialValues={ProjectGeneralInformationFormInitialValues}
        validationSchema={ProjectGeneralInformationFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectGeneralInformationForm />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with existing details values', () => {
    const existingFormValues: IProjectGeneralInformationForm = {
      project_name: 'name 1',
      start_date: '2021-03-14',
      end_date: '2021-04-14',
      objectives: 'my objectives'
    };

    const { asFragment } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectGeneralInformationFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectGeneralInformationForm />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
