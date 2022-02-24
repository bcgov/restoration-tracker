import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { SystemRoleGuard } from 'components/security/Guards';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetDraftsListResponse } from 'interfaces/useDraftApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import ProjectsListPage from '../projects/list/ProjectsListPage';

const MyProjectsPage: React.FC = () => {
  const history = useHistory();

  const { keycloakWrapper } = useContext(AuthStateContext);

  const restorationTrackerApi = useRestorationTrackerApi();

  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);

  const [projects, setProjects] = useState<IGetProjectForViewResponse[]>([]);
  const [drafts, setDrafts] = useState<IGetDraftsListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  //codes
  useEffect(() => {
    const getCodes = async () => {
      const codesResponse = await restorationTrackerApi.codes.getAllCodeSets();

      if (!codesResponse) {
        return;
      }

      setCodes(codesResponse);
    };

    if (!isLoadingCodes && !codes) {
      getCodes();
      setIsLoadingCodes(true);
    }
  }, [restorationTrackerApi.codes, isLoadingCodes, codes]);

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

  if (!isLoadingCodes) {
    return <CircularProgress data-testid="project-loading" className="pageProgress" size={40} />;
  }

  return (
    <Container maxWidth="xl">
      <Box m={5}>
        <Box mb={1} display="flex" justifyContent="space-between">
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
      </Box>

      <Box m={5}>
        <ProjectsListPage projects={projects} drafts={drafts} />
      </Box>
    </Container>
  );
};

export default MyProjectsPage;
