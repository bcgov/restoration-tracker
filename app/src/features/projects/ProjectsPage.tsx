import { Container, Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import ProjectFilter, { IProjectFilter, ProjectFilterInitalValues } from 'components/search-filter/ProjectFilter';
import { Formik, FormikProps } from 'formik';

// import ProjectAdvancedFilters from 'components/search-filter/ProjectAdvancedFilters';
//import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
//import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
//import makeStyles from '@material-ui/core/styles/makeStyles';
import React, { useRef } from 'react';

/**
 *
 */
const ProjectsPage: React.FC = (props) => {
  //const classes = useStyles();

  const formikRef = useRef<FormikProps<IProjectFilter>>(null);

  const handleSubmit = async () => {
    console.log('asd');
  };

  /*
  const restorationTrackerApi = useRestorationTrackerApi();

  //codes
  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
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

  */

  return (
    <Container maxWidth="xl">
      <Box m={5}>
        <Typography variant="h1">Projects</Typography>
        <Typography>Find species inventory projects and related data in British Columbia</Typography>
      </Box>

      <Box m={5}>
        <Formik<IProjectFilter> innerRef={formikRef} initialValues={ProjectFilterInitalValues} onSubmit={handleSubmit}>
          <ProjectFilter />
        </Formik>
      </Box>
      {/* <ProjectAdvancedFilters coordinator_agency={[]} species={[]} funding_sources={[]} /> */}
    </Container>
  );
};

export default ProjectsPage;
