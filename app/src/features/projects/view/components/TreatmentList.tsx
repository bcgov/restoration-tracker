import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
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
    '& thead sup': {
      display: 'inline-block',
      marginTop: '-7px',
      verticalAlign: 'middle',
      fontSize: '9px'
    },
    '& tbody .MuiTableCell-root': {
      verticalAlign: 'top'
    }
  },
  detaildl: {
    '& dt': {
      width: '10rem'
    },
    '& sup': {
      display: 'inline-block',
      marginTop: '-6px',
      verticalAlign: 'middle',
      fontSize: '10px'
    }
  },
  pagination: {
    flex: '0 0 auto'
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
      { title: 'Width / Length (m)', value: `${currentTreatmentDetail.width} / ${currentTreatmentDetail.length}` },
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
        dialogTitle={`Treatment Unit ID: ${currentTreatmentDetail.id}`}
        onClose={() => {
          setOpenTreatmentDetails(false);
          setCurrentTreatmentDetail(undefined);
        }}>
        <Box component="section" mb={3}>
          <Box my={1}>
            <Typography variant="h3">GENERAL INFORMATION</Typography>
          </Box>

          <Divider />

          <Box component="dl" my={0} className={classes.detaildl}>
            {generalInformation.map((info, idx) => (
              <Box key={idx}>
                <Box py={1} display="flex">
                  <Typography component="dt" variant="body2" color="textSecondary">
                    {info.title}:
                  </Typography>
                  <Typography component="dd" variant="body2">
                    {(Array.isArray(info.value) && info.value.length > 1 && (
                      <Box component="ul" pl={2} m={0}>
                        {info.value.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </Box>
                    )) ||
                      info.value}
                  </Typography>
                </Box>
                <Divider />
              </Box>
            ))}
          </Box>
        </Box>

        <Box component="section">
          <Box mb={1}>
            <Typography variant="h3">COMMENTS</Typography>
          </Box>
          <Divider />
          <Box mt={1}>
            <Typography variant="body2" color="textSecondary">
              {currentTreatmentDetail.comments || 'No comments'}
            </Typography>
          </Box>
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
                treatmentList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
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
