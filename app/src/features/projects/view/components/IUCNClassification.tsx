import Typography from '@material-ui/core/Typography';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import Box from '@material-ui/core/Box';

export interface IIUCNClassificationProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * IUCN Classification content for a project.
 *
 * @return {*}
 */
const IUCNClassification: React.FC<IIUCNClassificationProps> = (props) => {
  const {
    projectForViewData: { iucn }
  } = props;

  const hasIucnClassifications = iucn.classificationDetails && iucn.classificationDetails.length > 0;

  return (
    <>
      <Box component="section" mt={3}>
        <Typography variant="body1" component={'h3'}>
          IUCN Conservation Actions Classifications
        </Typography>
      </Box>

      <Box mt={3} component="ul" pl={3}>
        {hasIucnClassifications &&
          iucn.classificationDetails.map((classificationDetail: any, index: number) => {
            return (
              <li key={index}>
                {classificationDetail.classification} &gt; {classificationDetail.subClassification1} &gt;
                {classificationDetail.subClassification2}
              </li>
            );
          })}

        {!hasIucnClassifications && (
          <Typography component="dt" variant="body1">
            No Classifications
          </Typography>
        )}
      </Box>
    </>
  );
};

export default IUCNClassification;
