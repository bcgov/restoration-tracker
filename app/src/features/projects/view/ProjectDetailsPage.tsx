import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import IUCNClassification from 'features/projects/view/components/IUCNClassification';
import Partnerships from 'features/projects/view/components/Partnerships';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import FundingSource from './components/FundingSource';
import GeneralInformation from './components/GeneralInformation';
import Objectives from './components/Objectives';
import ProjectContact from './components/ProjectContact';
import ProjectPermits from './components/ProjectPermits';

export interface IProjectDetailsProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    projectMetadata: {

      // Metadata Definition Lists
      '& dl div + div': {
        marginTop: theme.spacing(0.5)
      },
      '& dd, dt': {
        display: 'inline-block',
        verticalAlign: 'top'
      },
      '& dt': {
        width: '33.333%'
      },
      '& dd': {
        width: '66.666%'
      },
      '& dd span': {
        display: 'inline'
      },
      '& h3': {
        marginBottom: theme.spacing(2),
        fontSize: '15px',
        fontWeight: 700,
        textTransform: 'uppercase'
      },
      '& section + hr': {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3)
      }
    }
  })
);

/**
 * Project details content for a project.
 *
 * @return {*}
 */
const ProjectDetailsPage: React.FC<IProjectDetailsProps> = (props) => {
  const { projectForViewData, codes, refresh } = props;
  const classes = useStyles();

  return (
    <Box className={classes.projectMetadata}>
      <Box component="section" hidden>
        <Typography variant="body1" component={'h3'}>
          Objectives
        </Typography>
        <Box mt={2}>
          <Objectives projectForViewData={projectForViewData} refresh={refresh} />
        </Box>
      </Box>

      <Divider hidden></Divider>

      <Box component="section">
        <Typography variant="body1" component={'h3'} data-testid="GeneralInfoTitle">
          General Information
        </Typography>
        <GeneralInformation projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
      </Box>

      <Divider></Divider>

      <Box component="section">
        <Typography variant="body1" component={'h3'} data-testid="ContactsTitle">
          Project Contacts
        </Typography>
        <ProjectContact projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
      </Box>

      <Divider></Divider>

      <Box component="section">
        <Typography variant="body1" component={'h3'} data-testid="IUCNTitle">
          IUCN Conservation Actions Classifications
        </Typography>
        <IUCNClassification projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
      </Box>

      <Divider></Divider>

      <Box component="section">
        <Typography variant="body1" component={'h3'} data-testid="PermitsTitle">
          Permits
        </Typography>
        <ProjectPermits projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
      </Box>

      <Divider></Divider>

      <Box component="section">
        <Typography variant="body1" component={'h3'} data-testid="FundingSourceTitle">
          Funding Sources
        </Typography>
        <FundingSource projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
      </Box>

      <Divider></Divider>

      <Box component="section">
        <Typography variant="body1" component={'h3'} data-testid="PartnershipTitle">
          Partnerships
        </Typography>
        <Partnerships projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
      </Box>
    </Box>
  );
};

export default ProjectDetailsPage;
