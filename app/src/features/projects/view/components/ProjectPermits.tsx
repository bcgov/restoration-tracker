import Box from '@material-ui/core/Box';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import {
  IGetProjectForViewResponse
} from 'interfaces/useProjectApi.interface';
import React from 'react';

export interface IProjectPermitsProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * Permits content for a project.
 *
 * @return {*}
 */
const ProjectPermits: React.FC<IProjectPermitsProps> = (props) => {
  const {
    projectForViewData: { permit }
  } = props;


  const hasPermits = permit.permits && permit.permits.length > 0;

  return (
    <>
      <Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Number</TableCell>
                <TableCell>Type</TableCell>
              </TableRow>
            </TableHead>

            {hasPermits && (
              <TableBody>
                {permit.permits.map((item: any) => (
                  <TableRow key={item.permit_number}>
                    <TableCell>{item.permit_number}</TableCell>
                    <TableCell>{item.permit_type}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}

            {!hasPermits && (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={2}>No Permits</TableCell>
                </TableRow>
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};

export default ProjectPermits;
