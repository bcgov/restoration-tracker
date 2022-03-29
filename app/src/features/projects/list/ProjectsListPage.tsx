import { Card, Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { ProjectDraftChip, ProjectStatusChip } from 'components/chips/ProjectChips';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IGetDraftsListResponse } from 'interfaces/useDraftApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { useHistory } from 'react-router';
import { getFormattedDate } from 'utils/Utils';

const useStyles = makeStyles((theme: Theme) => ({
  linkButton: {
    textAlign: 'left'
  }
}));

export interface IProjectsListProps {
  projects: IGetProjectForViewResponse[];
  drafts?: IGetDraftsListResponse[];
}

const ProjectsListPage: React.FC<IProjectsListProps> = (props) => {
  const { projects, drafts } = props;

  const history = useHistory();
  const classes = useStyles();

  /**
   * Displays project list.
   */
  return (
    <Card>
      <Box display="flex" alignItems="center" justifyContent="space-between" m={1} p={2}>
        <Typography variant="h4" component="h3">
          Found {projects?.length} {projects?.length !== 1 ? 'projects' : 'project'}
        </Typography>
      </Box>
      <Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Project Name</TableCell>
                <TableCell>Permits</TableCell>
                <TableCell>Contact Agencies</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody data-testid="project-table">
              {!drafts?.length && !projects?.length && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box display="flex" justifyContent="center">
                      No Results
                    </Box>
                  </TableCell>
                </TableRow>
              )}
              {drafts?.map((row) => (
                <TableRow key={row.id}>
                  <TableCell component="th" scope="row">
                    <Link
                      data-testid={row.name}
                      underline="always"
                      component="button"
                      className={classes.linkButton}
                      variant="body2"
                      onClick={() => history.push(`/admin/projects/create?draftId=${row.id}`)}>
                      {row.name}
                    </Link>
                  </TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell>
                    <ProjectDraftChip />
                  </TableCell>
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
                      onClick={() => history.push(`/admin/projects/${row.project.project_id}`)}>
                      {row.project.project_name}
                    </Link>
                  </TableCell>
                  <TableCell>{row.permit.permits.map((item) => item.permit_number).join(', ')}</TableCell>
                  <TableCell>{row.contact.contacts.map((item) => item.agency).join(', ')}</TableCell>
                  <TableCell>{getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.project.start_date)}</TableCell>
                  <TableCell>{getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.project.end_date)}</TableCell>
                  <TableCell>
                    <ProjectStatusChip startDate={row.project.start_date} endDate={row.project.end_date} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Card>
  );
};

export default ProjectsListPage;
