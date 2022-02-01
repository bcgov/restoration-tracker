import Link from '@material-ui/core/Link';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

export interface IProjectCoordinatorProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    projectContactList: {
      marginLeft: 0,
      marginRight: 0,
      padding: 0,
      listStyleType: 'none',
      '& li + li': {
        marginTop: theme.spacing(1.5)
      }
    }
  })
);
/**
 * Project coordinator content for a project.
 *
 * @return {*}
 */
const ProjectCoordinator: React.FC<IProjectCoordinatorProps> = (props) => {
  const {
    projectForViewData: { coordinator }
  } = props;
  const classes = useStyles();

  return (
    <>
      <ul className={classes.projectContactList}>
        <li>
          <div>
            <strong data-testid="CoordinatorName">
              {' '}
              {coordinator.first_name} {coordinator.last_name}
            </strong>
          </div>
          <div>
            <Link href="#">{coordinator.email_address}</Link>
          </div>
          <div>{coordinator.coordinator_agency}</div>
        </li>
      </ul>
    </>
  );
};

export default ProjectCoordinator;
