import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { RoleGuard } from 'components/security/Guards';
import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import IUCNClassification from 'features/projects/view/components/IUCNClassification';
import Partnerships from 'features/projects/view/components/Partnerships';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import PublicProjectContact from 'pages/public/components/PublicProjectContact';
import React from 'react';
import FundingSource from './components/FundingSource';
import GeneralInformation from './components/GeneralInformation';
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
      '& section': {
        marginBottom: theme.spacing(3)
      },
      '& section:last-child': {
        marginBottom: 0
      },
      '& dl, ul': {
        marginTop: theme.spacing(1),
        marginBottom: 0,
        borderTop: '1px solid #dddddd'
      },
      '& dl div, li': {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        borderBottom: '1px solid #dddddd'
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
        marginBottom: theme.spacing(1),
        fontSize: '15px',
        fontWeight: 700,
        textTransform: 'uppercase'
      },
      '& hr': {
        height: '2px',
        background: 'blue',
        display: 'none'
      },
      '& ul': {
        listStyleType: 'none',
        '& dl': {
          marginTop: 0
        },
        '& dl div:last-child': {
          borderBottom: 'none'
        }
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
    <Box className={classes.projectMetadata} p={3}>
      <Box mb={3}>
        <Typography variant="h2">Project Details</Typography>
      </Box>

      <Box component="section">
        <Typography variant="body1" component={'h3'} data-testid="GeneralInfoTitle">
          General Information
        </Typography>
        <Divider></Divider>
        <GeneralInformation projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
      </Box>

      <Box component="section">
        <Typography variant="body1" component={'h3'} data-testid="ContactsTitle">
          Project Contacts
        </Typography>
        <Divider></Divider>
        <RoleGuard
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}
          validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR, PROJECT_ROLE.PROJECT_VIEWER]}
          fallback={<PublicProjectContact projectForViewData={projectForViewData} refresh={refresh} />}>
          <ProjectContact projectForViewData={projectForViewData} refresh={refresh} />
        </RoleGuard>
      </Box>

      <Box component="section">
        <Typography variant="body1" component={'h3'} data-testid="IUCNTitle">
          IUCN Conservation Actions Classifications
        </Typography>
        <Divider></Divider>
        <IUCNClassification projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
      </Box>

      <Box component="section">
        <Typography variant="body1" component={'h3'} data-testid="PermitsTitle">
          Permits
        </Typography>
        <Divider></Divider>
        <ProjectPermits projectForViewData={projectForViewData} refresh={refresh} />
      </Box>

      <Box component="section">
        <Typography variant="body1" component={'h3'} data-testid="FundingSourceTitle">
          Funding Sources
        </Typography>
        <Divider></Divider>
        <FundingSource projectForViewData={projectForViewData} refresh={refresh} />
      </Box>

      <Box component="section">
        <Typography variant="body1" component={'h3'} data-testid="PartnershipTitle">
          Partnerships
        </Typography>
        <Divider></Divider>
        <Partnerships projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
      </Box>
    </Box>
  );
};

export default ProjectDetailsPage;
