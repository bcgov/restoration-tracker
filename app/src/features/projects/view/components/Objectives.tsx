import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { getFormattedDate } from 'utils/Utils';

export interface IProjectGeneralInformationProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * General information content for a project.
 *
 * @return {*}
 */
const Objectives: React.FC<IProjectGeneralInformationProps> = (props) => {
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
