import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import AutocompleteFreeSoloField from 'components/fields/AutocompleteFreeSoloField';
import CustomTextField from 'components/fields/CustomTextField';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IProjectCoordinatorForm {
  first_name: string;
  last_name: string;
  email_address: string;
  coordinator_agency: string;
}

export const ProjectCoordinatorInitialValues: IProjectCoordinatorForm = {
  first_name: '',
  last_name: '',
  email_address: '',
  coordinator_agency: ''
};

export const ProjectCoordinatorYupSchema = yup.object().shape({
  first_name: yup.string().max(50, 'Cannot exceed 50 characters').required('Required'),
  last_name: yup.string().max(50, 'Cannot exceed 50 characters').required('Required'),
  email_address: yup
    .string()
    .max(500, 'Cannot exceed 500 characters')
    .email('Must be a valid email address')
    .required('Required'),
  coordinator_agency: yup.string().max(300, 'Cannot exceed 300 characters').required('Required').nullable()
});

export interface IProjectCoordinatorFormProps {
  coordinator_agency: string[];
}

/**
 * A modal form for a single project coordinator.
 *
 * @See ProjectContactForm.tsx
 *
 * @return {*}
 */
const ProjectCoordinatorForm: React.FC<IProjectCoordinatorFormProps> = (props) => {
  return (
    <form data-testid="coordinator-form">
      <Box component="fieldset">
        <Typography id="agency_details" component="legend">
          Coordinator Details
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <CustomTextField
              name="first_name"
              label="First Name"
              other={{
                required: true
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomTextField
              name="last_name"
              label="Last Name"
              other={{
                required: true
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name="email_address"
              label="Business Email Address"
              other={{
                required: true
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <AutocompleteFreeSoloField
              id="coordinator_agency"
              name="coordinator_agency"
              label="Contact Agency"
              options={props.coordinator_agency}
              required={true}
            />
          </Grid>
        </Grid>
      </Box>
      <Box mt={4}>
        <Divider />
      </Box>
    </form>
  );
};

export default ProjectCoordinatorForm;
