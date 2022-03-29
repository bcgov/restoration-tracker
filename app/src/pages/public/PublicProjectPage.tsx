import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
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
import PublicProjectAttachments from './components/PublicProjectAttachments';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    projectDetailDrawer: {
      '& .MuiDrawer-paper': {
        position: 'relative',
        overflow: 'hidden',
        width: '30rem'
      }
    },
    tabs: {
      flexDirection: 'row',
      '& .MuiTabs-indicator': {
        backgroundColor: '#1a5a96'
      },
      '& .MuiTab-root.Mui-selected': {
        color: '#1a5a96'
      },
      backgroundColor: '#f7f8fa'
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

  const [tabValue, setTabValue] = React.useState('project_details');
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

  const TabPanel = (props: { children?: React.ReactNode; index: string; value: string }) => {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        className={classes.tabPanel}
        {...other}>
        {value === index && children}
      </div>
    );
  };

  const handleTabChange = (_: any, newValue: string) => setTabValue(newValue);

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
          <Box display="flex" flexDirection="column" height="100%">
            <Box>
              <Tabs
                className={classes.tabs}
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                aria-label="Project Navigation">
                <Tab label="Project Details" value="project_details" />
                <Tab label="Documents" value="project_documents" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index="project_details">
              <PublicProjectDetails projectForViewData={projectWithDetails} codes={codes.codes} refresh={getProject} />
            </TabPanel>
            <TabPanel value={tabValue} index="project_documents">
              <PublicProjectAttachments projectForViewData={projectWithDetails} />
            </TabPanel>
          </Box>
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
