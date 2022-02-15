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
    const { getByTestId } = render(
      <Formik
        initialValues={ProjectGeneralInformationFormInitialValues}
        validationSchema={ProjectGeneralInformationFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectGeneralInformationForm />}
      </Formik>
    );

    expect(getByTestId("project.project_name")).toBeVisible();
    expect(getByTestId("start_date")).toBeVisible();
    expect(getByTestId("end_date")).toBeVisible();
    expect(getByTestId("project.objectives")).toBeVisible();
  });

  it('renders correctly with existing details values', () => {
    const existingFormValues: IProjectGeneralInformationForm = {
      project: {
        project_name: 'name 1',
        start_date: '2021-03-14',
        end_date: '2021-04-14',
        objectives: 'my objectives'
      }
    };

    const { getByTestId, getByDisplayValue } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectGeneralInformationFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectGeneralInformationForm />}
      </Formik>
    );

    expect(getByTestId("project.project_name")).toBeVisible();
    expect(getByTestId("start_date")).toBeVisible();
    expect(getByTestId("end_date")).toBeVisible();
    expect(getByTestId("project.objectives")).toBeVisible();
    expect(getByDisplayValue("name 1")).toBeVisible();
    expect(getByDisplayValue("my objectives")).toBeVisible();
  });
});
