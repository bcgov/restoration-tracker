import { Container, Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import ProjectFilter, {
  IProjectAdvancedFilters,
  ProjectAdvancedFiltersInitialValues
} from 'components/search-filter/ProjectFilter';
import { Formik, FormikProps } from 'formik';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import ProjectsListPage from './list/ProjectsListPage';
import { IGetProjectsListResponse } from 'interfaces/useProjectApi.interface';
import { IGetDraftsListResponse } from 'interfaces/useDraftApi.interface';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useHistory, useLocation } from 'react-router';
import qs from 'qs';

/**
 *
 */
const ProjectsPage: React.FC = (props) => {
  //const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<IGetProjectsListResponse[]>([]);
  const [drafts, setDrafts] = useState<IGetDraftsListResponse[]>([]);

  const restorationTrackerApi = useRestorationTrackerApi();
  const dialogContext = useContext(DialogContext);

  const formikRef = useRef<FormikProps<IProjectAdvancedFilters>>(null);

  const collectParams = useCallback((): IProjectAdvancedFilters => {
    if (location.search) {
      const urlParams = qs.parse(location.search.replace('?', ''));
      const formikValues = {
        coordinator_agency: urlParams.coordinator_agency,
        permit_number: urlParams.permit_number,
        start_date: urlParams.start_date,
        end_date: urlParams.end_date,
        keyword: urlParams.keyword,
        project_name: urlParams.project_name,
        agency_id: (urlParams.agency_id as unknown) as number,
        agency_project_id: urlParams.agency_project_id,
        species: (urlParams.species as unknown) as number[]
      } as IProjectAdvancedFilters;

      return formikValues;
    }
    return ProjectAdvancedFiltersInitialValues;
  }, [location.search]);

  const [formikValues, setFormikValues] = useState<IProjectAdvancedFilters>(collectParams);
  const [filterChipValues, setFilterChipValues] = useState<IProjectAdvancedFilters>(collectParams);

  const handleParams = async () => {
    const urlParams = qs.stringify(formikRef.current?.values);
    history.push({
      search: `?${urlParams}`
    });
  };

  const handleResetParams = () => {
    history.push({
      search: ``
    });
  };

  const handleReset = async () => {
    const projectsResponse = await restorationTrackerApi.project.getProjectsList();
     setProjects(projectsResponse);
     setFormikValues(ProjectAdvancedFiltersInitialValues);
     setFilterChipValues(ProjectAdvancedFiltersInitialValues);

    handleResetParams();
  };

  const handleSubmit = async () => {
    if (!formikRef?.current) {
      return;
    }

    handleParams();

    try {
      const response = await restorationTrackerApi.project.getProjectsList(formikRef.current.values);

      if (!response) {
        return;
      }

      setProjects(response);
      setFilterChipValues(formikRef.current.values);
    } catch (error) {
      const apiError = error as APIError;
      showFilterErrorDialog({
        dialogTitle: 'Error Filtering Projects',
        dialogError: apiError?.message,
        dialogErrorDetails: apiError?.errors
      });
    }
  };

  const showFilterErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      onClose: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      onOk: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      ...textDialogProps,
      open: true
    });
  };

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
      const projectsResponse = await restorationTrackerApi.project.getProjectsList();

      setProjects(() => {
        setIsLoading(false);
        return projectsResponse;
      });
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
  }, [restorationTrackerApi, isLoading]);

  //Search Params
  useEffect(() => {
    const getParams = async () => {
      const params = await collectParams();
      setFormikValues(params);
    };

    if (isLoading) {
      setIsLoading(false);
      getParams();
    }
  }, [isLoading, location.search, formikValues, collectParams]);

  //reload projects
  useEffect(() => {
    const getProjects = async () => {
      const projectsResponse = await restorationTrackerApi.project.getProjectsList(formikValues);
      setProjects(projectsResponse);
      setIsLoading(false);
    };

    if (isLoading) {
      getProjects();
    }
  }, [formikValues, restorationTrackerApi.project, isLoading]);

  return (
    <Container maxWidth="xl">
      <Box m={5}>
        <Box mb={1}>
          <Typography variant="h1">Projects</Typography>
        </Box>
        <Typography>Find species inventory projects and related data in British Columbia</Typography>
      </Box>

      <Box m={5}>
        <Formik<IProjectAdvancedFilters>
          innerRef={formikRef}
          initialValues={formikValues}
          onSubmit={handleSubmit}
          onReset={handleReset}
          enableReinitialize={true}>
          <ProjectFilter
            coordinator_agency={
              codes?.coordinator_agency?.map((item: any) => {
                return item.name;
              }) || []
            }
            species={
              codes?.species?.map((item) => {
                return { value: item.id, label: item.name };
              }) || []
            }
            funding_sources={
              codes?.funding_source?.map((item) => {
                return { value: item.id, label: item.name };
              }) || []
            }
            filterChipParams={filterChipValues}
          />
        </Formik>
      </Box>

      <Box m={5}>
        <ProjectsListPage projects={projects} drafts={drafts} />
      </Box>
      {/* <ProjectAdvancedFilters coordinator_agency={[]} species={[]} funding_sources={[]} /> */}
    </Container>
  );
};

export default ProjectsPage;
