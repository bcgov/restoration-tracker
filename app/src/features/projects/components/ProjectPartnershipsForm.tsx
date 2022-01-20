import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import MultiAutocompleteFieldVariableSize, {
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IProjectPartnershipsForm {
  partnerships: {
    indigenous_partnerships: number[];
    stakeholder_partnerships: string[];
  };
}

export const ProjectPartnershipsFormInitialValues: IProjectPartnershipsForm = {
  partnerships: {
    indigenous_partnerships: [],
    stakeholder_partnerships: []
  }
};

export const ProjectPartnershipsFormYupSchema = yup.object().shape({});

export interface IProjectPartnershipsFormProps {
  first_nations: IMultiAutocompleteFieldOption[];
  stakeholder_partnerships: IMultiAutocompleteFieldOption[];
}

/**
 * Create project - Partnerships section
 *
 * @return {*}
 */
const ProjectPartnershipsForm: React.FC<IProjectPartnershipsFormProps> = (props) => {
  return (
    <>
      <Typography component="legend">Partnerships</Typography>

      <Box mb={3} maxWidth={'72ch'}>
        <Typography variant="body1" color="textSecondary">
          Specify any additional partnerships that have not been previously identified as a funding sources.
        </Typography>
      </Box>

      <Grid container spacing={3} direction="column">
        <Grid item xs={12}>
          <MultiAutocompleteFieldVariableSize
            id={'indigenous_partnerships'}
            label={'Indigenous Partnerships'}
            options={props.first_nations}
            required={false}
          />
        </Grid>
        <Grid item xs={12}>
          <MultiAutocompleteFieldVariableSize
            id={'stakeholder_partnerships'}
            label={'Other Partnerships'}
            options={props.stakeholder_partnerships}
            required={false}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default ProjectPartnershipsForm;
