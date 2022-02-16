import { Box, Button, Card, Chip, Divider, Grid, Input, Typography } from '@material-ui/core';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Icon } from '@mdi/react';
import { mdiMagnify, mdiMenuDown, mdiMenuUp, mdiClose } from '@mdi/js';
import { useFormikContext } from 'formik';
import React, { useEffect, useState } from 'react';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteField';
import ProjectAdvancedFilters from './ProjectAdvancedFilters';

const useStyles = makeStyles((theme: Theme) => ({
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
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
  keyword: '',
  contact_agency: '',
  funding_agency: [],
  permit_number: '',
  species: [],
  start_date: '',
  end_date: ''
};

export interface IProjectAdvancedFilters {
  keyword?: string;
  contact_agency?: string | string[];
  funding_agency?: number | number[];
  permit_number?: string;
  species?: number | number[];
  start_date?: string;
  end_date?: string;
}

export const ProjectAdvancedFiltersKeyLabels = {
  keyword: { label: 'Keyword' },
  contact_agency: { label: 'Contact Agency' },
  funding_agency: { label: 'Funding Agency', codeSet: 'funding_agency' },
  permit_number: { label: 'Permit Number' },
  species: { label: 'Species', codeSet: 'species' },
  start_date: { label: 'Start Date' },
  end_date: { label: 'End Date' }
};

export interface IProjectAdvancedFiltersProps {
  species: IMultiAutocompleteFieldOption[];
  contact_agency: string[];
  funding_agency: IMultiAutocompleteFieldOption[];
  filterChipParams: IProjectAdvancedFilters;
}

/**
 * Project - filters
 *
 * @return {*}
 */
const ProjectFilter: React.FC<IProjectAdvancedFiltersProps> = (props) => {
  const classes = useStyles();
  const { filterChipParams, contact_agency, species, funding_agency } = props;

  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [isFiltersChipsOpen, setIsFiltersChipsOpen] = useState(false);

  const formikProps = useFormikContext<IProjectAdvancedFilters>();
  const { handleSubmit, handleChange, handleReset, values, setFieldValue } = formikProps;

  const handleDelete = (key: string, value: string | number) => {
    console.log(values[key]);

    if (Array.isArray(values[key]) && values[key].length !== 1) {
      values[key] = values[key].pop(value);
    } else {
      values[key] = ProjectAdvancedFiltersInitialValues[key];
    }

    setFieldValue(key, values[key]);

    if (JSON.stringify(values) === JSON.stringify(ProjectAdvancedFiltersInitialValues)) {
      //if current filters are equal to inital values, then no filters are set ....
      //then reset filter chips to closed
      handleFilterReset();
    } else {
      handleSubmit();
    }
  };

  const handleFilterReset = () => {
    setIsFiltersChipsOpen(false);
    handleReset();
  };

  const handleFilterUpdate = async () => {
    if (JSON.stringify(values) === JSON.stringify(ProjectAdvancedFiltersInitialValues)) {
      return;
    }

    await handleSubmit();
    setIsAdvancedFiltersOpen(false);
    setIsFiltersChipsOpen(true);
  };

  //Filter chip collection
  useEffect(() => {
    const setInitialFilterChips = () => {
      if (filterChipParams !== ProjectAdvancedFiltersInitialValues) {
        setIsFiltersChipsOpen(true);
      }
    };

    setInitialFilterChips();
  }, [filterChipParams]);

  const isFilterValueNotEmpty = (value: any): boolean => {
    if (Array.isArray(value)) {
      return !!value.length;
    }
    return !!value;
  };

  const getChipLabel = (key: string, value: string) => {
    if (!funding_agency?.entries) {
      return '';
    }

    const filterKeyLabel = ProjectAdvancedFiltersKeyLabels[key].label;
    let filterValueLabel = '';

    if (ProjectAdvancedFiltersKeyLabels[key]?.codeSet) {
      const filterKeyCodeSet = props[ProjectAdvancedFiltersKeyLabels[key].codeSet];

      const filterValueObject = filterKeyCodeSet.filter(
        (item: IMultiAutocompleteFieldOption) => String(item.value) === String(value)
      );

      filterValueLabel = filterValueObject[0]?.label || '';
    } else {
      filterValueLabel = value;
    }

    return (
      <>
        <strong>{filterKeyLabel}:</strong> {filterValueLabel}
      </>
    );
  };

  const getFilterChips = (key: string, value: string) => {
    let ChipArray = [];

    const filterChip = (chipValue: string) => {
      return (
        <Grid item xs="auto" key={`${key}${chipValue}`}>
          <Chip
            label={getChipLabel(key, chipValue)}
            className={classes.chipStyle}
            clickable={false}
            onDelete={() => handleDelete(key, chipValue)}
            deleteIcon={<Icon path={mdiClose} color="white" size={1} />}
          />
        </Grid>
      );
    };

    if (Array.isArray(value)) {
      value.forEach((item) => ChipArray.push(filterChip(item)));
    } else {
      ChipArray.push(filterChip(value));
    }
    return ChipArray;
  };

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
                    (!isAdvancedFiltersOpen && <Icon path={mdiMenuDown} size={1} />) ||
                    (isAdvancedFiltersOpen && <Icon path={mdiMenuUp} size={1} />)
                  }
                  onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}>
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
                  ([key, value], index) => isFilterValueNotEmpty(value) && getFilterChips(key, value)
                )}
                <Grid item>
                  <Chip label={'Clear all'} onClick={handleFilterReset} />
                </Grid>
              </Grid>
            </Box>
          )}

          {isAdvancedFiltersOpen && (
            <Box>
              <ProjectAdvancedFilters
                contact_agency={contact_agency}
                species={species}
                funding_agency={funding_agency}
              />

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
