import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { mdiArrowLeft } from '@mdi/js';
import { Icon } from '@mdi/react';
import clsx from 'clsx';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { RoleGuard } from 'components/security/Guards';
import { DeleteProjectI18N } from 'constants/i18n';
import { ProjectStatusType } from 'constants/misc';
import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import { DialogContext } from 'contexts/dialogContext';
import LocationBoundary from 'features/projects/view/components/LocationBoundary';
import { APIError } from 'hooks/api/useAxios';
import useCodes from 'hooks/useCodes';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import {
  IGetProjectAttachment,
  IGetProjectForViewResponse,
  IGetProjectTreatment,
  TreatmentSearchCriteria
} from 'interfaces/useProjectApi.interface';
import moment from 'moment';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import TreatmentList from './components/TreatmentList';
import TreatmentSpatialUnits from './components/TreatmentSpatialUnits';
import ProjectAttachments from './ProjectAttachments';
import ProjectDetailsPage from './ProjectDetailsPage';
import Dialog from '@material-ui/core/Dialog';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    projectDetailDrawer: {
      '& .MuiDrawer-paper': {
        position: 'relative',
        overflow: 'hidden',
        width: '30rem'
      }
    },
    projectTitle: {
      margin: 0,
      fontSize: '1.5rem',
      fontWeight: 400
    },
    chip: {
      color: 'white',
      textTransform: 'uppercase',
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '0.02rem'
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
    },
    tabs: {
      flexDirection: 'row',
      '& .MuiTabs-indicator': {
        backgroundColor: '#1a5a96'
      },
      '& .MuiTab-root.Mui-selected': {
        color: '#1a5a96'
      }
    },
    tabPanel: {
      overflowY: 'auto'
    },
    tabIcon: {
      verticalAlign: 'middle'
    },
    projectLocationBoundary: {
      background: '#ffffff'
    },
    titleContainerActions: {
      '& button + button': {
        marginLeft: theme.spacing(1)
      }
    }
  })
);

/**
 * Page to display a single Project.
 *
 * @return {*}
 */
