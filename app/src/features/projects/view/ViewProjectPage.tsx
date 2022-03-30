import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { mdiArrowLeft } from '@mdi/js';
import { Icon } from '@mdi/react';
import { ProjectPriorityChip, ProjectStatusChip } from 'components/chips/ProjectChips';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { RoleGuard } from 'components/security/Guards';
import { DeleteProjectI18N } from 'constants/i18n';
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
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import TreatmentList from './components/TreatmentList';
import TreatmentSpatialUnits from './components/TreatmentSpatialUnits';
import ProjectAttachments from './ProjectAttachments';
import ProjectDetailsPage from './ProjectDetailsPage';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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

  const isPriority = projectWithDetails.location.priority === 'true';

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
                <Box ml={1}>
                  <ProjectStatusChip
                    startDate={projectWithDetails.project.start_date}
                    endDate={projectWithDetails.project.end_date}
                  />
                </Box>
                {isPriority && (
                  <Box ml={0.5}>
                    <ProjectPriorityChip />
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
