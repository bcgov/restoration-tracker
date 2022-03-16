import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Divider from '@material-ui/core/Divider';
import Link from '@material-ui/core/Link';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { mdiArrowLeft } from '@mdi/js';
import Icon from '@mdi/react';
import clsx from 'clsx';
import { ProjectStatusType } from 'constants/misc';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import moment from 'moment';
import React from 'react';
import { useHistory } from 'react-router';
import PublicFundingSource from './components/PublicFundingSource';
import PublicGeneralInformation from './components/PublicGeneralInformation';
import PublicIUCNClassification from './components/PublicIUCNClassification';
import PublicObjectives from './components/PublicObjectives';
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
    projectDetailDrawer: {
      '&.MuiDrawer-docked': {
        flex: '0 1 auto'
      },
      '& .MuiDrawer-paper': {
        position: 'relative',
        overflow: 'hidden',
        zIndex: 'auto'
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
    treatmentsContainer: {
      display: 'none'
    },
    actionButton: {
      minWidth: '6rem',
      '& + button': {
        marginLeft: '0.5rem'
      }
    },
    linkButton: {
      textAlign: 'left'
    },
    filtersBox: {
      background: '#f7f8fa'
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
    },
    chipNotAPriority: {
      backgroundColor: theme.palette.text.disabled
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

  const history = useHistory();

  const { projectForViewData, codes, refresh } = props;

  const end_date = projectForViewData.project.end_date;

  const completion_status =
    (end_date && moment(end_date).endOf('day').isBefore(moment()) && ProjectStatusType.COMPLETED) ||
    ProjectStatusType.ACTIVE;

  const priority_status = ProjectStatusType.NOT_A_PRIORITY;

  const getChipIcon = (status_name: string) => {
    let chipLabel;
    let chipStatusClass;

    if (ProjectStatusType.ACTIVE === status_name) {
      chipLabel = 'Active';
      chipStatusClass = classes.chipActive;
    } else if (ProjectStatusType.COMPLETED === status_name) {
      chipLabel = 'Completed';
      chipStatusClass = classes.chipPublishedCompleted;
    } else if (ProjectStatusType.DRAFT === status_name) {
      chipLabel = 'Draft';
      chipStatusClass = classes.chipDraft;
    } else if (ProjectStatusType.PRIORITY === status_name) {
      chipLabel = 'Priority';
      chipStatusClass = classes.chipPriority;
    } else if (ProjectStatusType.NOT_A_PRIORITY === status_name) {
      chipLabel = 'Priority';
      chipStatusClass = classes.chipNotAPriority;
    }

    return <Chip size="small" className={clsx(classes.chip, chipStatusClass)} label={chipLabel} />;
  };

  return (
    <Box display="flex" flexDirection="column" height="100%">

      {/* Project Title Container */}
      <Box flex="0 auto" p={3}>
        <Box mb={2}>
          <Button
            component={Link}
            onClick={() => history.push('/projects')}
            size="small"
            startIcon={<Icon path={mdiArrowLeft} size={0.875}></Icon>}>
            Back to Projects
          </Button>
        </Box>
        <Box display="flex" flexDirection={'row'}>
          <Box component="h1" flex="1 1 auto" className={classes.projectTitle}>
            <b>Project -</b> {projectForViewData.project.project_name}
          </Box>
        </Box>
        <Box mt={1} display="flex" flexDirection={'row'}>
          <Box mr={0.5}>{getChipIcon(priority_status)}</Box>
          <Box>{getChipIcon(completion_status)}</Box>
        </Box>
      </Box>

      {/* Project Metadata */}
      <Box flex="1 auto" className={classes.projectMetadata}>
        <Box component="section">
          <Typography variant="body1" component={'h3'}>
            Objectives
          </Typography>
          <Box mt={2}>
            <PublicObjectives projectForViewData={projectForViewData} refresh={refresh} />
          </Box>
        </Box>

        <Divider></Divider>
        <Box component="section">
          <Typography variant="body1" component={'h3'}>
            General Information
          </Typography>
          <Box mt={2}>
            <PublicGeneralInformation projectForViewData={projectForViewData} refresh={refresh} />
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
    </Box>
  );
};

export default PublicProjectDetails;
