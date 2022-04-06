import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import { mdiDotsVertical, mdiDownload, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { AttachmentsI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import React, { useContext, useState } from 'react';
import { handleChangePage, handleChangeRowsPerPage } from 'utils/tablePaginationUtils';
import { getFormattedFileSize } from 'utils/Utils';

const useStyles = makeStyles((theme: Theme) => ({
  attachmentsTable: {
    '& .MuiTableCell-root': {
      verticalAlign: 'middle'
    }
  },
  uploadMenu: {
    marginTop: theme.spacing(1)
  }
}));

export interface IAttachmentsListProps {
  projectId: number;
  attachmentsList: IGetProjectAttachment[];
  getAttachments: (forceFetch: boolean) => void;
}

const AttachmentsList: React.FC<IAttachmentsListProps> = (props) => {
  const classes = useStyles();
  const restorationTrackerApi = useRestorationTrackerApi();

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const handleDownloadFileClick = (attachment: IGetProjectAttachment) => {
    openAttachment(attachment);
  };

  const handleDeleteFileClick = (attachment: IGetProjectAttachment) => {
    showDeleteAttachmentDialog(attachment);
  };

  const dialogContext = useContext(DialogContext);

  const defaultErrorDialogProps = {
    open: false,
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({ ...defaultErrorDialogProps, ...textDialogProps, open: true });
  };

  const defaultYesNoDialogProps = {
    dialogTitle: 'Delete Attachment',
    dialogText: 'Are you sure you want to delete the selected attachment?',
    open: false,
    onClose: () => dialogContext.setYesNoDialog({ open: false }),
    onNo: () => dialogContext.setYesNoDialog({ open: false }),
    onYes: () => dialogContext.setYesNoDialog({ open: false })
  };

  const showDeleteAttachmentDialog = (attachment: IGetProjectAttachment) => {
    dialogContext.setYesNoDialog({
      ...defaultYesNoDialogProps,
      open: true,
      yesButtonProps: { color: 'secondary' },
      onYes: () => {
        deleteAttachment(attachment);
        dialogContext.setYesNoDialog({ open: false });
      }
    });
  };

  const deleteAttachment = async (attachment: IGetProjectAttachment) => {
    if (!attachment?.id) {
      return;
    }

    try {
      await restorationTrackerApi.project.deleteProjectAttachment(props.projectId, attachment.id);

      props.getAttachments(true);
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({
        dialogTitle: AttachmentsI18N.deleteErrorTitle,
        dialogText: AttachmentsI18N.deleteErrorText,
        dialogErrorDetails: apiError.errors,
        open: true
      });
      return;
    }
  };

  const openAttachment = async (attachment: IGetProjectAttachment) => window.open(attachment.url);

  return (
    <>
      <Box>
        <TableContainer>
          <Table className={classes.attachmentsTable} aria-label="attachments-list-table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>File Size</TableCell>
                <TableCell width="100" align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {props.attachmentsList.length > 0 &&
                props.attachmentsList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                  return (
                    <TableRow key={`${row.fileName}-${index}`}>
                      <TableCell scope="row">
                        <Link underline="always" component="button" variant="body2" onClick={() => openAttachment(row)}>
                          {row.fileName}
                        </Link>
                      </TableCell>
                      <TableCell>{getFormattedFileSize(row.size)}</TableCell>
                      <TableCell align="center">
                        <AttachmentItemMenuButton
                          attachment={row}
                          handleDownloadFileClick={handleDownloadFileClick}
                          handleDeleteFileClick={handleDeleteFileClick}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              {!props.attachmentsList.length && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
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
      </Box>
    </>
  );
};

export default AttachmentsList;

interface IAttachmentItemMenuButtonProps {
  attachment: IGetProjectAttachment;
  handleDownloadFileClick: (attachment: IGetProjectAttachment) => void;
  handleDeleteFileClick: (attachment: IGetProjectAttachment) => void;
}

const AttachmentItemMenuButton: React.FC<IAttachmentItemMenuButtonProps> = (props) => {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Box my={-1}>
        <Box>
          <IconButton
            size="small"
            aria-label="document actions"
            onClick={handleClick}
            data-testid="attachment-action-menu">
            <Icon path={mdiDotsVertical} size={1} />
          </IconButton>
          <Menu
            className={classes.uploadMenu}
            getContentAnchorEl={null}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button'
            }}>
            <MenuItem
              onClick={() => {
                props.handleDownloadFileClick(props.attachment);
                setAnchorEl(null);
              }}
              data-testid="attachment-action-menu-download">
              <ListItemIcon>
                <Icon path={mdiDownload} size={1} />
              </ListItemIcon>
              Download File
            </MenuItem>
            <MenuItem
              onClick={() => {
                props.handleDeleteFileClick(props.attachment);
                setAnchorEl(null);
              }}
              data-testid="attachment-action-menu-delete">
              <ListItemIcon>
                <Icon path={mdiTrashCanOutline} size={1} />
              </ListItemIcon>
              Delete File
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </>
  );
};
