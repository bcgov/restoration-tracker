import { Card, Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Link from '@material-ui/core/Link';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import clsx from 'clsx';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { ProjectStatusType } from 'constants/misc';
import { IGetDraftsListResponse } from 'interfaces/useDraftApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import moment from 'moment';
import React from 'react';
import { useHistory } from 'react-router';
import { getFormattedDate } from 'utils/Utils';

const useStyles = makeStyles((theme: Theme) => ({
  linkButton: {
    textAlign: 'left'
  },
  chip: {
    color: 'white'
  },
  chipActive: {
    backgroundColor: theme.palette.success.main
  },
  chipPublishedCompleted: {
    backgroundColor: theme.palette.success.main
  },
  chipDraft: {
    backgroundColor: theme.palette.info.main
  }
}));

export interface IProjectsListProps {
  projects: IGetProjectForViewResponse[];
  drafts: IGetDraftsListResponse[];
}

/**
 * Page to display a list of projects.
 *
 * @return {*}
 */
const ProjectsListPage: React.FC<IProjectsListProps> = (props) => {
  const { projects, drafts } = props;

  const history = useHistory();
  const classes = useStyles();

  const projectCount = projects.length;

  const getProjectStatusType = (projectData: IGetProjectForViewResponse): ProjectStatusType => {
    return (
      (projectData.project.end_date &&
        moment(projectData.project.end_date).endOf('day').isBefore(moment()) &&
        ProjectStatusType.COMPLETED) ||
      ProjectStatusType.ACTIVE
    );
  };

  const getChipIcon = (statusType: ProjectStatusType) => {
    let chipLabel;
    let chipStatusClass;

    if (ProjectStatusType.ACTIVE === statusType) {
      chipLabel = 'Active';
      chipStatusClass = classes.chipActive;
    } else if (ProjectStatusType.COMPLETED === statusType) {
      chipLabel = 'Completed';
      chipStatusClass = classes.chipPublishedCompleted;
    } else if (ProjectStatusType.DRAFT === statusType) {
      chipLabel = 'Draft';
      chipStatusClass = classes.chipDraft;
    }

    return <Chip size="small" className={clsx(classes.chip, chipStatusClass)} label={chipLabel} />;
  };

  const navigateToCreateProjectPage = (draftId?: number) => {
    if (draftId) {
      history.push(`/admin/projects/create?draftId=${draftId}`);
      return;
    }

    history.push('/admin/projects/create');
  };

  const navigateToProjectPage = (id: number) => {
    history.push(`/admin/projects/${id}`);
  };

  const getProjectsTableData = () => {
    const hasProjects = projects?.length > 0;
    const hasDrafts = drafts?.length > 0;

    if (!hasProjects && !hasDrafts) {
      return (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project Name</TableCell>
              <TableCell>Activites</TableCell>
              <TableCell>Permits</TableCell>
              <TableCell>Contact Agency</TableCell>
              <TableCell>Start Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6}>
                <Box display="flex" justifyContent="center">
                  No Results
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
    } else {
      return (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Project Name</TableCell>
                <TableCell>Permits</TableCell>
                <TableCell>Contact Agency</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody data-testid="project-table">
              {drafts?.map((row) => (
                <TableRow key={row.id}>
                  <TableCell component="th" scope="row">
                    <Link
                      data-testid={row.name}
                      underline="always"
                      component="button"
                      className={classes.linkButton}
                      variant="body2"
                      onClick={() => navigateToCreateProjectPage(row.id)}>
                      {row.name}
                    </Link>
                  </TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell>{getChipIcon(ProjectStatusType.DRAFT)}</TableCell>
                </TableRow>
              ))}
              {projects?.map((row) => (
                <TableRow key={row.project.project_id}>
                  <TableCell component="th" scope="row">
                    <Link
                      data-testid={row.project.project_name}
                      underline="always"
                      component="button"
                      variant="body2"
                      onClick={() => navigateToProjectPage(row.project.project_id)}>
                      {row.project.project_name}
                    </Link>
                  </TableCell>
                  <TableCell>{row.permit.permits.map((item) => item.permit_number).join(', ')}</TableCell>
                  <TableCell>{row.coordinator.coordinator_agency}</TableCell>
                  <TableCell>{getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.project.start_date)}</TableCell>
                  <TableCell>{getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.project.end_date)}</TableCell>
                  <TableCell>{getChipIcon(getProjectStatusType(row))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }
  };

  /**
   * Displays project list.
   */
  return (
    <Card>
      <Box display="flex" alignItems="center" justifyContent="space-between" m={1} p={2}>
        <Typography variant="h4" component="h3">
          Found {projectCount} {projectCount !== 1 ? 'projects' : 'project'}
        </Typography>
      </Box>
      <Box>{getProjectsTableData()}</Box>
    </Card>
  );
};

export default ProjectsListPage;
