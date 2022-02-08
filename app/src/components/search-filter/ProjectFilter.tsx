import { Box, Button, Card, Grid, Input, Typography } from '@material-ui/core';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Icon } from '@mdi/react';
import { mdiMagnify, mdiMenuDown } from '@mdi/js';
import { useFormikContext } from 'formik';
import React from 'react';

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

/**
 * Project - filters
 *
 * @return {*}
 */
const ProjectFilter: React.FC = (props) => {
  const classes = useStyles();
  const formikProps = useFormikContext<IProjectAdvancedFilters>();
  const { handleSubmit, handleChange, values } = formikProps;

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
                  endIcon={<Icon path={mdiMenuDown} size={1} />}>
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
                  className={classes.actionButton}>
                  Apply
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Card>
    </form>
  );
};

export default ProjectFilter;
