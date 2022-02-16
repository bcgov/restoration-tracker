import { render } from '@testing-library/react';
import ProjectContactForm, {
  ProjectContactInitialValues,
  ProjectContactYupSchema
} from 'features/projects/components/ProjectContactForm';
import { Formik } from 'formik';
import React from 'react';

const handleSaveAndNext = jest.fn();

const agencies = ['Agency 1', 'Agency 2', 'Agency 3'];

const projectContactFilledValues = {
  contact: {
    contacts: [
      {
        first_name: 'Nerea',
        last_name: 'Oneal',
        email_address: 'quxu@mailinator.com',
        agency: 'Agency 3',
        is_public: 'true',
        is_primary: 'true'
      },
      {
        first_name: 'John',
        last_name: 'Doe',
        email_address: 'jd@mailinator.com',
        agency: 'Agency 4',
        is_public: 'true',
        is_primary: 'true'
      }
    ]
  }
};

describe('Project Contact Form', () => {
  it('renders correctly the empty component correctly', () => {
    const { asFragment } = render(
      <Formik
        initialValues={ProjectContactInitialValues}
        validationSchema={ProjectContactYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async (values) => {
          handleSaveAndNext(values);
        }}>
        {() => <ProjectContactForm coordinator_agency={[]} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly the filled component correctly', () => {
    const { asFragment } = render(
      <Formik
        initialValues={projectContactFilledValues}
        validationSchema={ProjectContactYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async (values, helper) => {
          handleSaveAndNext(values);
        }}>
        {() => <ProjectContactForm coordinator_agency={agencies} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
