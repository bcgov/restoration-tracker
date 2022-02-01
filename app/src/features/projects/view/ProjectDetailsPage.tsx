import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import { mdiArrowLeft, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import clsx from 'clsx';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { DeleteProjectI18N } from 'constants/i18n';
import { ProjectStatusType } from 'constants/misc';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { DialogContext } from 'contexts/dialogContext';
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
  // Enable delete button if you a system admin OR a project admin and the project is not published
  const enableDeleteProjectButton =
    keycloakWrapper?.hasSystemRole([SYSTEM_ROLE.SYSTEM_ADMIN]) ||
    (keycloakWrapper?.hasSystemRole([SYSTEM_ROLE.PROJECT_CREATOR]) && !projectForViewData.project.publish_date);

  return (
    <Drawer variant="permanent" className={classes.projectDetailDrawer}>
      <Box display="flex" flexDirection="column">
        <Box flex="0 auto" p={3}>
          <Box mb={2}>
            <Button href="/projects" size="small" startIcon={<Icon path={mdiArrowLeft} size={0.875}></Icon>}>
              Back to Projects
            </Button>
          </Box>
          <h1 className={classes.projectTitle}>
            <b>Project -</b> {projectForViewData.project.project_name}
            <Box display="flex" flexDirection="column">
              <Box mb={1} display="flex" flexDirection={'row'}>
                <Box mr={1}>{getChipIcon(priority_status)}</Box>
                <Box>{getChipIcon(completion_status)}</Box>
              </Box>
              <Box>
                <Button
                  variant="outlined"
                  disableElevation
                  className={classes.actionButton}
                  data-testid="manage-project-team-button"
                  aria-label="Manage Project Team"
                  onClick={() => history.push('users')}>
                  Manage Team
                </Button>
                <Button
                  variant="outlined"
                  disableElevation
                  className={classes.actionButton}
                  data-testid="edit-project-button"
                  aria-label="Edit Project"
                  onClick={() => history.push(`/admin/projects/${urlParams['id']}/edit`)}>
                  Edit Project
                </Button>
                {showDeleteProjectButton && (
                  <Tooltip
                    arrow
                    color="secondary"
                    title={!enableDeleteProjectButton ? 'Cannot delete a published project' : ''}>
                    <>
                      <IconButton
                        data-testid="delete-project-button"
                        onClick={showDeleteProjectDialog}
                        disabled={!enableDeleteProjectButton}>
                        <Icon path={mdiTrashCanOutline} size={1} />
                      </IconButton>
                    </>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </h1>
        </Box>

        {/* Project Metadata */}
        <Box flex="1 auto" p={3} className={classes.projectMetadata}>
          <Box component="section">
            <Box component="section" mt={3}>
              <Objectives projectForViewData={projectForViewData} refresh={refresh} />
            </Box>
          </Box>

          <Divider></Divider>

          <Box component="section">
            <Box component="section" mt={3}>
              <GeneralInformation projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
            </Box>
          </Box>

          <Divider></Divider>

          <Box component="section">
            <Box component="section" mt={3}>
              <ProjectCoordinator projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
            </Box>
          </Box>

          <Divider></Divider>

          <Box component="section">
            <Box component="section" mt={3}>
              <IUCNClassification projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
            </Box>
          </Box>

          <Divider></Divider>

          <Box component="section">
            <Box component="section" mt={3}>
              <ProjectPermits projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
            </Box>
          </Box>

          <Divider></Divider>

          <Box component="section">
            <Box component="section" mt={3}>
              <FundingSource projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
            </Box>
          </Box>
          <Divider></Divider>

          <Box component="section">
            <Box component="section" mt={3}>
              <Partnerships projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ProjectDetailsPage;
