import { Box, Button, Card, Grid, Input, Typography } from '@material-ui/core';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Icon } from '@mdi/react';
import { mdiMagnify, mdiMenuDown } from '@mdi/js';
import { useFormikContext } from 'formik';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  keywordSearchLeft: {
    display: 'flex',
    alignItems: 'center',
    height: '45px',
    border: '1px solid',
    borderColor: '#adb5bd',
    borderTopLeftRadius: '4px',
    borderBottomLeftRadius: '4px'
  },
  keywordSearchRight: {
    display: 'flex',
    alignItems: 'center',
    height: '45px',
    border: '1px solid',
    borderLeft: '0px',
    borderColor: '#adb5bd',
    borderTopRightRadius: '4px',
    borderBottomRightRadius: '4px'
  }
}));

export interface IProjectFilter {
  keyword: string;
}

export const ProjectFilterInitalValues: IProjectFilter = {
  keyword: ''
};

/**
 * Project - filters
 *
 * @return {*}
 */
const ProjectFilter: React.FC = (props) => {
  const classes = useStyles();
  const formikProps = useFormikContext<IProjectFilter>();

  const {
    handleSubmit
    //   //, handleChange, values
  } = formikProps;

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <Box m={3}>
          <Box mb={2}>
            <Typography variant="h2">Filter Projects</Typography>
          </Box>
          <Grid container direction="row" justify="flex-start" alignItems="center" spacing={0}>
            <Grid item xs={10}>
              <Box className={classes.keywordSearchLeft}>
                <Icon path={mdiMagnify} size={1} />
                <Input fullWidth disableUnderline={true} placeholder="Enter Keywords"/>
              </Box>
            </Grid>
            <Grid item xs={1}>
              <Box className={classes.keywordSearchRight} p={1}>
                <Button variant="text" color="primary" fullWidth endIcon={<Icon path={mdiMenuDown} size={1} />}>
                  <Typography style={{fontWeight: 600, fontSize: '14px'}}>Advanced</Typography>
                </Button>
              </Box>
            </Grid>
            <Grid item xs={1}>
              <Box ml={2}>
                <Button size='medium' variant="contained" color="primary" fullWidth>
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
