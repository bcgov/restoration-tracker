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
      <Typography variant="body2" color="textSecondary">
        {project.objectives}
      </Typography>
    </>
  );
};

export default Objectives;
