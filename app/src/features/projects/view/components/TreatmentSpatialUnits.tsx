import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { mdiMenuDown, mdiTrashCanOutline, mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import FileUpload from 'components/attachments/FileUpload';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { ProjectAttachmentValidExtensions } from 'constants/attachments';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetProjectTreatment, TreatmentSearchCriteria } from 'interfaces/useProjectApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  filterMenu: {
    minWidth: '200px !important',
    padding: 0,
    borderBottom: '1px solid #ffffff',
    '&:last-child': {
      borderBottom: 'none'
    }
  }
});

export interface IProjectSpatialUnitsProps {
  treatmentList: IGetProjectTreatment[];
  getTreatments: (forceFetch: boolean, selectedYears?: TreatmentSearchCriteria) => void;
  getAttachments: (forceFetch: boolean) => void;
}

/**
 * General information content for a project.
 *
 * @return {*}
 */
const TreatmentSpatialUnits: React.FC<IProjectSpatialUnitsProps> = (props) => {
  const classes = useStyles();
  const { getTreatments, getAttachments } = props;
  const urlParams = useParams();
  const projectId = urlParams['id'];
  const restorationTrackerApi = useRestorationTrackerApi();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const [openImportTreatments, setOpenImportTreatments] = useState(false);

  const [isTreatmentLoading, setIsTreatmentLoading] = useState(false);

  const [yearList, setYearList] = useState<{ year: number }[]>([]);
  const [selectedSpatialLayer, setSelectedSpatialLayer] = useState({ boundary: true });

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
    handleSelectedSwitch(year);
    getTreatmentYears(true);
  };

  const handleSelectedSwitch = (selectedName: string | number) => {
    setSelectedSpatialLayer({
      ...selectedSpatialLayer,
      [selectedName]: !selectedSpatialLayer[selectedName]
    });

    const selectedArray: TreatmentSearchCriteria = { years: [] };

    Object.keys(selectedSpatialLayer).forEach((key) => {
      //handles async discrepancies for selected years
      if ((selectedSpatialLayer[key] && key !== selectedName) || (key === selectedName && !selectedSpatialLayer[key])) {
        selectedArray.years.push(key);
      }
    });

    getTreatments(true, selectedArray);
  };

  const getTreatmentYears = useCallback(
    async (forceFetch: boolean) => {
      if (yearList.length && !forceFetch) {
        return;
      }

      try {
        const yearsResponse = await restorationTrackerApi.project.getProjectTreatmentsYears(projectId);

        if (!yearsResponse) {
          return;
        }

        const sortedYearsResponse = [...yearsResponse].sort(function (a, b) {
          return a.year - b.year;
        });

        setYearList(sortedYearsResponse);

        sortedYearsResponse.forEach((year) => {
          selectedSpatialLayer[String(year.year)] = true;
        });
      } catch (error) {
        return error;
      }
    },
    [restorationTrackerApi.project, projectId, yearList.length, selectedSpatialLayer]
  );

  useEffect(() => {
    if (!isTreatmentLoading && !yearList.length) {
      getTreatmentYears(true);
      setIsTreatmentLoading(true);
    }
  }, [getTreatmentYears, yearList.length, isTreatmentLoading]);

  return (
    <Box>
      <ComponentDialog
        open={openImportTreatments}
        dialogTitle="Import Treatments"
        onClose={() => {
          setOpenImportTreatments(false);
          getTreatments(true);
          getAttachments(true);
          getTreatmentYears(true);
        }}>
        <FileUpload
          uploadHandler={handleUpload()}
          dropZoneProps={{
            acceptedFileExtensions: ProjectAttachmentValidExtensions.SPATIAL
          }}
        />
      </ComponentDialog>

      <Toolbar disableGutters>
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
          <Typography variant="h2">Restoration Treatments</Typography>

          <Box>
            
            <Button
              id={'open-layer-menu'}
              data-testid={'open-layer-menu'}
              variant="outlined"
              color="primary"
              title={'Filter Treaatments'}
              aria-label={'Filter Treatments'}
              endIcon={<Icon path={mdiMenuDown} size={1} />}
              onClick={handleClick}>
              Filter Treatment Years ({yearList?.length})
            </Button>

            <Menu
              id="treatment-menu"
              anchorEl={anchorEl}
              getContentAnchorEl={null}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              open={Boolean(anchorEl)}
              onClose={handleClose}>

                {!yearList && <Typography>No Treatment Years Available</Typography>}
                {yearList.length >= 1 &&
                  yearList.map((year) => {
                    return (
                      <MenuItem
                        dense
                        disableGutters
                        className={classes.filterMenu}
                        key={year.year}
                        selected={selectedSpatialLayer[year.year]}
                        onClick={() => handleSelectedSwitch(year.year)}>
                        <Checkbox checked={selectedSpatialLayer[year.year]} color="primary" />
                        <Box flexGrow={1} ml={0.5}>{year.year}</Box>
                        <ListItemIcon
                          aria-labelledby='delete treatment year data'
                          title="Delete treatment year data"
                          onClick={() => handleDeleteTreatmentsByYear(year.year)}
                        >
                          <Icon path={mdiTrashCanOutline} size={0.9375} />
                        </ListItemIcon>
                      </MenuItem>
                    );
                  })}

            </Menu>

            <Box display="inline-block" ml={1}>
              <Button
                id={'upload-spatial'}
                data-testid={'upload-spatial'}
                variant="outlined"
                color="primary"
                title={'Import Spatial'}
                aria-label={'Import Spatial'}
                startIcon={<Icon path={mdiTrayArrowUp} size={1} />}
                onClick={handleImportTreatmentClick}>
                Import Treatments
              </Button>
            </Box>

          </Box>
        </Box>
      </Toolbar>
    </Box>
  );
};

export default TreatmentSpatialUnits;
