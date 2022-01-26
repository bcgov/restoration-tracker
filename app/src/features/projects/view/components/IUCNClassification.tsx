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
            const iucn1_name =
              props.codes.iucn_conservation_action_level_1_classification[classificationDetail.classification - 1].name;

            const iucn2_name =
              props.codes.iucn_conservation_action_level_2_subclassification[
                classificationDetail.subClassification1 - 1
              ].name;

            const iucn3_name =
              props.codes.iucn_conservation_action_level_3_subclassification[
                classificationDetail.subClassification2 - 1
              ].name;

            return (
              <li key={index}>
                {iucn1_name} &gt; {iucn2_name} &gt;{iucn3_name}
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
