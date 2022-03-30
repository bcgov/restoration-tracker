import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { SystemRoleGuard } from 'components/security/Guards';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetDraftsListResponse } from 'interfaces/useDraftApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import ProjectsListPage from '../projects/list/ProjectsListPage';

const MyProjectsPage: React.FC = () => {
  const history = useHistory();

  const { keycloakWrapper } = useContext(AuthStateContext);

  const restorationTrackerApi = useRestorationTrackerApi();

  const [projects, setProjects] = useState<IGetProjectForViewResponse[]>([]);
  const [drafts, setDrafts] = useState<IGetDraftsListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  //projects and drafts
  useEffect(() => {
    const getProjects = async () => {
      if (!keycloakWrapper?.hasLoadedAllUserInfo) {
        return;
      }

      const projectsResponse = await restorationTrackerApi.project.getUserProjectsList(keycloakWrapper.systemUserId);

      setIsLoading(false);
      setProjects(projectsResponse);
    };

    const getDrafts = async () => {
      const draftsResponse = await restorationTrackerApi.draft.getDraftsList();

      setDrafts(() => {
        setIsLoading(false);
        return draftsResponse;
      });
    };

    if (isLoading) {
      getProjects();
      getDrafts();
    }
  }, [restorationTrackerApi, isLoading, keycloakWrapper]);

  return (
    <Container maxWidth="xl">

      <Box mb={5} display="flex" justifyContent="space-between">
        <Typography variant="h1">My Projects</Typography>
        <SystemRoleGuard
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.PROJECT_CREATOR]}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Icon path={mdiPlus} size={1} />}
            onClick={() => history.push('/admin/projects/create')}
            data-testid="create-project-button">
            Create Project
          </Button>
        </SystemRoleGuard>
      </Box>

      <ProjectsListPage projects={projects} drafts={drafts} />

    </Container>
  );
};

export default MyProjectsPage;
