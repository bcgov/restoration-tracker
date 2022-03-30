import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { mdiArrowLeft } from '@mdi/js';
import { Icon } from '@mdi/react';
import { ProjectPriorityChip, ProjectStatusChip } from 'components/chips/ProjectChips';
import TreatmentList from 'features/projects/view/components/TreatmentList';
import ProjectDetailsPage from 'features/projects/view/ProjectDetailsPage';
import useCodes from 'hooks/useCodes';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import {
  IGetProjectAttachment,
  IGetProjectForViewResponse,
  IGetProjectTreatment,
  TreatmentSearchCriteria
} from 'interfaces/useProjectApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import PublicLocationBoundary from './components/PublicLocationBoundary';
import PublicProjectAttachments from './components/PublicProjectAttachments';
import PublicTreatmentSpatialUnits from './components/PublicTreatmentSpatialUnits';

/**
 * Page to display a single Public (published) Project.
 *
 * @return {*}
 */
const PublicProjectPage = () => {
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
    const projectWithDetailsResponse = await restorationTrackerApi.public.project.getProjectForView(projectId);

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

  const isPriority = projectWithDetails.location.priority === 'true';

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
                      <TreatmentList treatmentList={treatmentList} getTreatments={getTreatments} refresh={getProject} />
                    </Box>
                  </Paper>

                  <Paper elevation={2}>
                    <PublicProjectAttachments projectForViewData={projectWithDetails} />
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
            <TreatmentList treatmentList={treatmentList} getTreatments={getTreatments} refresh={getProject} />
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

export default PublicProjectPage;
