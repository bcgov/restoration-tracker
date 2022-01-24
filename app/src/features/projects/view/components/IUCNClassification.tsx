import Box from '@material-ui/core/Box';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

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
        <Box component="ul">
          <Box component="li">No IUCN Classifications</Box>
        </Box>
      )}
    </>
  );
};

export default IUCNClassification;
