import { render } from '@testing-library/react';
import ProjectDraftForm, {
  ProjectDraftFormInitialValues,
  ProjectDraftFormYupSchema
} from 'features/projects/components/ProjectDraftForm';
import { Formik } from 'formik';
import React from 'react';

const handleSaveAndNext = jest.fn();

const projectDraftFilledValues = {
  draft_name: 'draft test name'
};

describe('Project Draft Form', () => {
  it('renders correctly with empty initial values', () => {
    const { getByTestId } = render(
      <Formik
        initialValues={ProjectDraftFormInitialValues}
        validationSchema={ProjectDraftFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async (values) => {
          handleSaveAndNext(values);
        }}>
        {() => <ProjectDraftForm />}
      </Formik>
    );

    expect(getByTestId('draft_name')).toBeVisible();
  });

  it('renders correctly with populated initial values', () => {
    const { getByTestId, getByDisplayValue } = render(
      <Formik
        initialValues={projectDraftFilledValues}
        validationSchema={ProjectDraftFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async (values) => {
          handleSaveAndNext(values);
        }}>
        {() => <ProjectDraftForm />}
      </Formik>
    );

    expect(getByTestId('draft_name')).toBeVisible();
    expect(getByDisplayValue('draft test name')).toBeVisible();
  });

  it('renders correctly with errors', () => {
    const { getByTestId, getByText } = render(
      <Formik
        initialValues={projectDraftFilledValues}
        initialErrors={{
          draft_name: 'Error this is a required field'
        }}
        initialTouched={{
          draft_name: true
        }}
        validationSchema={ProjectDraftFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async (values) => {
          handleSaveAndNext(values);
        }}>
        {() => <ProjectDraftForm />}
      </Formik>
    );

    expect(getByTestId('draft_name')).toBeVisible();
    expect(getByText('Error this is a required field')).toBeVisible();
  });
});
