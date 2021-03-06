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
    projectForViewData: { project, species, location }
  } = props;

  const getRegionName = (regionNumber: number) => {
    const codeValue = props.codes.regions.find((code) => code.id === regionNumber);
    return (
      <Typography variant="body2" component="dd" data-testid="project-region">
        {codeValue?.name}
      </Typography>
    );
  };

  const getRangeName = (rangeNumber: number) => {
    const codeValue = props.codes.ranges.find((code) => code.id === rangeNumber);
    return (
      <Typography variant="body2" component="dd" data-testid="project-region">
        {codeValue?.name}
      </Typography>
    );
  };

  return (
    <Box component="dl" data-testid="general_info_component">
      <div>
        <Typography variant="body2" component="dt" color="textSecondary">
          Region:
        </Typography>
        {getRegionName(location.region)}
      </div>
      {location && location.range && (
        <div>
          <Typography variant="body2" component="dt" color="textSecondary">
            Caribou Range:
          </Typography>
          {getRangeName(location.range)}
        </div>
      )}
      <div>
        <Typography variant="body2" component="dt" color="textSecondary">
          Start Date:
        </Typography>
        <Typography variant="body2" component="dd">
          {getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, project.start_date)}
        </Typography>
      </div>
      <div>
        <Typography variant="body2" component="dt" color="textSecondary">
          End Date:
        </Typography>
        <Typography variant="body2" component="dd">
          {project.end_date ? getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, project.end_date) : '---'}
        </Typography>
      </div>
      <div>
        <Typography variant="body2" component="dt" color="textSecondary">
          Focal Species:
        </Typography>
        <Typography component="dd" variant="body2">
          {species.focal_species_names?.map((item: any, index: number) => {
            return (
              <span key={index} data-testid="focal_species_data">
                {item}
                <br></br>
              </span>
            );
          })}
        </Typography>
      </div>
    </Box>
  );
};

export default GeneralInformation;
