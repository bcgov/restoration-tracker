import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

export interface IPartnershipsProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * Partnerships content for a project.
 *
 * @return {*}
 */
const Partnerships: React.FC<IPartnershipsProps> = (props) => {
  const {
    projectForViewData: {
      partnerships: { indigenous_partnerships, stakeholder_partnerships }
    }
  } = props;

  const hasIndigenousPartnerships = indigenous_partnerships && indigenous_partnerships.length > 0;
  const hasStakeholderPartnerships = stakeholder_partnerships && stakeholder_partnerships.length > 0;

  return (
    <>
      <dl className="ddInline">
        <Box component="section" mt={3}>
          <Typography variant="body1" component={'h3'}>
            Partnerships
          </Typography>

          <Box mt={3}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" component="dt" color="textSecondary">
                  Indigenous Partnerships
                </Typography>
                {indigenous_partnerships?.map((indigenousPartnership: number, index: number) => {
                  return (
                    <Typography variant="body2" component="dt" key={index}>
                      {indigenousPartnership}
                    </Typography>
                  );
                })}

                {!hasIndigenousPartnerships && (
                  <Typography component="dt" variant="body1">
                    No Indigenous Partnerships
                  </Typography>
                )}
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" component="dt" color="textSecondary">
                  Other Partnerships
                </Typography>
                {stakeholder_partnerships?.map((stakeholderPartnership: string, index: number) => {
                  return (
                    <Typography variant="body2" component="dt" key={index}>
                      {stakeholderPartnership}
                    </Typography>
                  );
                })}

                {!hasStakeholderPartnerships && (
                  <Typography component="dt" variant="body1">
                    No Other Partnerships
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        </Box>
      </dl>
    </>
  );
};

export default Partnerships;
