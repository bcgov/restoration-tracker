import Box from '@material-ui/core/Box';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { getFormattedAmount, getFormattedDate } from 'utils/Utils';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    projectFundingList: {
      margin: 0,
      padding: 0,
      paddingLeft: theme.spacing(3),
      '& li + li': {
        marginTop: theme.spacing(2),
        paddingTop: theme.spacing(2),
        borderTop: '1px solid #dddddd'
      }
    }
  })
);

export interface IProjectFundingProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * Funding source content for a project.
 *
 * @return {*}
 */
const FundingSource: React.FC<IProjectFundingProps> = (props) => {
  const classes = useStyles();

  const {
    projectForViewData: { funding }
  } = props;

  const hasFundingSources = funding.fundingSources && funding.fundingSources.length > 0;

  return (
    <>
      <ul className={classes.projectFundingList}>
        {hasFundingSources &&
          funding.fundingSources.map((item: any, index: number) => (
            <li key={index} data-testid="funding_data">
              <Box>
                <strong>{item.agency_name}</strong>
              </Box>
              <Box component="dl" mt={0.5} mb={0}>
                <div>
                  <Typography variant="body2" component="dt" color="textSecondary">
                    Funding Amount:
                  </Typography>
                  <Typography variant="body2" component="dt">
                    {getFormattedAmount(item.funding_amount)}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body2" component="dt" color="textSecondary">
                    Project ID:
                  </Typography>
                  <Typography variant="body2" component="dt">
                    {item.agency_project_id}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body2" component="dt" color="textSecondary">
                    Start Date:
                  </Typography>
                  <Typography variant="body2" component="dt">
                    {getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, item.start_date)}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body2" component="dt" color="textSecondary">
                    End Date:
                  </Typography>
                  <Typography variant="body2" component="dt">
                    {getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, item.end)}
                  </Typography>
                </div>
              </Box>
            </li>
          ))}

        {!hasFundingSources && (
          <li>
            <Typography variant="body2" data-testid="no_funding_loaded">
              No Funding Sources
            </Typography>
          </li>
        )}
      </ul>
    </>
  );
};

export default FundingSource;
