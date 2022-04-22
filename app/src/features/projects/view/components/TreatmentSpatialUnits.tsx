import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';
import Alert from '@material-ui/lab/Alert';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import { makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { mdiExport, mdiImport, mdiMenuDown, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import FileUpload from 'components/attachments/FileUpload';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { ProjectAttachmentValidExtensions } from 'constants/attachments';
import { DialogContext } from 'contexts/dialogContext';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetProjectAttachment, TreatmentSearchCriteria } from 'interfaces/useProjectApi.interface';
import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { S3Folder } from 'constants/misc';

const useStyles = makeStyles({
  filterMenu: {
    minWidth: '200px !important',
    borderBottom: '1px solid #ffffff',
    '&:last-child': {
      borderBottom: 'none'
    }
  },
  treatmentFilterList: {
    '& .MuiList-padding': {
      paddingTop: 0,
      paddingBottom: 0
    }
  }
});

export interface IProjectSpatialUnitsProps {
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
  const handleExportTreatmentClick = async () => {
    const treatmentAttachments = await restorationTrackerApi.project.getProjectAttachments(projectId, {
      type: S3Folder.TREATMENTS
    });
    openAttachment(treatmentAttachments.attachmentsList[0]);
  };
  const openAttachment = async (attachment: IGetProjectAttachment) => window.open(attachment.url);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);

  const handleClose = () => setAnchorEl(null);
  const dialogContext = useContext(DialogContext);

  const handleUpload = (): IUploadHandler => {
    return async (file, cancelToken, handleFileUploadProgress) => {
      await restorationTrackerApi.project.deleteProjectTreatments(projectId);

      return restorationTrackerApi.project.importProjectTreatmentSpatialFile(
        projectId,
        file,
        cancelToken,
        handleFileUploadProgress
      );
    };
  };

  const handleDeleteTreatments = async () => {
    await restorationTrackerApi.project.deleteProjectTreatments(projectId);
    getTreatments(true);
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

        if (!yearsResponse.length) {
          setYearList([]);
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

  const defaultYesNoDialogProps = {
    dialogText:
      'Are you sure you want to permanently delete all treatments for this project? This action cannot be undone.',
    open: false,
    onClose: () => dialogContext.setYesNoDialog({ open: false }),
    onNo: () => dialogContext.setYesNoDialog({ open: false }),
    onYes: () => dialogContext.setYesNoDialog({ open: false })
  };

  const showDeleteTreatmentsDialog = () => {
    dialogContext.setYesNoDialog({
      ...defaultYesNoDialogProps,
      dialogTitle: `Delete all treatments?`,
      open: true,
      yesButtonProps: { color: 'secondary' },
      yesButtonLabel: 'Delete',
      noButtonLabel: 'Cancel',
      onYes: () => {
        handleDeleteTreatments();
        dialogContext.setYesNoDialog({ open: false });
      }
    });
  };

  const errorDetailHandler = (errors: (string | object)[]): ReactElement => {
    const items = errors.map((item, index) => {
      if (item['treatmentUnitId']) {
        return (
          <li key={index}>
            TU_ID:{item['treatmentUnitId']}
            <ul>
              {item['errors'].map((itemError: string) => {
                return <li key={itemError}>{itemError}</li>;
              })}
            </ul>
          </li>
        );
      } else {
        return <li key={index}>{JSON.stringify(item)}</li>;
      }
    });
    return <ul>{items}</ul>;
  };

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
        }}
        dialogProps={{ maxWidth: 'md' }}>
        {!!yearList.length && (
          <Box mb={2}>
            <Alert severity="error" variant="filled">
              <Typography variant="body2">
                Treatments have already been imported to this project. Importing a new treatment shapefile will replace
                all existing data.
              </Typography>
            </Alert>
          </Box>
        )}
        <FileUpload
          uploadHandler={handleUpload()}
          dropZoneProps={{
            acceptedFileExtensions: ProjectAttachmentValidExtensions.SPATIAL
          }}
          errorDetailHandler={errorDetailHandler}
        />
      </ComponentDialog>

      <Toolbar disableGutters>
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
          <Typography variant="h2">Restoration Treatments</Typography>

          <Box py={1}>
            <Box display="inline-block" ml={1}>
              <Button
                id={'upload-spatial'}
                data-testid={'upload-spatial'}
                variant="contained"
                color="primary"
                disableElevation
                title="Import treatment shapefile"
                aria-label="import treatment shapefile"
                startIcon={<Icon path={mdiImport} size={1} />}
                onClick={handleImportTreatmentClick}>
                Import Treatments
              </Button>
            </Box>

            {!!yearList.length && (
              <>
                <Box display="inline-block" ml={1}>
                  <Button
                    id={'download-spatial'}
                    data-testid={'download-spatial'}
                    variant="contained"
                    color="default"
                    disableElevation
                    title="Export treatment shapefile"
                    aria-label="export treatment shapefile"
                    startIcon={<Icon path={mdiExport} size={1} />}
                    onClick={handleExportTreatmentClick}>
                    Download Treatments
                  </Button>
                </Box>
                <Box display="inline-block" ml={1}>
                  <Button
                    id={'open-layer-menu'}
                    data-testid={'open-layer-menu'}
                    variant="outlined"
                    color="primary"
                    title={'Filter by year'}
                    aria-label={'filter by year'}
                    endIcon={<Icon path={mdiMenuDown} size={1} />}
                    onClick={handleClick}>
                    Filter Years ({yearList?.length})
                  </Button>
                </Box>
                <Box display="inline-block" ml={1} mr={-2}>
                  <IconButton
                    aria-label="delete all treatments"
                    title="Delete All Treatments"
                    data-testid={'remove-project-treatments-button'}
                    onClick={() => {
                      showDeleteTreatmentsDialog();
                    }}>
                    <Icon path={mdiTrashCanOutline} size={0.9375} />
                  </IconButton>
                </Box>
              </>
            )}

            <Menu
              id="treatment-menu"
              anchorEl={anchorEl}
              getContentAnchorEl={null}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              className={classes.treatmentFilterList}>
              {!yearList.length && (
                <Box flexGrow={1} m={0.5}>
                  <Typography>No Treatment Years Available</Typography>
                </Box>
              )}
              {!!yearList.length &&
                yearList.map((year) => {
                  return (
                    <ListItem
                      dense
                      disableGutters
                      className={classes.filterMenu}
                      key={year.year}
                      selected={selectedSpatialLayer[year.year]}
                      onClick={() => handleSelectedSwitch(year.year)}>
                      <ListItemIcon>
                        <Checkbox checked={selectedSpatialLayer[year.year]} color="primary" />
                      </ListItemIcon>
                      <Box flexGrow={1}>{year.year}</Box>
                    </ListItem>
                  );
                })}
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </Box>
  );
};

export default TreatmentSpatialUnits;
