import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { mdiClose, mdiMagnify, mdiMenuDown, mdiMenuUp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteField';
import { useFormikContext } from 'formik';
import React, { useEffect, useState } from 'react';
import ProjectAdvancedFilters from './ProjectAdvancedFilters';

const useStyles = makeStyles((theme: Theme) => ({
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  },

  keywordSearch: {
    height: '52px',
    flex: '1 1 auto',
    paddingLeft: theme.spacing(1.25),
    display: 'flex',
    alignItems: 'center',
    border: '1px solid rgba(0, 0, 0, 0.23)',
    borderRadius: '4px 0 0 4px',
    backgroundColor: '#f6f6f6',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      borderWidth: '2px'
    },
    '&:active': {
      borderColor: theme.palette.primary.main,
      borderWidth: '2px'
    },
    '&:focus': {
      borderColor: theme.palette.primary.main,
      borderWidth: '2px'
    }
  },
  filterToggleBtn: {
    height: '100%',
    flex: '0 0 auto',
    borderRadius: '0 4px 4px 0',
    marginLeft: '-1px'
  },
  filterApplyBtn: {
    height: '100%',
    minWidth: '8rem'
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
  end_date: '',
  ranges: '',
  region: ''
};

export interface IProjectAdvancedFilters {
  keyword?: string;
  contact_agency?: string | string[];
  funding_agency?: number | number[];
  permit_number?: string;
  species?: number | number[];
  start_date?: string;
  end_date?: string;
  ranges?: string | string[];
  region?: string | string[];
}

export const ProjectAdvancedFiltersKeyLabels = {
  keyword: { label: 'Keyword' },
  contact_agency: { label: 'Contact Agency' },
  funding_agency: { label: 'Funding Agency', codeSet: 'funding_agency' },
  permit_number: { label: 'Permit Number' },
  species: { label: 'Species' },
  start_date: { label: 'Start Date' },
  end_date: { label: 'End Date' },
  ranges: { label: 'Caribou Ranges', codeSet: 'ranges' },
  region: { label: 'FLNRO Region', codeSet: 'region' }
};

export interface IProjectAdvancedFiltersProps {
  filterChipParams: IProjectAdvancedFilters;
  contact_agency: string[];
  funding_agency: IMultiAutocompleteFieldOption[];
  ranges: IMultiAutocompleteFieldOption[];
  region: IMultiAutocompleteFieldOption[];
}

/**
 * Project - filters
 *
 * @return {*}
 */
const ProjectFilter: React.FC<IProjectAdvancedFiltersProps> = (props) => {
  const classes = useStyles();
  const { filterChipParams, contact_agency, funding_agency, region, ranges } = props;

  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [isFiltersChipsOpen, setIsFiltersChipsOpen] = useState(false);

  const formikProps = useFormikContext<IProjectAdvancedFilters>();
  const { handleSubmit, handleChange, handleReset, values, setFieldValue } = formikProps;

  const handleDelete = (key: string, value: string | number) => {
    if (Array.isArray(values[key]) && values[key].length !== 1) {
      //check if chip is part of an array and deletes single array item if true
      const index = values[key].indexOf(value);
      values[key].splice(index, 1);
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
    const ChipArray = [];

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
          <Box mb={3}>
            <Typography variant="h2">Filter Projects</Typography>
          </Box>
          <Box display="flex">
            <Box flex="1 1 auto" display="flex">
              <Input
                tabIndex={0}
                className={classes.keywordSearch}
                name="keyword"
                fullWidth
                startAdornment={
                  <InputAdornment position="start">
                    <Icon path={mdiMagnify} size={1} />
                  </InputAdornment>
                }
                disableUnderline={true}
                placeholder="Enter Keywords"
                onChange={handleChange}
                value={values.keyword}
              />
              <Button
                className={classes.filterToggleBtn}
                size="large"
                variant="outlined"
                disableRipple={true}
                endIcon={
                  (!isAdvancedFiltersOpen && <Icon path={mdiMenuDown} size={1} />) ||
                  (isAdvancedFiltersOpen && <Icon path={mdiMenuUp} size={1} />)
                }
                onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}>
                Advanced
              </Button>
            </Box>
            <Box flex="0 0 auto" ml={1}>
              <Button
                type="submit"
                size="large"
                variant="contained"
                color="primary"
                className={classes.filterApplyBtn}
                onClick={handleFilterUpdate}>
                Apply
              </Button>
            </Box>
          </Box>

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
            <Box my={5}>
              <ProjectAdvancedFilters
                contact_agency={contact_agency}
                funding_agency={funding_agency}
                ranges={ranges}
                region={region}
              />

              <Box textAlign="right" mt={3}>
                <Button
                  type="reset"
                  variant="outlined"
                  color="primary"
                  size="medium"
                  className={classes.actionButton}
                  onClick={handleFilterReset}>
                  Reset
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Card>
    </form>
  );
};

export default ProjectFilter;
