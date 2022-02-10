import { Box, Button, Card, Chip, CircularProgress, Grid, Input, Typography } from '@material-ui/core';
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

export const ProjectAdvancedFiltersKeyLabels = {
  coordinator_agency: 'Coordinator Agency',
  permit_number: 'Permit Number',
  start_date: 'Start Date',
  end_date: 'End Date',
  keyword: 'Keyword',
  project_name: 'Project Name',
  agency_id: 'Agency Name',
  agency_project_id: 'Agency Project',
  species: 'Species'
};

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
  const { filterChipParams, coordinator_agency, species, funding_sources } = props;

  const [isAdvancedFitersOpen, setIsAdvancedFitersOpen] = useState(false);
  const [isFiltersChipsOpen, setIsFiltersChipsOpen] = useState(false);

  const formikProps = useFormikContext<IProjectAdvancedFilters>();
  const { handleSubmit, handleChange, handleReset, values } = formikProps;

  const handleDelete = (key: string) => {
    values[key] = ProjectAdvancedFiltersInitialValues[key];

    handleChange(values[key]);

    if (JSON.stringify(values) === JSON.stringify(ProjectAdvancedFiltersInitialValues)) {
      handleFilterReset();
    }else{
      handleSubmit();
    }
  };

  const handleFilterReset = () => {
    setIsFiltersChipsOpen(false);
    handleReset();
  };

  const handleFilterUpdate = () => {
    if (values === ProjectAdvancedFiltersInitialValues) {
      return;
    }

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

  const isValueValid = (value: any): boolean => {
    if (Array.isArray(value)) {
      return !!value.length;
    }
    return !!value;
  };

  const generateLabel = (key: string, value: string): string => {

    if(!funding_sources?.entries){
      return '';
    }

    const keyLabel = ProjectAdvancedFiltersKeyLabels[key];
    let valueLabel = '';

    if (key === 'agency_id') {
      const tempValueFind = funding_sources.filter((item) => item.value === value);
      valueLabel = tempValueFind[0]?.label || '';
    } else {
      valueLabel = value;
    }

    return `${keyLabel}: ${valueLabel}`;
  };

  if(!funding_sources){
    return <CircularProgress className="pageProgress" size={40} />;
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
                    isValueValid(value) && (
                      <Grid item xs="auto" key={`${key}${index}`}>
                        <Chip
                          label={generateLabel(key, value)}
                          className={classes.chipStyle}
                          clickable={false}
                          onDelete={() => handleDelete(key)}
                          deleteIcon={<Icon path={mdiClose} color="white" size={1} />}
                        />
                      </Grid>
                    )
                )}
                <Grid item>
                  <Chip label={'Clear all'} onClick={handleFilterReset} />
                </Grid>
              </Grid>
            </Box>
          )}

          {isAdvancedFitersOpen && (
            <ProjectAdvancedFilters
              coordinator_agency={coordinator_agency}
              species={species}
              funding_sources={funding_sources}
              handleFilterUpdate={handleFilterUpdate}
              handleFilterReset={handleFilterReset}
            />
          )}
        </Box>
      </Card>
    </form>
  );
};

export default ProjectFilter;
