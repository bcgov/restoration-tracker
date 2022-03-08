import { Card, Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { IGetProjectTreatment } from 'interfaces/useProjectApi.interface';
import React from 'react';

export interface IProjectTreatmentProps {
  treatmentList: IGetProjectTreatment[];
  getTreatments: (forceFetch: boolean) => void;
}

/**
 * General information content for a project.
 *
 * @return {*}
 */
const TreatmentList: React.FC<IProjectTreatmentProps> = (props) => {
  //const {treatmentList} = props;

  const treatmentList = [
    {
      id: 'TU 1',
      type: 'Road',
      width: '100M',
      length: '5000M',
      area: '50ha',
      year: '2022',
      treatments: ['Tree Felling']
    },
    {
      id: 'TU 2',
      type: 'Road',
      width: '50M',
      length: '2000M',
      area: '10ha',
      year: '2022',
      treatments: ['Natural Recovery', 'Tree Felling']
    }
  ];

  interface IGetTreatment {}

  const viewTreatmentUnitDetailsDialog = (treatment: IGetTreatment) => {};

  return (
    <Card>
      <Box display="flex" alignItems="center" justifyContent="space-between" m={1} p={2}>
        <Typography variant="h4" component="h3">
          Found {treatmentList?.length} {treatmentList?.length !== 1 ? 'treatments' : 'treatment'}
        </Typography>
      </Box>
      <Box>
        <TableContainer>
          <Table>
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
                  <strong>Treatment Year</strong>
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
                  <TableCell colSpan={6}>
                    <Box display="flex" justifyContent="center">
                      No Results
                    </Box>
                  </TableCell>
                </TableRow>
              )}

              {treatmentList?.map((row?) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.width}</TableCell>
                  <TableCell>{row.length}</TableCell>
                  <TableCell>{row.area}</TableCell>
                  <TableCell>{row.year}</TableCell>
                  <TableCell>{row.treatments?.map((item: any) => item).join(', ')}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Card>
  );
};

export default TreatmentList;
