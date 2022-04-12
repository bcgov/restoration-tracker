import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { IGetProjectTreatment, TreatmentSearchCriteria } from 'interfaces/useProjectApi.interface';
import React, { ReactElement, useState } from 'react';
import { handleChangePage, handleChangeRowsPerPage } from 'utils/tablePaginationUtils';
import { getFormattedTreatmentStringsByYear, groupTreatmentsByYear } from 'utils/treatments';

export interface IProjectTreatmentListProps {
  treatmentList: IGetProjectTreatment[];
  getTreatments: (forceFetch: boolean, selectedYears?: TreatmentSearchCriteria) => void;
  refresh: () => void;
}

const useStyles = makeStyles({
  treatmentsTable: {
    '& .MuiTableCell-root': {
      verticalAlign: 'top'
    }
  },
  pagination: {
    flex: '0 0 auto'
  },
  container: {
    height: '300px',
    maxHeight: 440
  },
  generalInfoTitleColor: {
    color: '#787f81'
  },
  generalInfoGridRow: {
    marginTop: 5
  },
  divider: {
    height: 2,
    marginTop: 16,
    marginBottom: 16
  }
});

/**
 * General information content for a project.
 *
 * @return {*}
 */
const TreatmentList: React.FC<IProjectTreatmentListProps> = (props) => {
  const classes = useStyles();
  const { treatmentList } = props;

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);

  const [opentreatmentDetails, setOpenTreatmentDetails] = useState(false);
  const [currentTreatmentDetail, setCurrentTreatmentDetail] = useState<IGetProjectTreatment>();

  const viewTreatmentUnitDetailsDialog = (treatment: IGetProjectTreatment) => {
    setCurrentTreatmentDetail(treatment);
    setOpenTreatmentDetails(true);
  };

  const TreatmentDetailDialog = () => {
    if (!currentTreatmentDetail) {
      return <></>;
    }

    const generalInformation = [
      { title: 'ID', value: currentTreatmentDetail.id },
      { title: 'Type', value: currentTreatmentDetail.type },
      { title: 'Width (m) / Length (m)', value: `${currentTreatmentDetail.width} / ${currentTreatmentDetail.length}` },
      {
        title: (
          <>
            Area (m<sup>2</sup>)
          </>
        ),
        value: currentTreatmentDetail.area
      },
      {
        title: 'Treatments',
        value: getFormattedTreatmentStringsByYear(groupTreatmentsByYear(currentTreatmentDetail.treatments))
      }
    ];

    return (
      <ComponentDialog
        open={opentreatmentDetails}
        dialogTitle={`Treatment Unit Details: ${currentTreatmentDetail.id}`}
        onClose={() => {
          setOpenTreatmentDetails(false);
          setCurrentTreatmentDetail(undefined);
        }}>
        <Box component="section" mt="5px">
          <Typography variant="subtitle2">
            <b>GENERAL INFORMATION</b>
          </Typography>
          <Divider className={classes.divider} />
          <Box>
            {generalInformation.map((info, idx) => (
              <Grid container key={idx} className={classes.generalInfoGridRow}>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" className={classes.generalInfoTitleColor}>
                    {info.title}
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  {(Array.isArray(info.value) && info.value.length > 1 && (
                    <Box component="ul" pl={2} m={0}>
                      {info.value.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </Box>
                  )) ||
                    info.value}
                </Grid>
              </Grid>
            ))}
          </Box>
        </Box>
        <Box component="section" mt="25px">
          <Typography variant="subtitle2">
            <b>COMMENTS</b>
          </Typography>
          <Divider className={classes.divider} />
          <Typography variant="subtitle2">{currentTreatmentDetail.comments || 'No comments'}</Typography>
        </Box>
      </ComponentDialog>
    );
  };

  const formatYearsTreatmentsBox = (treatmentsByYear: Record<string, string>) => {
    const formattedTreatments: ReactElement[] = [];

    const treatmentEntries = Object.entries(treatmentsByYear);

    treatmentEntries.forEach(([key, value], index) => {
      formattedTreatments.push(
        <Box display="flex" key={`${key}-${index}-value`}>
          <Box flex="0 0 auto" width="80px">
            {key}
          </Box>
          <Box flex="1 1 auto">{value}</Box>
        </Box>
      );

      if (index !== treatmentEntries.length - 1) {
        formattedTreatments.push(
          <Box my={1} key={`${key}-${index}-divider`}>
            <Divider></Divider>
          </Box>
        );
      }
    });

    return formattedTreatments;
  };

  return (
    <>
      <Box display="flex" flexDirection="column" height="100%">
        <Box component={TableContainer}>
          <Table stickyHeader className={classes.treatmentsTable} aria-label="treatments-list-table">
            <TableHead>
              <TableRow>
                <TableCell width="50">ID</TableCell>
                <TableCell>Type</TableCell>
                <TableCell width="80">Year</TableCell>
                <TableCell>Treatments</TableCell>
                <TableCell align="right" width="105">
                  Width (m)
                </TableCell>
                <TableCell align="right" width="110">
                  Length (m)
                </TableCell>
                <TableCell align="right" width="100">
                  Area (m<sup>2</sup>)
                </TableCell>
                <TableCell width="105">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody data-testid="project-table">
              {!treatmentList?.length && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Box display="flex" justifyContent="center">
                      No Treatments
                    </Box>
                  </TableCell>
                </TableRow>
              )}

              {treatmentList.length > 0 &&
                treatmentList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                  return (
                    <TableRow key={row.id}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.type}</TableCell>
                      <TableCell colSpan={2}>
                        {formatYearsTreatmentsBox(groupTreatmentsByYear(row.treatments))}
                      </TableCell>
                      <TableCell align="right">{row.width}</TableCell>
                      <TableCell align="right">{row.length}</TableCell>
                      <TableCell align="right">{row.area}</TableCell>
                      <TableCell>
                        <Box my={-0.5}>
                          <Button
                            size="small"
                            color="primary"
                            variant="outlined"
                            title="View treatment unit details"
                            aria-label="view treatment unit details"
                            data-testid="view-treatment-unit-details"
                            onClick={() => viewTreatmentUnitDetailsDialog(row)}>
                            Details
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </Box>

        {treatmentList.length > 0 && (
          <TablePagination
            className={classes.pagination}
            rowsPerPageOptions={[5, 10, 15, 20]}
            component="div"
            count={treatmentList.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={(event: unknown, newPage: number) => handleChangePage(event, newPage, setPage)}
            onChangeRowsPerPage={(event: React.ChangeEvent<HTMLInputElement>) =>
              handleChangeRowsPerPage(event, setPage, setRowsPerPage)
            }
          />
        )}
      </Box>
      <TreatmentDetailDialog />
    </>
  );
};

export default TreatmentList;
