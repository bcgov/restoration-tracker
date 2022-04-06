import Typography from '@material-ui/core/Typography';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    projectIucnList: {
      margin: 0,
      padding: 0,
      listStyleType: 'none',
      '& li + li': {
        marginTop: theme.spacing(1),
        paddingTop: theme.spacing(1),
        borderTop: '1px solid #dddddd'
      }
    }
  })
);

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
  const classes = useStyles();

  const {
    projectForViewData: { iucn }
  } = props;

  const hasIucnClassifications = iucn.classificationDetails && iucn.classificationDetails.length > 0;
  return (
    <ul className={classes.projectIucnList}>
      {hasIucnClassifications &&
        iucn.classificationDetails.map((classificationDetail: any, index: number) => {
          const iucn1_name = props.codes.iucn_conservation_action_level_1_classification.find(
            (code) => code.id === classificationDetail.classification
          )?.name;

          const iucn2_name = props.codes.iucn_conservation_action_level_2_subclassification.find(
            (code) => code.id === classificationDetail.subClassification1
          )?.name;

          const iucn3_name = props.codes.iucn_conservation_action_level_3_subclassification.find(
            (code) => code.id === classificationDetail.subClassification2
          )?.name;

          return (
            <li key={index} data-testid="iucn_data">
              {iucn1_name} &gt; {iucn2_name} &gt; {iucn3_name}
            </li>
          );
        })}

      {!hasIucnClassifications && (
        <li>
          <Typography variant="body2" data-testid="no_classification">
            No Classifications
          </Typography>
        </li>
      )}
    </ul>
  );
};

export default IUCNClassification;
