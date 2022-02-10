import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Theme,
  Typography
} from '@material-ui/core';
import AutocompleteFreeSoloField from 'components/fields/AutocompleteFreeSoloField';
import CustomTextField from 'components/fields/CustomTextField';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteField';
import MultiAutocompleteFieldVariableSize from 'components/fields/MultiAutocompleteFieldVariableSize';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import { useFormikContext } from 'formik';
import React from 'react';
import { IProjectAdvancedFilters } from './ProjectFilter';

const useStyles = makeStyles((theme: Theme) => ({
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  }
}));

export interface IProjectAdvancedFiltersProps {
  species: IMultiAutocompleteFieldOption[];
  funding_sources: IMultiAutocompleteFieldOption[];
  coordinator_agency: string[];
  handleFilterUpdate: () => void;
  handleFilterReset: () => void;
}

/**
 * Project - Advanced filters
 *
 * @return {*}
 */
const ProjectAdvancedFilters: React.FC<IProjectAdvancedFiltersProps> = (props) => {
  const classes = useStyles();

  const formikProps = useFormikContext<IProjectAdvancedFilters>();
  const { handleChange, values } = formikProps;

  return (
    <Box my={3}>
      <Grid container spacing={3} justify="flex-start">
        <Grid item xs={12} md={2}>
          <Typography style={{ fontWeight: 600 }}>Agency</Typography>
        </Grid>
        <Grid item xs={12} md={1}></Grid>
        <Grid item xs={12} md={3}>
          <AutocompleteFreeSoloField
            id="coordinator_agency"
            name="coordinator_agency"
            label="Contact Agency"
            options={props.coordinator_agency}
            required={false}
          />
        </Grid>
      </Grid>

      <Box my={3}>
        <Divider></Divider>
      </Box>

      <Grid container spacing={3} justify="flex-start">
        <Grid item xs={12} md={2}>
          <Typography style={{ fontWeight: 600 }}>Funding Agencies and Partnerships</Typography>
        </Grid>
        <Grid item xs={12} md={1}></Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth variant="outlined" required={false}>
            <InputLabel id="agency_id-label">Funding Agency Name</InputLabel>
            <Select
              id="agency_id"
              name="agency_id"
              labelId="agency_id-label"
              label="Funding Agency Name"
              value={values.agency_id ?? ''}
              onChange={handleChange}
              defaultValue=""
              displayEmpty
              inputProps={{ 'aria-label': 'Funding Agency Name', 'data-testid': 'agency-id' }}>
              {props.funding_sources.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box my={3}>
        <Divider></Divider>
      </Box>

      <Grid container spacing={3} justify="flex-start">
        <Grid item xs={12} md={2}>
          <Typography style={{ fontWeight: 600 }}>Permits</Typography>
        </Grid>
        <Grid item xs={12} md={1}></Grid>
        <Grid item xs={12} md={3}>
          <CustomTextField name="permit_number" label="Permit Number" />
        </Grid>
      </Grid>

      <Box my={3}>
        <Divider></Divider>
      </Box>

      <Grid container spacing={3} justify="flex-start">
        <Grid item xs={12} md={2}>
          <Typography style={{ fontWeight: 600 }}>Date Range</Typography>
        </Grid>
        <Grid item xs={12} md={1}></Grid>
        <Grid item xs={12} md={6}>
          <StartEndDateFields
            formikProps={formikProps}
            startName={'start_date'}
            endName={'end_date'}
            startRequired={false}
            endRequired={false}
          />
        </Grid>
      </Grid>

      <Box my={3}>
        <Divider></Divider>
      </Box>

      <Grid container spacing={3} justify="flex-start">
        <Grid item xs={12} md={2}>
          <Typography style={{ fontWeight: 600 }}>Species</Typography>
        </Grid>
        <Grid item xs={12} md={1}></Grid>
        <Grid item xs={12} md={3}>
          <MultiAutocompleteFieldVariableSize id="species" label="Species" options={props.species} required={false} />
        </Grid>
      </Grid>

      <Box my={3}>
        <Divider></Divider>
      </Box>

      <Grid container direction="row" justify="flex-end" alignItems="center" spacing={1}>
        <Grid item xs={1}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="medium"
            fullWidth
            className={classes.actionButton}
            onClick={props.handleFilterUpdate}>
            Apply
          </Button>
        </Grid>
        <Grid item xs={1}>
          <Button
            type="reset"
            variant="outlined"
            color="primary"
            size="medium"
            fullWidth
            className={classes.actionButton}
            onClick={props.handleFilterReset}>
            Reset
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectAdvancedFilters;
