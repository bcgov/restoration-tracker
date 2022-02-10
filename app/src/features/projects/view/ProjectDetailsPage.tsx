import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { mdiAccountMultipleOutline, mdiArrowLeft, mdiCogOutline, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Link from '@material-ui/core/Link';
import clsx from 'clsx';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { DeleteProjectI18N } from 'constants/i18n';
import { ProjectStatusType } from 'constants/misc';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { DialogContext } from 'contexts/dialogContext';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IUCNClassification from 'features/projects/view/components/IUCNClassification';
import Partnerships from 'features/projects/view/components/Partnerships';
import { APIError } from 'hooks/api/useAxios';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import moment from 'moment';
import React, { useContext } from 'react';
import { useHistory, useParams } from 'react-router';
import FundingSource from './components/FundingSource';
import GeneralInformation from './components/GeneralInformation';
import Objectives from './components/Objectives';
import ProjectCoordinator from './components/ProjectCoordinator';
import ProjectPermits from './components/ProjectPermits';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

export interface IProjectDetailsProps {
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
        display: 'inline-block'
      },
      '& h3': {
        marginBottom: theme.spacing(2),
        // textTransform: 'uppercase',
        // fontSize: '14px',
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
 * Project details content for a project.
 *
 * @return {*}
 */
const ProjectDetailsPage: React.FC<IProjectDetailsProps> = (props) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { projectForViewData, codes, refresh } = props;
  const classes = useStyles();

  const urlParams = useParams();

  const restorationTrackerApi = useRestorationTrackerApi();

  const history = useHistory();
  const dialogContext = useContext(DialogContext);

  const { keycloakWrapper } = useContext(AuthStateContext);
  const defaultYesNoDialogProps = {
    dialogTitle: DeleteProjectI18N.deleteTitle,
    dialogText: DeleteProjectI18N.deleteText,
    open: false,
    onClose: () => dialogContext.setYesNoDialog({ open: false }),
    onNo: () => dialogContext.setYesNoDialog({ open: false }),
    onYes: () => dialogContext.setYesNoDialog({ open: false })
  };

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
  const showDeleteErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({ ...deleteErrorDialogProps, ...textDialogProps, open: true });
  };

  const deleteErrorDialogProps = {
    dialogTitle: DeleteProjectI18N.deleteErrorTitle,
    dialogText: DeleteProjectI18N.deleteErrorText,
    open: false,
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  const showDeleteProjectDialog = () => {
    dialogContext.setYesNoDialog({
      ...defaultYesNoDialogProps,
      open: true,
      onYes: () => {
        deleteProject();
        dialogContext.setYesNoDialog({ open: false });
      }
    });
  };

  const deleteProject = async () => {
    if (!projectForViewData) {
      return;
    }

    try {
      const response = await restorationTrackerApi.project.deleteProject(projectForViewData.project.project_id);

      if (!response) {
        showDeleteErrorDialog({ open: true });
        return;
      }

      history.push(`/admin/projects`);
    } catch (error) {
      const apiError = error as APIError;
      showDeleteErrorDialog({ dialogText: apiError.message, open: true });
      return error;
    }
  };

  // Show delete button if you are a system admin or a project admin
  const showDeleteProjectButton = keycloakWrapper?.hasSystemRole([
    SYSTEM_ROLE.SYSTEM_ADMIN,
    SYSTEM_ROLE.PROJECT_CREATOR
  ]);

  // Project Actions Menu
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Toolbar>
        <Button
          component={Link}
          href="/projects"
          size="small"
          startIcon={<Icon path={mdiArrowLeft} size={0.875}></Icon>}>
          Back to Projects
        </Button>
      </Toolbar>
      <Box flex="0 auto" pt={0} p={3}>
        <Box display="flex" flexDirection={'row'}>
          <Box component="h1" flex="1 1 auto" className={classes.projectTitle}>
            <b>Project -</b> {projectForViewData.project.project_name}
          </Box>
          <Box flex="0 0 auto" mt={'-4px'} mr={-1}>
            <IconButton aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
              <Icon path={mdiCogOutline} size={0.9375} />
            </IconButton>
            <Menu id="project-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
              <MenuItem onClick={() => history.push('users')}>
                <ListItemIcon>
                  <Icon path={mdiAccountMultipleOutline} size={0.9375} />
                </ListItemIcon>
                Manage Project Team
              </MenuItem>
              <MenuItem onClick={() => history.push(`/admin/projects/${urlParams['id']}/edit`)}>
                <ListItemIcon>
                  <Icon path={mdiPencilOutline} size={0.9375} />
                </ListItemIcon>
                Edit Project Details
              </MenuItem>
              {showDeleteProjectButton && (
                <MenuItem onClick={showDeleteProjectDialog}>
                  <ListItemIcon>
                    <Icon path={mdiTrashCanOutline} size={0.9375} />
                  </ListItemIcon>
                  Delete Project
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Box>

        <Box mt={2} display="flex" flexDirection={'row'}>
          <Box mr={0.5}>{getChipIcon(priority_status)}</Box>
          <Box>{getChipIcon(completion_status)}</Box>
        </Box>
      </Box>

      <Divider></Divider>

      {/* Project Metadata */}
      <Box flex="1 auto" className={classes.projectMetadata}>
        <Box component="section">
          <Typography variant="body1" component={'h3'}>
            Objectives
          </Typography>
          <Box mt={2}>
            <Objectives projectForViewData={projectForViewData} refresh={refresh} />
          </Box>
        </Box>

        <Divider></Divider>

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
          <ProjectCoordinator projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
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
    </Box>
  );
};

export default ProjectDetailsPage;
