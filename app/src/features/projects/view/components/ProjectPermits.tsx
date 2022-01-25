import Box from '@material-ui/core/Box';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import Typography from '@material-ui/core/Typography';

export interface IProjectPermitsProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * Permits content for a project.
 *
 * @return {*}
 */
const ProjectPermits: React.FC<IProjectPermitsProps> = (props) => {
  const {
    projectForViewData: { permit }
  } = props;

  const hasPermits = permit.permits && permit.permits.length > 0;

  return (
    <>
      <Box component="section" mt={3}>
        <Typography variant="body1" component={'h3'}>
          Permits
        </Typography>
      </Box>
      <Box mt={3} component="ul" pl={3}>
        {hasPermits &&
          permit.permits.map((item: any) => (
            <li key={item.permit_number}>
              {item.permit_type} - {item.permit_number}
            </li>
          ))}

        {!hasPermits && (
          <Typography component="dt" variant="body1">
            No permits
          </Typography>
        )}
      </Box>
    </>
  );
};

export default ProjectPermits;
