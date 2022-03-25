import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { mdiDownload } from '@mdi/js';
import Icon from '@mdi/react';
import clsx from 'clsx';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { ProjectStatusType } from 'constants/misc';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
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
  drafts?: IGetDraftsListResponse[];
}

const ProjectsListPage: React.FC<IProjectsListProps> = (props) => {
  const { projects, drafts } = props;

  const history = useHistory();
  const classes = useStyles();

  const restorationTrackerApi = useRestorationTrackerApi();

  const getProjectStatusType = (projectData: IGetProjectForViewResponse): ProjectStatusType => {
    if (projectData.project.end_date && moment(projectData.project.end_date).endOf('day').isBefore(moment())) {
      return ProjectStatusType.COMPLETED;
    }

    return ProjectStatusType.ACTIVE;
  };

  const getChipIcon = (statusType: ProjectStatusType) => {
    let chipLabel;
    let chipStatusClass;

    console.log(statusType);

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

  const handleDownloadProjectEML = async (projectId: number) => {
    const response = await restorationTrackerApi.project.downloadProjectEML(projectId);

    const blob = new Blob([response], { type: 'text/xml' });
    const url = window.URL.createObjectURL(blob);

    window.open(url);
  };

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
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody data-testid="project-table">
              {!drafts?.length && !projects?.length && (
                <TableRow>
                  <TableCell colSpan={7}>
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
                  <TableCell>{getChipIcon(ProjectStatusType.DRAFT)}</TableCell>
                  <TableCell />
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
                  <TableCell>{getChipIcon(getProjectStatusType(row))}</TableCell>
                  <TableCell>
                    <IconButton
                      title="Download Project EML"
                      aria-label="Download Project EML"
                      size="small"
                      data-testid="project-table-download-eml"
                      onClick={() => handleDownloadProjectEML(row.project.project_id)}>
                      <Icon path={mdiDownload} size={1} />
                    </IconButton>
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
