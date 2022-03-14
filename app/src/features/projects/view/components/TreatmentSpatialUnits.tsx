import { Button, Checkbox, Grid, ListItemIcon, Menu, MenuItem, Toolbar, Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { mdiMenuDown, mdiTrashCanOutline, mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import FileUpload from 'components/attachments/FileUpload';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { ProjectAttachmentValidExtensions } from 'constants/attachments';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetProjectTreatment } from 'interfaces/useProjectApi.interface';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

export interface IProjectSpatialUnitsProps {
  treatmentList: IGetProjectTreatment[];
  getTreatments: (forceFetch: boolean) => void;
}

/**
 * General information content for a project.
 *
 * @return {*}
 */
const TreatmentSpatialUnits: React.FC<IProjectSpatialUnitsProps> = (props) => {
  const { getTreatments } = props;
  const urlParams = useParams();
  const projectId = urlParams['id'];
  const restorationTrackerApi = useRestorationTrackerApi();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const [openImportTreatments, setOpenImportTreatments] = useState(false);

  const [yearList, setYearList] = useState<{ year: number }[]>([]);
  const [selectedState, setSelectedState] = useState({ boundry: true });

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

  const handleDeleteTreatmentsByYear = async (year: number) => {
    await restorationTrackerApi.project.deleteProjectTreatmentsByYear(projectId, year);
    getTreatments(true);
  };

  const handleSelectedSwitch = (selectedName: string | number) => {
    setSelectedState({
      ...selectedState,
      [selectedName]: !selectedState[selectedName]
    });
  };

  useEffect(() => {
    const getYears = async () => {
      const yearsResponse = await restorationTrackerApi.project.getProjectTreatmentsYears(projectId);

      if (!yearsResponse) {
        return;
      }
      setYearList(yearsResponse);

      yearsResponse.forEach((year) => {
        selectedState[String(year.year)] = true;
      });
    };
    if (yearList.length > 0) {
      return;
    }
    getYears();
  }, [projectId, yearList.length, selectedState]);

  return (
    <Box>
      <ComponentDialog
        open={openImportTreatments}
        dialogTitle="Upload Treatments"
        onClose={() => {
          setOpenImportTreatments(false);
          getTreatments(true);
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
              <strong>Project Layers ({yearList?.length + 1})</strong>
            </Button>

            <Menu
              id="treatment-menu"
              anchorEl={anchorEl}
              getContentAnchorEl={null}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              open={Boolean(anchorEl)}
              onClose={handleClose}>
              <Box mt={1} width={300}>
                <MenuItem
                  selected={selectedState.boundry}
                  onClick={() => handleSelectedSwitch('boundry')}
                  disableGutters>
                  <Checkbox checked={selectedState.boundry} />
                  <Box flexGrow={1}>Project Boundary</Box>
                  <ListItemIcon onClick={() => alert("I'm not sure what my job is")}>
                    <Icon path={mdiTrashCanOutline} size={1.25} />
                  </ListItemIcon>
                </MenuItem>

                <Box m={2} p={1}>
                  <Typography>
                    <strong>TREATMENT UNIT LAYERS ({yearList?.length})</strong>
                  </Typography>
                </Box>

                {!yearList && <Typography>No Treatment Years Available</Typography>}
                {yearList.length >= 1 &&
                  yearList.map((year) => {
                    return (
                      <MenuItem
                        key={year.year}
                        selected={selectedState[year.year]}
                        onClick={() => handleSelectedSwitch(year.year)}
                        disableGutters>
                        <Checkbox checked={selectedState[year.year]} />
                        <Box flexGrow={1}>Treatment Year {year.year}</Box>
                        <ListItemIcon onClick={() => handleDeleteTreatmentsByYear(99)}>
                          <Icon path={mdiTrashCanOutline} size={1.25} />
                        </ListItemIcon>
                      </MenuItem>
                    );
                  })}

                <Box m={2}>
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
