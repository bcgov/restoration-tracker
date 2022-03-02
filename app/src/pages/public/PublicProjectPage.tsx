import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Drawer from '@material-ui/core/Drawer';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import PublicProjectDetails from './PublicProjectDetails';
import PublicLocationBoundary from './components/PublicLocationBoundary';
import useCodes from 'hooks/useCodes';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    projectDetailDrawer: {
      '& .MuiDrawer-paper': {
        position: 'relative',
        overflow: 'hidden',
        width: '30rem'
      }
    },
    projectDetailMain: {
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

  const codes = useCodes();

  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [projectWithDetails, setProjectWithDetails] = useState<IGetProjectForViewResponse | null>(null);

  const getProject = useCallback(async () => {
    const projectWithDetailsResponse = await restorationTrackerApi.public.project.getProjectForView(
      urlParams['id'] || 1
    );

    if (!projectWithDetailsResponse) {
      // TODO error handling/messaging
      return;
    }

    setProjectWithDetails(projectWithDetailsResponse);
  }, [restorationTrackerApi.public.project, urlParams]);

  useEffect(() => {
    if (!isLoadingProject && !projectWithDetails) {
      getProject();
      setIsLoadingProject(true);
    }
  }, [isLoadingProject, projectWithDetails, getProject]);

  if (!projectWithDetails || !(codes.isReady && codes.codes)) {
    return <CircularProgress className="pageProgress" size={40} />;
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
        <Box display="flex" flex="1 1 auto" flexDirection="column" className={classes.projectDetailMain}>
          <Box flex="1 1 auto">
            <PublicLocationBoundary projectForViewData={projectWithDetails} refresh={getProject} />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default PublicProjectPage;
