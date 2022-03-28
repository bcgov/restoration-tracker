import { Box, Divider, FormControl, Grid, InputLabel, MenuItem, Select, Typography } from '@material-ui/core';
import AutocompleteFreeSoloField from 'components/fields/AutocompleteFreeSoloField';
import CustomTextField from 'components/fields/CustomTextField';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteField';
import MultiAutocompleteFieldVariableSize from 'components/fields/MultiAutocompleteFieldVariableSize';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import { useFormikContext } from 'formik';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import React, { useCallback } from 'react';
import { IProjectAdvancedFilters } from './ProjectFilter';
import { debounce } from 'lodash-es';

export interface IProjectAdvancedFiltersProps {
  contact_agency: string[];
  funding_agency: IMultiAutocompleteFieldOption[];
  ranges: IMultiAutocompleteFieldOption[];
  region: IMultiAutocompleteFieldOption[];
}

/**
 * Project - Advanced filters
 *
 * @return {*}
 */
const ProjectAdvancedFilters: React.FC<IProjectAdvancedFiltersProps> = (props) => {
  const formikProps = useFormikContext<IProjectAdvancedFilters>();
  const { handleChange, values } = formikProps;

  const restorationTrackerApi = useRestorationTrackerApi();

  const convertOptions = (value: any): IMultiAutocompleteFieldOption[] =>
    value.map((item: any) => {
      return { value: parseInt(item.id), label: item.label };
    });

  const handleGetInitList = async (values: number[]) => {
    const response = await restorationTrackerApi.taxonomy.getSpeciesFromIds(values);
    return convertOptions(response.searchResponse);
  };

  const handleSearch = useCallback(
    debounce(
      async (
        inputValue: string,
        existingValues: (string | number)[],
        callback: (searchedValues: IMultiAutocompleteFieldOption[]) => void
      ) => {
        const response = await restorationTrackerApi.taxonomy.searchSpecies(inputValue);
        const newOptions = convertOptions(response.searchResponse).filter(
          (item) => !existingValues.includes(item.value)
        );
        callback(newOptions);
      },
      500
    ),
    []
  );

  return (
    <Box data-testid="advancedFilters">
      <Grid container spacing={3} justify="flex-start">
        <Grid item xs={12} md={3}>
          <Typography variant="subtitle1" component="h3">
            <strong>Project Details</strong>
          </Typography>
        </Grid>
        <Grid item xs={12} md={9}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AutocompleteFreeSoloField
                id="contact_agency"
                name="contact_agency"
                label="Contact Agency"
                options={props.contact_agency}
                required={false}
              />
            </Grid>
            <Grid item xs={12}>
              <StartEndDateFields
                formikProps={formikProps}
                startName={'start_date'}
                endName={'end_date'}
                startRequired={false}
                endRequired={false}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined" required={false}>
                <InputLabel id="funding_agency-label">Funding Agencies</InputLabel>
                <Select
                  data-testid="funding_agency"
                  id="funding_agency"
                  name="funding_agency"
                  labelId="funding_agency-label"
                  label="Funding Agencies"
                  value={values.funding_agency?.toString() ? values.funding_agency : []}
                  onChange={handleChange}
                  defaultValue={[]}
                  multiple
                  displayEmpty
                  inputProps={{ 'aria-label': 'Funding Agency Name', 'data-testid': 'funding_agency' }}>
                  {props.funding_agency.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <MultiAutocompleteFieldVariableSize
                id="species"
                label="Species"
                required={false}
                type="api-search"
                getInitList={handleGetInitList}
                search={handleSearch}
              />
            </Grid>
            <Grid item xs={6}>
              <MultiAutocompleteFieldVariableSize
                id="ranges"
                data-testid="ranges"
                label="Caribou Ranges"
                options={props.ranges}
                required={false}
              />
            </Grid>
            <Grid item xs={6}>
              <MultiAutocompleteFieldVariableSize
                id="region"
                data-testid="region"
                label="FLNRO Region"
                options={props.region}
                required={false}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Box my={3}>
        <Divider></Divider>
      </Box>

      <Grid container spacing={3} justify="flex-start">
        <Grid item xs={12} md={3}>
          <Typography variant="subtitle1" component="h3">
            <strong>Permits</strong>
          </Typography>
        </Grid>
        <Grid item xs={12} md={9}>
          <CustomTextField name="permit_number" label="Permit Number" />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectAdvancedFilters;
