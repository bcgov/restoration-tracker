import Box from '@material-ui/core/Box';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    partnerItem: {
      '&:last-child .seperator': {
        display: 'none'
      }
    }
  })
);

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
  const classes = useStyles();

  const {
    projectForViewData: {
      partnerships: { indigenous_partnerships, stakeholder_partnerships }
    },
    codes
  } = props;

  const hasIndigenousPartnerships = indigenous_partnerships && indigenous_partnerships.length > 0;
  const hasStakeholderPartnerships = stakeholder_partnerships && stakeholder_partnerships.length > 0;

  return (
    <Box component="dl" mb={0}>
      <div>
        <Typography component="dt" variant="body2" color="textSecondary" data-testid="indigenousData">
          Indigenous Partnerships
        </Typography>

        <Typography component="dd" variant="body2">
          {hasIndigenousPartnerships &&
            indigenous_partnerships?.map((indigenousPartnership: number, index: number) => {
              const codeValue = codes.first_nations.find((code) => code.id === indigenousPartnership);
              return (
                <span key={index} data-testid="indigenous_partners_data" className={classes.partnerItem}>
                  {codeValue?.name}
                  <span className="seperator">,&nbsp;</span>
                </span>
              );
            })}
          {!hasIndigenousPartnerships && <span data-testid="no_indigenous_partners_data">None</span>}
        </Typography>
      </div>

      <div>
        <Typography component="dt" variant="body2" color="textSecondary" data-testid="stakeholderData">
          Other Partnerships
        </Typography>

        <Typography component="dd" variant="body2">
          {hasStakeholderPartnerships &&
            stakeholder_partnerships?.map((stakeholderPartnership: string, index: number) => {
              return (
                <span key={index} data-testid="stakeholder_partners_data" className={classes.partnerItem}>
                  {stakeholderPartnership}
                  <span className="seperator">,&nbsp;</span>
                </span>
              );
            })}
          {!hasStakeholderPartnerships && <span data-testid="no_stakeholder_partners_data">None</span>}
        </Typography>
      </div>
    </Box>
  );
};

export default Partnerships;
