import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import FundingSource from 'features/projects/view/components/FundingSource';
import ProjectCoordinator from 'features/projects/view/components/ProjectCoordinator';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

export interface IProjectDetailsProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * Project details content for a project.
 *
 * @return {*}
 */
const ProjectDetails: React.FC<IProjectDetailsProps> = (props) => {
  const { projectForViewData, codes, refresh } = props;

  return (
    <>
      <Box component={Paper} p={3}>
        <Typography variant="h2">Project Details</Typography>
        <Box component="section" mt={3}>
          <ProjectCoordinator projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
        </Box>
        <Box component="section" mt={3}>
          <FundingSource projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
        </Box>
      </Box>
    </>
  );
};

export default ProjectDetails;