const ViewProjectPage: React.FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const urlParams = useParams();
  const projectId = urlParams['id'];
  const dialogContext = useContext(DialogContext);

  const [openFullScreen, setOpenFullScreen] = React.useState(false);

  const restorationTrackerApi = useRestorationTrackerApi();

  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [projectWithDetails, setProjectWithDetails] = useState<IGetProjectForViewResponse | null>(null);
  const [attachmentsList, setAttachmentsList] = useState<IGetProjectAttachment[]>([]);
  const [treatmentList, setTreatmentList] = useState<IGetProjectTreatment[]>([]);

  const codes = useCodes();

  const getProject = useCallback(async () => {
    const projectWithDetailsResponse = await restorationTrackerApi.project.getProjectById(urlParams['id']);

    if (!projectWithDetailsResponse) {
      // TODO error handling/messaging
      return;
    }

    setProjectWithDetails(projectWithDetailsResponse);
  }, [restorationTrackerApi.project, urlParams]);

  const getAttachments = useCallback(
    async (forceFetch: boolean) => {
      if (attachmentsList.length && !forceFetch) return;

      try {
        const response = await restorationTrackerApi.project.getProjectAttachments(projectId);

        if (!response?.attachmentsList) return;

        setAttachmentsList([...response.attachmentsList]);
      } catch (error) {
        return error;
      }
    },
    [restorationTrackerApi.project, projectId, attachmentsList.length]
  );

  const getTreatments = useCallback(
    async (forceFetch: boolean, selectedYears?: TreatmentSearchCriteria) => {
      if (treatmentList.length && !forceFetch) return;

      try {
        const response = await restorationTrackerApi.project.getProjectTreatments(projectId, selectedYears);

        if (!response?.treatmentList) return;

        setTreatmentList([...response.treatmentList]);
      } catch (error) {
        return error;
      }
    },
    [restorationTrackerApi.project, projectId, treatmentList.length]
  );

  useEffect(() => {
    if (!isLoadingProject && !projectWithDetails) {
      getProject();
      getAttachments(false);
      getTreatments(false);
      setIsLoadingProject(true);
    }
  }, [isLoadingProject, projectWithDetails, getProject, getAttachments, getTreatments]);
  if (!codes.isReady || !codes.codes || !projectWithDetails) {
    return <CircularProgress className="pageProgress" size={40} data-testid="loading_spinner" />;
  }

  const defaultYesNoDialogProps = {
    dialogTitle: DeleteProjectI18N.deleteTitle,
    dialogText: DeleteProjectI18N.deleteText,
    open: false,
    onClose: () => dialogContext.setYesNoDialog({ open: false }),
    onNo: () => dialogContext.setYesNoDialog({ open: false }),
    onYes: () => dialogContext.setYesNoDialog({ open: false })
  };

  const end_date = projectWithDetails.project.end_date;
  const completion_status =
    (end_date && moment(end_date).endOf('day').isBefore(moment()) && ProjectStatusType.COMPLETED) ||
    ProjectStatusType.ACTIVE;

  const priority_status = projectWithDetails.location.priority === 'true';

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
    if (!projectWithDetails) {
      return;
    }

    try {
      const response = await restorationTrackerApi.project.deleteProject(projectWithDetails.project.project_id);

      if (!response) {
        showDeleteErrorDialog({ open: true });
        return;
      }

      history.push('/admin/user/projects');
    } catch (error) {
      const apiError = error as APIError;
      showDeleteErrorDialog({ dialogText: apiError.message, open: true });
      return error;
    }
  };

  // Full Screen Map Dialog
  const openMapDialog = () => {
    setOpenFullScreen(true);
  };

  const closeMapDialog = () => {
    setOpenFullScreen(false);
  };

  return (
    <>
      <Box py={5} data-testid="view_project_page_component">
        <Container maxWidth="xl">
          <Box mb={5} display="flex" justifyContent="space-between">
            <Box>
              <Typography variant="h1">{projectWithDetails.project.project_name}</Typography>
              <Box mt={1.5} display="flex" flexDirection={'row'} alignItems="center">
                <Typography variant="subtitle2" color="textSecondary">
                  Project Status:
                </Typography>
                <Box ml={1}>{getChipIcon(completion_status)}</Box>
                {priority_status && (
                  <Box ml={0.5}>
                    <Chip size="small" className={clsx(classes.chip, classes.chipPriority)} label="Priority" />
                  </Box>
                )}
              </Box>
            </Box>
            <RoleGuard
              validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}
              validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR]}>
              <Box className={classes.titleContainerActions}>
                <Button variant="outlined" color="primary" onClick={() => history.push('users')}>
                  Manage Project Team
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => history.push(`/admin/projects/${urlParams['id']}/edit`)}>
                  Edit Project
                </Button>
                <RoleGuard
                  validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}
                  validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD]}>
                  <Button variant="outlined" color="primary" onClick={showDeleteProjectDialog}>
                    Delete Project
                  </Button>
                </RoleGuard>
              </Box>
            </RoleGuard>
          </Box>

          <Divider hidden></Divider>

          <Box mt={2}>
            <Grid container spacing={3}>
              <Grid item md={8}>
                <Box>
                  <Box mb={3}>
                    <Paper elevation={2}>
                      <Box p={3}>
                        <Box mb={2}>
                          <Typography variant="h2">Project Objectives</Typography>
                        </Box>
                        <Typography variant="body1">{projectWithDetails.project.objectives}</Typography>
                      </Box>
                    </Paper>
                  </Box>

                  <Paper elevation={2}>
                    <Box px={3}>
                      <TreatmentSpatialUnits
                        treatmentList={treatmentList}
                        getTreatments={getTreatments}
                        getAttachments={getAttachments}
                      />
                    </Box>

                    <Box mb={3}>
                      <Box height="500px" position="relative">
                        <LocationBoundary
                          projectForViewData={projectWithDetails}
                          treatmentList={treatmentList}
                          codes={codes.codes}
                          refresh={getProject}
                        />
                        <Box position="absolute" top="10px" right="10px" zIndex="999">
                          <Button variant="outlined" color="primary" onClick={openMapDialog}>
                            Full Screen
                          </Button>
                        </Box>
                      </Box>
                      <TreatmentList treatmentList={treatmentList} getTreatments={getTreatments} refresh={getProject} />
                    </Box>
                  </Paper>

                  <Paper elevation={2}>
                    <ProjectAttachments attachmentsList={attachmentsList} getAttachments={getAttachments} />
                  </Paper>
                </Box>
              </Grid>

              <Grid item md={4}>
                <Paper elevation={2}>
                  <ProjectDetailsPage
                    projectForViewData={projectWithDetails}
                    codes={codes.codes}
                    refresh={getProject}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      <Dialog fullScreen open={openFullScreen} onClose={closeMapDialog}>
        <Box pr={3} pl={1} display="flex" alignItems="center">
          <Box>
            <IconButton onClick={closeMapDialog}>
              <Icon path={mdiArrowLeft} size={1} />
            </IconButton>
          </Box>
          <Box flex="1 1 auto">
            <TreatmentSpatialUnits
              treatmentList={treatmentList}
              getTreatments={getTreatments}
              getAttachments={getAttachments}
            />
          </Box>
        </Box>
        <Box display="flex" height="100%" flexDirection="column">
          <Box flex="1 1 auto">
            <LocationBoundary
              projectForViewData={projectWithDetails}
              treatmentList={treatmentList}
              codes={codes.codes}
              refresh={getProject}
            />
          </Box>
          <Box flex="0 0 auto" height="300px">
            <TreatmentList treatmentList={treatmentList} getTreatments={getTreatments} refresh={getProject} />
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

export default ViewProjectPage;
