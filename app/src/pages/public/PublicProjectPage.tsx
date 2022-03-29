import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { mdiArrowLeft } from '@mdi/js';
import { Icon } from '@mdi/react';
import clsx from 'clsx';
import { ProjectStatusType } from 'constants/misc';
import useCodes from 'hooks/useCodes';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import {
  IGetProjectAttachment,
  IGetProjectForViewResponse,
  IGetProjectTreatment,
  TreatmentSearchCriteria
} from 'interfaces/useProjectApi.interface';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import PublicLocationBoundary from './components/PublicLocationBoundary';
import PublicProjectAttachments from './components/PublicProjectAttachments';
import PublicTreatmentSpatialUnits from './components/PublicTreatmentSpatialUnits';
import PublicTreatmentList from './components/PublicTreatmentList';
import PublicProjectDetails from './PublicProjectDetails';

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
 * Page to display a single Public (published) Project.
 *
 * @return {*}
 */
const PublicProjectPage = () => {
  const classes = useStyles();
  const urlParams = useParams();
  const projectId = urlParams['id'];

  const [openFullScreen, setOpenFullScreen] = React.useState(false);

  const restorationTrackerApi = useRestorationTrackerApi();

  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [projectWithDetails, setProjectWithDetails] = useState<IGetProjectForViewResponse | null>(null);
  const [attachmentsList, setAttachmentsList] = useState<IGetProjectAttachment[]>([]);
  const [treatmentList, setTreatmentList] = useState<IGetProjectTreatment[]>([]);

  const codes = useCodes();

  const getProject = useCallback(async () => {
    const projectWithDetailsResponse = await restorationTrackerApi.public.project.getProjectForView(projectId || 1);

    if (!projectWithDetailsResponse) {
      // TODO error handling/messaging
      return;
    }

    setProjectWithDetails(projectWithDetailsResponse);
  }, [restorationTrackerApi.public.project, projectId]);

  const getAttachments = useCallback(
    async (forceFetch: boolean) => {
      if (attachmentsList.length && !forceFetch) return;

      try {
        const response = await restorationTrackerApi.public.project.getProjectAttachments(projectId);

        if (!response?.attachmentsList) return;

        setAttachmentsList([...response.attachmentsList]);
      } catch (error) {
        return error;
      }
    },
    [restorationTrackerApi.public.project, projectId, attachmentsList.length]
  );

  const getTreatments = useCallback(
    async (forceFetch: boolean, selectedYears?: TreatmentSearchCriteria) => {
      if (treatmentList.length && !forceFetch) return;

      try {
        const response = await restorationTrackerApi.public.project.getProjectTreatments(projectId, selectedYears);

        if (!response?.treatmentList) return;

        setTreatmentList([...response.treatmentList]);
      } catch (error) {
        return error;
      }
    },
    [restorationTrackerApi.public.project, projectId, treatmentList.length]
  );

  useEffect(() => {
    if (!isLoadingProject && !projectWithDetails) {
      getProject();
      getAttachments(false);
      getTreatments(false);
      setIsLoadingProject(true);
    }
  }, [isLoadingProject, projectWithDetails, getProject, getAttachments, getTreatments]);

  if (!codes.codes || !projectWithDetails) {
    return <CircularProgress className="pageProgress" size={40} data-testid="loading_spinner" />;
  }

  const end_date = projectWithDetails.project.end_date;
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
                    <Box flex="1 1 auto">
                      <PublicTreatmentSpatialUnits treatmentList={treatmentList} getTreatments={getTreatments} />
                    </Box>

                    <Box mb={3}>
                      <Box height="500px" position="relative">
                        <PublicLocationBoundary
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
                    </Box>
                  </Paper>

                  <Paper elevation={2}>
                    <PublicProjectAttachments projectForViewData={projectWithDetails} />
                  </Paper>
                </Box>
              </Grid>

              <Grid item md={4}>
                <Paper elevation={2}>
                  <PublicProjectDetails
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
            <PublicTreatmentSpatialUnits treatmentList={treatmentList} getTreatments={getTreatments} />
          </Box>
        </Box>
        <Box display="flex" height="100%" flexDirection="column">
          <Box flex="1 1 auto">
            <PublicLocationBoundary
              projectForViewData={projectWithDetails}
              treatmentList={treatmentList}
              refresh={getProject}
            />
          </Box>
          <Box flex="0 0 auto" height="300px">
            <PublicTreatmentList treatmentList={treatmentList} getTreatments={getTreatments} refresh={getProject} />
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

export default PublicProjectPage;
