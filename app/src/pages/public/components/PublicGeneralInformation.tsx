import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { getFormattedDate } from 'utils/Utils';

export interface IPublicProjectDetailsProps {
  projectForViewData: IGetProjectForViewResponse;
  refresh: () => void;
}

/**
 * General information content for a public (published) project.
 *
 * @return {*}
 */
const PublicGeneralInformation: React.FC<IPublicProjectDetailsProps> = (props) => {
  const {
    projectForViewData: { project, species }
  } = props;

  return (
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
      <div>
        <Typography variant="body2" component="dd" color="textSecondary">
          Focal Species:
        </Typography>
        <Typography component="dd" variant="body2">
          {species/* {species.focal_species_names?.map((item: any, index: number) => {
            return (
              <span key={index} data-testid="focal_species_data">
                {item}
              </span>
            );
          })} */}
        </Typography>
      </div>
    </Box>
  );
};

export default PublicGeneralInformation;
