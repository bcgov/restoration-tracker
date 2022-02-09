import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  FormControl,
  Grid,
  Input,
  InputLabel,
  MenuItem,
  Select,
  Typography
} from '@material-ui/core';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Icon } from '@mdi/react';
import { mdiMagnify, mdiMenuDown, mdiMenuUp, mdiClose } from '@mdi/js';
import { useFormikContext } from 'formik';
import React, { useEffect, useState } from 'react';
import CustomTextField from 'components/fields/CustomTextField';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import AutocompleteFreeSoloField from 'components/fields/AutocompleteFreeSoloField';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteField';
import MultiAutocompleteFieldVariableSize from 'components/fields/MultiAutocompleteFieldVariableSize';

const useStyles = makeStyles((theme: Theme) => ({
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  },
  filtersBox: {
    background: '#f7f8fa'
  },
  keywordSearch: {
    display: 'flex',
    alignItems: 'center',
    height: '46px',
    border: '1px solid',
    borderColor: '#adb5bd'
  },
  keywordSearchLeft: {
    borderTopLeftRadius: '4px',
    borderBottomLeftRadius: '4px'
  },
  keywordSearchRight: {
    borderLeft: '0px',
    borderTopRightRadius: '4px',
    borderBottomRightRadius: '4px'
  },
  chipStyle: {
    color: 'white',
    backgroundColor: '#38598a',
    textTransform: 'capitalize'
  }
}));

export const ProjectAdvancedFiltersInitialValues: IProjectAdvancedFilters = {
  coordinator_agency: '',
  permit_number: '',
  start_date: '',
  end_date: '',
  keyword: '',
  project_name: '',
  agency_id: ('' as unknown) as number,
  agency_project_id: '',
  species: []
};

export interface IProjectAdvancedFilters {
  coordinator_agency: string;
  permit_number: string;
  start_date: string;
  end_date: string;
  keyword: string;
  project_name: string;
  agency_id: number;
  agency_project_id: string;
  species: number[];
}

export interface IProjectAdvancedFiltersProps {
  species: IMultiAutocompleteFieldOption[];
  funding_sources: IMultiAutocompleteFieldOption[];
  coordinator_agency: string[];
  filterChipParams: IProjectAdvancedFilters;
}

/**
 * Project - filters
 *
 * @return {*}
 */
const ProjectFilter: React.FC<IProjectAdvancedFiltersProps> = (props) => {
  const classes = useStyles();

  const [isAdvancedFitersOpen, setIsAdvancedFitersOpen] = useState(false);
  const [isFiltersChipsOpen, setIsFiltersChipsOpen] = useState(false);

  const { filterChipParams } = props;

  const formikProps = useFormikContext<IProjectAdvancedFilters>();
  const { handleSubmit, handleChange, handleReset, values } = formikProps;

  const handleDelete = (key: string) => {
    console.log(JSON.stringify(values));
    values[key] = '';
    handleChange(values[key]);
    console.log(JSON.stringify(values));
    handleSubmit();
  };

  const handleFilterReset= () => {
    setIsFiltersChipsOpen(false);
    handleReset();
  };

  const handleFilterUpdate = () => {
    setIsFiltersChipsOpen(true);
    setIsAdvancedFitersOpen(false);
    handleSubmit();
  };

  useEffect(() => {
    const setInitialFilterChips = () => {
      if (filterChipParams !== ProjectAdvancedFiltersInitialValues) {
        setIsFiltersChipsOpen(true);
      }
    };

    setInitialFilterChips();
  }, [filterChipParams]);


  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <Box m={3}>
          <Box mb={2}>
            <Typography variant="h2">Filter Projects</Typography>
          </Box>
          <Grid container direction="row" justify="flex-start" alignItems="center" spacing={0}>
            <Grid item xs={10}>
              <Box className={`${classes.keywordSearch} ${classes.keywordSearchLeft}`}>
                <Box m={1} pt={0.5}>
                  <Icon path={mdiMagnify} size={1} />
                </Box>
                <Input
                  name="keyword"
                  fullWidth
                  disableUnderline={true}
                  placeholder="Enter Keywords"
                  onChange={handleChange}
                  value={values.keyword}
                />
              </Box>
            </Grid>
            <Grid item xs={1}>
              <Box className={`${classes.keywordSearch} ${classes.keywordSearchRight}`}>
                <Button
                  size="large"
                  variant="text"
                  color="primary"
                  fullWidth
                  disableRipple={true}
                  endIcon={
                    (!isAdvancedFitersOpen && <Icon path={mdiMenuDown} size={1} />) ||
                    (isAdvancedFitersOpen && <Icon path={mdiMenuUp} size={1} />)
                  }
                  onClick={() => setIsAdvancedFitersOpen(!isAdvancedFitersOpen)}>
                  <Typography style={{ fontWeight: 600, fontSize: '14px' }}>Advanced</Typography>
                </Button>
              </Box>
            </Grid>
            <Grid item xs={1}>
              <Box ml={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  className={classes.actionButton}
                  onClick={handleFilterUpdate}>
                  Apply
                </Button>
              </Box>
            </Grid>
          </Grid>
          {isFiltersChipsOpen && (
            <Box my={2}>
              <Grid container direction="row" justify="flex-start" alignItems="center" spacing={1}>
                <Grid item>
                  <Typography variant="h4">Filters </Typography>
                </Grid>
                {Object.entries(filterChipParams).map(
                  ([key, value], index) =>
                    value && (
                      <Grid item xs="auto" key={`${key}${index}`}>
                        <Chip
                          label={`${key}: ${value}`}
                          className={classes.chipStyle}
                          onDelete={() => handleDelete(key)}
                          deleteIcon={<Icon path={mdiClose} color='white' size={1} />}
                        />
                      </Grid>
                    )
                )}
                <Grid item>
                  <Chip label={'Clear all'} onClick={handleFilterReset}/>
                </Grid>
              </Grid>
            </Box>
          )}

          {isAdvancedFitersOpen && (
            <Box my={2}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <CustomTextField name="project_name" label="Project Name" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <StartEndDateFields
                    formikProps={formikProps}
                    startName={'start_date'}
                    endName={'end_date'}
                    startRequired={false}
                    endRequired={false}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <AutocompleteFreeSoloField
                    id="coordinator_agency"
                    name="coordinator_agency"
                    label="Contact Agency"
                    options={props.coordinator_agency}
                    required={false}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <CustomTextField name="permit_number" label="Permit Number" />
                </Grid>
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
                <Grid item xs={12} md={3}>
                  <CustomTextField name="agency_project_id" label="Funding Agency Project ID" />
                </Grid>
                <Grid item xs={12} md={3}>
                  <MultiAutocompleteFieldVariableSize
                    id="species"
                    label="Species"
                    options={props.species}
                    required={false}
                  />
                </Grid>
              </Grid>
              <Box my={2}>
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
                    onClick={handleFilterUpdate}>
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
                    onClick={handleFilterReset}>
                    Reset
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Card>
    </form>
  );
};

export default ProjectFilter;
