import Typography from '@material-ui/core/Typography';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';

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

export interface IPublicIUCNClassificationProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * IUCN Classification content for a public (published) project.
 *
 * @return {*}
 */
const PublicIUCNClassification: React.FC<IPublicIUCNClassificationProps> = (props) => {
  const classes = useStyles();

  const {
    projectForViewData: { iucn }
  } = props;

  const hasIucnClassifications = iucn.classificationDetails && iucn.classificationDetails.length > 0;

  return (
    <ul className={classes.projectIucnList}>
      {hasIucnClassifications &&
        iucn.classificationDetails.map((classificationDetail: any, index: number) => {
          const iucn1_name =
            props.codes.iucn_conservation_action_level_1_classification[classificationDetail.classification - 1].name;

          const iucn2_name =
            props.codes.iucn_conservation_action_level_2_subclassification[classificationDetail.subClassification1 - 1]
              .name;

          const iucn3_name =
            props.codes.iucn_conservation_action_level_3_subclassification[classificationDetail.subClassification2 - 1]
              .name;

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

export default PublicIUCNClassification;
