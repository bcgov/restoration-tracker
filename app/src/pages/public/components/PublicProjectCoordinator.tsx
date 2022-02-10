import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

export interface IPublicProjectCoordinatorProps {
  projectForViewData: IGetProjectForViewResponse;
  refresh: () => void;
}

/**
 * Project coordinator content for a public (published) project.
 *
 * @return {*}
 */
const PublicProjectCoordinator: React.FC<IPublicProjectCoordinatorProps> = (props) => {
  const {
    projectForViewData: { contact }
  } = props;

  return (
    <Box>
      <Box mb={2} data-testid="projectContactTitle">
        <Typography variant="h3">Project Contact</Typography>
      </Box>
      <dl>
        <Grid container spacing={2}>
          {contact.contacts[0].is_public === 'true' && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Name
                </Typography>
                <Typography component="dd" variant="body1">
                  {contact.contacts[0].first_name} {contact.contacts[0].last_name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Email Address
                </Typography>
                <Typography component="dd" variant="body1">
                  {contact.contacts[0].email_address}
                </Typography>
              </Grid>
            </>
          )}
          <Grid item xs={12} sm={6} md={4}>
            <Typography component="dt" variant="subtitle2" color="textSecondary">
              Agency
            </Typography>
            <Typography component="dd" variant="body1">
              {contact.contacts[0].agency}
            </Typography>
          </Grid>
        </Grid>
      </dl>
    </Box>
  );
};

export default PublicProjectCoordinator;
