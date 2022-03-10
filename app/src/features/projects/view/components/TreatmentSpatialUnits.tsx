import { Button, Divider, Grid, Menu, MenuItem, Toolbar } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { mdiMenuDown, mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import FileUpload from 'components/attachments/FileUpload';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { ProjectAttachmentValidExtensions } from 'constants/attachments';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import React, { useState } from 'react';
import { useParams } from 'react-router';

export interface IProjectSpatialUnitsProps {}

/**
 * General information content for a project.
 *
 * @return {*}
 */
const TreatmentSpatialUnits: React.FC<IProjectSpatialUnitsProps> = (props) => {
  const urlParams = useParams();
  const projectId = urlParams['id'];
  const restorationTrackerApi = useRestorationTrackerApi();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const [openImportTreatments, setOpenImportTreatments] = useState(false);

  const handleImportTreatmentClick = () => setOpenImportTreatments(true);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);

  const handleClose = () => setAnchorEl(null);

  const handleUpload = (): IUploadHandler => {
    return (file, cancelToken, handleFileUploadProgress) => {
      return restorationTrackerApi.project.importProjectTreatmentSpatialFile(
        projectId,
        file,
        cancelToken,
        handleFileUploadProgress
      );
    };
  };

  const handleDelete = async () => {
    const res = await restorationTrackerApi.project.deleteProjectTreatmentsByYear(
      projectId,
      99
    )

    console.log(res);
  }

  return (
    <Box>
      <ComponentDialog
        open={openImportTreatments}
        dialogTitle="Upload Treatments"
        onClose={() => {
          setOpenImportTreatments(false);
        }}>
        <FileUpload
          uploadHandler={handleUpload()}
          dropZoneProps={{
            acceptedFileExtensions: ProjectAttachmentValidExtensions.SPATIAL
          }}
        />
      </ComponentDialog>

      <Toolbar>
        <Grid container alignItems="center" justify="space-between">
          <Grid item>
            <Button
              id={'open-layer-menu'}
              data-testid={'open-layer-menu'}
              variant="text"
              color="primary"
              title={'Open Layer Menu'}
              aria-label={'Open Layer Menu'}
              endIcon={<Icon path={mdiMenuDown} size={1} />}
              onClick={handleClick}>
              <strong>Project Layers (function)</strong>
            </Button>
            <Menu
              id="project-menu"
              anchorEl={anchorEl}
              getContentAnchorEl={null}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              open={Boolean(anchorEl)}
              onClose={handleClose}>
              <MenuItem>
                Spatial items list
                <Button
                  id={'upload-spatial'}
                  data-testid={'upload-spatial'}
                  variant="contained"
                  fullWidth
                  color="primary"
                  title={'Delete'}
                  aria-label={'Import Spatial'}
                  startIcon={<Icon path={mdiTrayArrowUp} size={1} />}
                  onClick={handleDelete}>
                  <strong>Import</strong>
                </Button>
              </MenuItem>
              <MenuItem>Spatial items list</MenuItem>
              <Box>
                <Divider></Divider>
                <Box m={1}>Treatment Unit Layers (0)</Box>
                <br></br>
                <Button
                  id={'upload-spatial'}
                  data-testid={'upload-spatial'}
                  variant="contained"
                  fullWidth
                  color="primary"
                  title={'Import Spatial'}
                  aria-label={'Import Spatial'}
                  startIcon={<Icon path={mdiTrayArrowUp} size={1} />}
                  onClick={handleImportTreatmentClick}>
                  <strong>Import</strong>
                </Button>
              </Box>
            </Menu>
          </Grid>
          <Grid item>
            <Button
              id={'upload-spatial'}
              data-testid={'upload-spatial'}
              variant="contained"
              color="primary"
              title={'Import Spatial'}
              aria-label={'Import Spatial'}
              startIcon={<Icon path={mdiTrayArrowUp} size={1} />}
              onClick={handleImportTreatmentClick}>
              <strong>Import</strong>
            </Button>
          </Grid>
        </Grid>
      </Toolbar>
    </Box>
  );
};

export default TreatmentSpatialUnits;
