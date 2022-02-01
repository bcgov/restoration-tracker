import Box from '@material-ui/core/Box';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { getFormattedAmount } from 'utils/Utils';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    projectDetailDrawer: {
      '& .MuiDrawer-paper': {
        position: 'relative',
        overflow: 'hidden'
      }
    },
    projectDetailMain: {
      background: '#ffffff'
    },
    projectTitle: {
      margin: 0,
      fontSize: '1.5rem',
      fontWeight: 400
    },
    contentTitle: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      fontSize: '2rem'
    },
    projectMetadata: {
      overflowY: 'auto',
      backgroundColor: '#f5f5f5',

      // Metadata Definition Lists
      '& dl div + div': {
        marginTop: theme.spacing(0.25)
      },
      '& dd, dt': {
        display: 'inline-block',
        width: '50%'
      },

      '& h3': {
        // textTransform: 'uppercase',
        fontWeight: 700
      },
      '& section + hr': {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3)
      }
    },
    projectContactList: {
      marginLeft: 0,
      marginRight: 0,
      padding: 0,
      listStyleType: 'none',
      '& li + li': {
        marginTop: theme.spacing(1.5)
      }
    },
    treatmentsContainer: {
      display: 'none'
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
      <ul className={classes.projectContactList}>
        {hasFundingSources &&
          funding.fundingSources.map((item: any, index: number) => (
            <li key={index} data-testid="funding_data">
              <div>
                <strong>{item.agency_name}</strong>
              </div>
              <Box component="dl" mt={0.5} mb={0}>
                <div>
                  <Typography variant="body2" component="dt" color="textSecondary">
                    Amount:
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
                    {item.start_date}
                  </Typography>
                </div>
                <div>
                  <Typography variant="body2" component="dt" color="textSecondary">
                    End Date:
                  </Typography>
                  <Typography variant="body2" component="dt">
                    {item.end_date}
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
