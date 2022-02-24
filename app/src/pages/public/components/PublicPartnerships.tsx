import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    partnerItem: {
      '&:last-child .seperator': {
        display: 'none'
      }
    }
  })
);

export interface IPublicPartnershipsProps {
  projectForViewData: IGetProjectForViewResponse;
  refresh: () => void;
}

/**
 * Partnerships content for a public (published) project.
 *
 * @return {*}
 */
const PublicPartnerships: React.FC<IPublicPartnershipsProps> = (props) => {
  const classes = useStyles();

  const {
    projectForViewData: {
      partnerships: { indigenous_partnerships, stakeholder_partnerships }
    }
  } = props;

  const hasIndigenousPartnerships = indigenous_partnerships && indigenous_partnerships.length > 0;
  const hasStakeholderPartnerships = stakeholder_partnerships && stakeholder_partnerships.length > 0;

  return (
    <Box component="dl" mb={0}>
      <div>
        <Typography component="dt" variant="subtitle2" color="textSecondary" data-testid="indigenousData">
          Indigenous Partnerships
        </Typography>

        <Typography component="dd" variant="body2">
          {hasIndigenousPartnerships && indigenous_partnerships?.map((indigenousPartnership: number, index: number) => {
            return (
              <span key={index} className={classes.partnerItem}>{indigenousPartnership}<span className="seperator">,&nbsp;</span></span>
            );
          })}

          {!hasIndigenousPartnerships && (
            <span>None</span>
          )}
        </Typography>
      </div>

      <div>
        <Typography component="dt" variant="subtitle2" color="textSecondary" data-testid="stakeholderData">
          Other Partnerships
        </Typography>

        <Typography component="dd" variant="body2">
          {hasStakeholderPartnerships && stakeholder_partnerships?.map((stakeholderPartnership: string, index: number) => {
            return (
              <span key={index} className={classes.partnerItem}>{stakeholderPartnership}<span className="seperator">,&nbsp;</span></span>
            );
          })}

          {!hasStakeholderPartnerships && (
            <span>No Other Partnerships</span>
          )}
        </Typography>
      </div>
    </Box>
  );
};

export default PublicPartnerships;
