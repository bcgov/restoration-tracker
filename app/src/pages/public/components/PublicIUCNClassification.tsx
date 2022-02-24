import Typography from '@material-ui/core/Typography';
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

export interface IPublicIUCNClassificationProps {
  projectForViewData: IGetProjectForViewResponse;
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
          return (
            <li key={index} data-testid="IUCNData">
              {classificationDetail.classification} <span>{'>'}</span> {classificationDetail.subClassification1}{' '}
              <span>{'>'}</span> {classificationDetail.subClassification2}
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
