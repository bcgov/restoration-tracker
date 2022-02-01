import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

export interface IProjectObjectivesProps {
  projectForViewData: IGetProjectForViewResponse;
  refresh: () => void;
}

/**
 * General information content for a project.
 *
 * @return {*}
 */
const Objectives: React.FC<IProjectObjectivesProps> = (props) => {
  const {
    projectForViewData: { project }
  } = props;

  return (
    <>
      <Box>
        <dl>
          <Box component="section" mt={3}>
            <Typography variant="body1" component={'h3'}>
              Objectives
            </Typography>

            <Box mt={2}>
              <Typography variant="body2" color="textSecondary">
                {project.objectives}
              </Typography>
            </Box>
          </Box>
        </dl>
      </Box>
    </>
  );
};

export default Objectives;
