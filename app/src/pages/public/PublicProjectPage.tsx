import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Drawer from '@material-ui/core/Drawer';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import PublicTreatmentList from 'features/projects/view/components/TreatmentList';
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
import PublicTreatmentSpatialUnits from './components/PublicTreatmentSpatialUnits';
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
    }
  })
);

/**
 * Page to display a single Public (published) Project.
 *
 * @return {*}
 */
const PublicProjectPage = () => {
  const urlParams = useParams();
  const restorationTrackerApi = useRestorationTrackerApi();
  const classes = useStyles();

  const projectId = urlParams['id'];
  const codes = useCodes();

  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [projectWithDetails, setProjectWithDetails] = useState<IGetProjectForViewResponse | null>(null);
  const [attachmentsList, setAttachmentsList] = useState<IGetProjectAttachment[]>([]);
  const [treatmentList, setTreatmentList] = useState<IGetProjectTreatment[]>([]);

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

  return (
    <>
      <Box
        display="flex"
        position="absolute"
        width="100%"
        height="100%"
        overflow="hidden"
        data-testid="view_project_page_component">
        {/* Details Container */}
        <Drawer variant="permanent" className={classes.projectDetailDrawer}>
          <PublicProjectDetails projectForViewData={projectWithDetails} codes={codes.codes} refresh={getProject} />
        </Drawer>

        {/* Map Container */}
        <Box display="flex" flex="1 1 auto" flexDirection="column" className={classes.projectLocationBoundary}>
          <Box>
            <PublicTreatmentSpatialUnits treatmentList={treatmentList} getTreatments={getTreatments} />
          </Box>

          <Box flex="1 1 auto">
            <PublicLocationBoundary
              projectForViewData={projectWithDetails}
              treatmentList={treatmentList}
              refresh={getProject}
            />
          </Box>

          <Box flex="0 0 auto" height="250px">
            <PublicTreatmentList treatmentList={treatmentList} getTreatments={getTreatments} refresh={getProject} />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default PublicProjectPage;
