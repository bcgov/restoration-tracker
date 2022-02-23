import Typography from '@material-ui/core/Typography';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    projectPermitList: {
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

export interface IPublicProjectPermitsProps {
  projectForViewData: IGetProjectForViewResponse;
  refresh: () => void;
}

/**
 * Permits content for a public (published) project.
 *
 * @return {*}
 */
const PublicProjectPermits: React.FC<IPublicProjectPermitsProps> = (props) => {
  const classes = useStyles();
  
  const {
    projectForViewData: { permit }
  } = props;

  const hasPermits = permit.permits && permit.permits.length > 0;

  return (
    <>
      <ul className={classes.projectPermitList}>
        {hasPermits &&
          permit.permits.map((item: any) => (
            <li key={item.permit_number} data-testid="permit_item">
              <Typography component="span" variant="body2">
                {item.permit_number} -{' '}
                <span>{item.permit_type}</span>
              </Typography>
            </li>
          ))}

        {!hasPermits && (
          <li>
            <Typography variant="body2" data-testid="no_permits_loaded">
              No permits
            </Typography>
          </li>
        )}
      </ul>
    </>
  );
};

export default PublicProjectPermits;
