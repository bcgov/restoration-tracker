import { render } from '@testing-library/react';
import { Formik } from 'formik';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
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
        {() => <ProjectGeneralInformationForm  species={
              codes?.species?.map((item) => {
                return { value: item.id, label: item.name };
              }) || []
            }/>}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with existing details values', () => {
    const existingFormValues: IProjectGeneralInformationForm = {
      project: {
        project_name: 'name 1',
        start_date: '2021-03-14',
        end_date: '2021-04-14',
        objectives: 'my objectives'
      },
      species:{
        focal_species:[1234, 321]
      }
    };

    const { asFragment } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectGeneralInformationFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectGeneralInformationForm  species={
              codes?.species?.map((item) => {
                return { value: item.id, label: item.name };
              }) || []
            } />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
