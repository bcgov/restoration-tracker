import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import { IGetProjectTreatment } from 'interfaces/useProjectApi.interface';
import React, { useState } from 'react';
import { handleChangePage, handleChangeRowsPerPage } from 'utils/tablePaginationUtils';

export interface IProjectTreatmentListProps {
  treatmentList: IGetProjectTreatment[];
  getTreatments: (forceFetch: boolean) => void;
  refresh: () => void;
}

const useStyles = makeStyles({
  treatmentsTable: {
    '& .MuiTableCell-root': {
      verticalAlign: 'middle'
    }
  },
  container: {
    height: '300px'
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

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  interface IGetTreatment {}

  const viewTreatmentUnitDetailsDialog = (treatment: IGetTreatment) => {};

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
        Found {treatmentList?.length} {treatmentList?.length !== 1 ? 'treatments' : 'treatment'}
      </Box>
      <Box>
        <TableContainer className={classes.container}>
          <Table stickyHeader className={classes.treatmentsTable} aria-label="treatments-list-table">
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>ID</strong>
                </TableCell>
                <TableCell>
                  <strong>Type</strong>
                </TableCell>
                <TableCell>
                  <strong>Width</strong>
                </TableCell>
                <TableCell>
                  <strong>Length</strong>
                </TableCell>
                <TableCell>
                  <strong>Area</strong>
                </TableCell>
                <TableCell>
                  <strong>Treatments</strong>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody data-testid="project-table">
              {!treatmentList?.length && (
                <TableRow>
                  <TableCell colSpan={7}>
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
                      <TableCell>{row.width}</TableCell>
                      <TableCell>{row.length}</TableCell>
                      <TableCell>{row.area}</TableCell>
                      <TableCell>{row.treatments?.map((item: any) => item.treatment_name).join(', ')}</TableCell>
                      <TableCell>
                        <Box my={-1}>
                          <Button
                            size="small"
                            color="primary"
                            variant="outlined"
                            aria-label="view treatment unit details"
                            data-testid="view-treatment-unit-details"
                            onClick={() => viewTreatmentUnitDetailsDialog(row)}>
                            {'View Details'}
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        {treatmentList.length > 0 && (
          <TablePagination
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
    </>
  );
};

export default TreatmentList;
