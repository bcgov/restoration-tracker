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
const GeneralInformation: React.FC<IProjectGeneralInformationProps> = (props) => {
  const {
    projectForViewData: { project }
  } = props;

  return (
    <>
      <Box component="dl" data-testid="general_info_component">
        <div>
          <Typography variant="body2" component="dd" color="textSecondary">
            Project Name:
          </Typography>
          <Typography variant="body2" component="dt">
            {project.project_name}
          </Typography>
        </div>
        <div>
          <Typography variant="body2" component="dd" color="textSecondary">
            Start Date:
          </Typography>
          <Typography variant="body2" component="dt">
            {getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, project.start_date)}
          </Typography>
        </div>
        <div>
          <Typography variant="body2" component="dd" color="textSecondary">
            Completion Date:
          </Typography>
          <Typography variant="body2" component="dt">
            {project.end_date ? getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, project.end_date) : '---'}
          </Typography>
        </div>
      </Box>
    </>
  );
};

export default GeneralInformation;
