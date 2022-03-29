import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import PublicFundingSource from './components/PublicFundingSource';
import PublicGeneralInformation from './components/PublicGeneralInformation';
import PublicIUCNClassification from './components/PublicIUCNClassification';
import PublicPartnerships from './components/PublicPartnerships';
import PublicProjectContact from './components/PublicProjectContact';
import PublicProjectPermits from './components/PublicProjectPermits';

export interface IPublicProjectDetailsProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    projectTitle: {
      margin: 0,
      fontSize: '1.5rem',
      fontWeight: 400
    },
    projectMetadata: {
      padding: theme.spacing(3),
      overflowY: 'auto',
      backgroundColor: '#f7f8fa',

      // Metadata Definition Lists
      '& dl div + div': {
        marginTop: theme.spacing(0.25)
      },
      '& dd, dt': {
        display: 'inline-block',
        width: '50%',
        verticalAlign: 'top'
      },
      '& dd span': {
        display: 'inline'
      },
      '& h3': {
        marginBottom: theme.spacing(2),
        textTransform: 'uppercase',
        fontSize: '15px',
        fontWeight: 700
      },
      '& section + hr': {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3)
      }
    },
    chip: {
      color: 'white'
    },
    chipActive: {
      backgroundColor: theme.palette.success.main
    },
    chipPublishedCompleted: {
      backgroundColor: theme.palette.success.main
    },
    chipUnpublished: {
      backgroundColor: theme.palette.text.disabled
    },
    chipDraft: {
      backgroundColor: theme.palette.info.main
    },
    chipPriority: {
      backgroundColor: theme.palette.info.dark
    }
  })
);

/**
 * Project details content for a public (published) project.
 *
 * @return {*}
 */
const PublicProjectDetails: React.FC<IPublicProjectDetailsProps> = (props) => {
  const classes = useStyles();

  const { projectForViewData, codes, refresh } = props;

  return (
    <Box flex="1 auto" className={classes.projectMetadata}>
      <Box component="section">
        <Typography variant="body1" component={'h3'}>
          General Information
        </Typography>
        <Box mt={2}>
          <PublicGeneralInformation projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
        </Box>
      </Box>

      <Divider></Divider>

      <Box component="section">
        <Typography variant="body1" component={'h3'}>
          Project Contacts
        </Typography>
        <Box mt={2}>
          <PublicProjectContact projectForViewData={projectForViewData} refresh={refresh} />
        </Box>
      </Box>

      <Divider></Divider>

      <Box component="section">
        <Typography variant="body1" component={'h3'} data-testid="projectPermitsTitle">
          Permits
        </Typography>
        <Box mt={2}>
          <PublicProjectPermits projectForViewData={projectForViewData} refresh={refresh} />
        </Box>
      </Box>

      <Divider></Divider>

      <Box component="section">
        <Typography variant="body1" component={'h3'} data-testid="IUCNTitle">
          IUCN Conservation Actions Classifications
        </Typography>
        <Box mt={2}>
          <PublicIUCNClassification projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
        </Box>
      </Box>

      <Divider></Divider>

      <Box component="section">
        <Typography variant="body1" component={'h3'} data-testid="fundingSourcesTitle">
          Funding Sources
        </Typography>
        <Box mt={2}>
          <PublicFundingSource projectForViewData={projectForViewData} refresh={refresh} />
        </Box>
      </Box>

      <Divider></Divider>

      <Box component="section">
        <Typography variant="body1" component={'h3'} data-testid="partnershipsTitle">
          Partnerships
        </Typography>
        <Box mt={2}>
          <PublicPartnerships projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
        </Box>
      </Box>
    </Box>
  );
};

export default PublicProjectDetails;
