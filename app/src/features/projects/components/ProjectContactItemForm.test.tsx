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
    const { asFragment } = render(
      <Formik
        initialValues={ProjectContactItemInitialValues}
        validationSchema={ProjectContactItemYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectContactItemForm coordinator_agency={agencies} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
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

    const { asFragment } = render(
      <Formik
        initialValues={exsistingValues}
        validationSchema={ProjectContactItemYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectContactItemForm coordinator_agency={agencies} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
