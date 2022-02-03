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
      <Box component="ul" mb={0} pl={3}>
        {hasPermits &&
          permit.permits.map((item: any) => (
            <li key={item.permit_number} data-testid="permit_item">
              <strong>{item.permit_number}</strong> -{' '}
              <Typography component="span" variant="body2" color="textSecondary">
                {item.permit_type}
              </Typography>
            </li>
          ))}

        {!hasPermits && (
          <li>
            <Typography variant="body2" data-testid="no_permits_loaded">
              No permits
            </Typography>
          </li>
        )}
      </Box>
    </>
  );
};

export default ProjectPermits;
