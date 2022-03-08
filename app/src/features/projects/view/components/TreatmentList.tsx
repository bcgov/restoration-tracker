import { Card, Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
//import { DialogContext } from 'contexts/dialogContext';
import React from 'react';
//import { IUploadHandler } from 'components/attachments/FileUploadItem';
//import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
//{ useState } from 'react';
//import { useParams } from 'react-router';

export interface IProjectSpatialUnitsProps {}

/**
 * General information content for a project.
 *
 * @return {*}
 */
const TreatmentList: React.FC<IProjectSpatialUnitsProps> = (props) => {
  //const urlParams = useParams();
  // const projectId = urlParams['id'];
  // const restorationTrackerApi = useRestorationTrackerApi();

  const treatments = [
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
          Found {treatments?.length} {treatments?.length !== 1 ? 'treatments' : 'treatment'}
        </Typography>
      </Box>
      <Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Id</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Width</TableCell>
                <TableCell>Length</TableCell>
                <TableCell>Area</TableCell>
                <TableCell>Treatment Year</TableCell>
                <TableCell>Treatments</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody data-testid="project-table">
              {!treatments?.length && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box display="flex" justifyContent="center">
                      No Results
                    </Box>
                  </TableCell>
                </TableRow>
              )}

              {treatments?.map((row?) => (
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
