import Link from '@material-ui/core/Link';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import React, { useState } from 'react';
import { handleChangePage, handleChangeRowsPerPage } from 'utils/tablePaginationUtils';
import { getFormattedFileSize } from 'utils/Utils';

const useStyles = makeStyles(() => ({
  attachmentsTable: {
    '& .MuiTableCell-root': {
      verticalAlign: 'middle'
    }
  }
}));

export interface IPublicAttachmentsListProps {
  projectId: number;
  attachmentsList: IGetProjectAttachment[];
  getAttachments: (forceFetch: boolean) => void;
}

const PublicAttachmentsList: React.FC<IPublicAttachmentsListProps> = (props) => {
  const classes = useStyles();

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const openAttachment = async (attachment: IGetProjectAttachment) => window.open(attachment.url);

  return (
    <>
      <TableContainer>
        <Table className={classes.attachmentsTable} aria-label="attachments-list-table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>File Size</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.attachmentsList.length > 0 &&
              props.attachmentsList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                <TableRow key={`${row.fileName}-${index}`}>
                  <TableCell scope="row">
                    <Link underline="always" component="button" variant="body2" onClick={() => openAttachment(row)}>
                      {row.fileName}
                    </Link>
                  </TableCell>
                  <TableCell>{getFormattedFileSize(row.size)}</TableCell>
                </TableRow>
              ))}
            {!props.attachmentsList.length && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No Attachments
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {props.attachmentsList.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 15, 20]}
          component="div"
          count={props.attachmentsList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={(event: unknown, newPage: number) => handleChangePage(event, newPage, setPage)}
          onChangeRowsPerPage={(event: React.ChangeEvent<HTMLInputElement>) =>
            handleChangeRowsPerPage(event, setPage, setRowsPerPage)
          }
        />
      )}
    </>
  );
};

export default PublicAttachmentsList;
