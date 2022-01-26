import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Select from '@material-ui/core/Select';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { mdiArrowLeft, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import IUCNClassification from 'features/projects/view/components/IUCNClassification';
import Partnerships from 'features/projects/view/components/Partnerships';
import { APIError } from 'hooks/api/useAxios';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import FundingSource from './components/FundingSource';
import GeneralInformation from './components/GeneralInformation';
import Objectives from './components/Objectives';
import ProjectCoordinator from './components/ProjectCoordinator';
import ProjectPermits from './components/ProjectPermits';
import { DialogContext } from 'contexts/dialogContext';
import { DeleteProjectI18N } from 'constants/i18n';
import { ProjectStatusType } from 'constants/misc';
import moment from 'moment';
import Chip from '@material-ui/core/Chip';
import clsx from 'clsx';

export interface IProjectDetailsProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    projectDetailDrawer: {
      '& .MuiDrawer-paper': {
        position: 'relative',
        overflow: 'hidden'
      }
    },
    projectDetailMain: {
      background: '#ffffff'
    },
    projectTitle: {
      margin: 0,
      fontSize: '1.5rem',
      fontWeight: 400
    },
    contentTitle: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      fontSize: '2rem'
    },
    projectMetadata: {
      overflowY: 'auto',
      backgroundColor: '#f5f5f5',

      // Metadata Definition Lists
      '& dl div + div': {
        marginTop: theme.spacing(0.25)
      },
      '& dd, dt': {
        display: 'inline-block',
        width: '50%'
      },

      '& h3': {
        // textTransform: 'uppercase',
        fontWeight: 700
      },
      '& section + hr': {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3)
      }
    },
    projectContactList: {
      marginLeft: 0,
      marginRight: 0,
      padding: 0,
      listStyleType: 'none',
      '& li + li': {
        marginTop: theme.spacing(1.5)
      }
    },
    treatmentsContainer: {
      display: 'none'
    },
    actionButton: {
      minWidth: '6rem',
      '& + button': {
        marginLeft: '0.5rem'
      }
    },
    linkButton: {
      textAlign: 'left'
    },
    filtersBox: {
      background: '#f7f8fa'
    },
    chip: {
      color: 'white'
    },
    chipActive: {
      backgroundColor: theme.palette.success.main
    },
    chipPublishedCompleted: {
      backgroundColor: theme.palette.success.main
    },
    chipUnpublished: {
      backgroundColor: theme.palette.text.disabled
    },
    chipDraft: {
      backgroundColor: theme.palette.info.main
    },
    chipPriority: {
      backgroundColor: theme.palette.info.dark
    }
  })
);

/**
 * Project details content for a project.
 *
 * @return {*}
 */
const RestoProjectDetailsPage: React.FC<IProjectDetailsProps> = (props) => {
  const { projectForViewData, refresh } = props;
  const classes = useStyles();
  const [projectWithDetails, setProjectWithDetails] = useState<IGetProjectForViewResponse | null>(null);

  // Funding Source Dialog Prototype
  const [openDialog, setOpenDialog] = React.useState(false);

  const fundingSourceDialogOpen = () => {
    setOpenDialog(true);
  };

  const fundingSourceDialogClose = () => {
    setOpenDialog(false);
  };

  // Radio Group Prototype
  const [reconValue, setReconValue] = React.useState('No');
  const handleReconValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReconValue((event.target as HTMLInputElement).value);
  };

  // Treatments
  const [treatmentValue, setTreatmentValue] = React.useState('No');
  const handleTreatmentValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTreatmentValue((event.target as HTMLInputElement).value);
  };

  // Treatments
  const [treatmentImplementedValue, setTreatmentImplementedValue] = React.useState('No');
  const handleTreatmentImplementedValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTreatmentImplementedValue((event.target as HTMLInputElement).value);
  };

  const urlParams = useParams();

  const restorationTrackerApi = useRestorationTrackerApi();

  const [isLoadingProject, setIsLoadingProject] = useState(false);

  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();
  const history = useHistory();
  const dialogContext = useContext(DialogContext);

  const { keycloakWrapper } = useContext(AuthStateContext);
  const defaultYesNoDialogProps = {
    dialogTitle: DeleteProjectI18N.deleteTitle,
    dialogText: DeleteProjectI18N.deleteText,
    open: false,
    onClose: () => dialogContext.setYesNoDialog({ open: false }),
    onNo: () => dialogContext.setYesNoDialog({ open: false }),
    onYes: () => dialogContext.setYesNoDialog({ open: false })
  };

  useEffect(() => {
    const getCodes = async () => {
      const codesResponse = await restorationTrackerApi.codes.getAllCodeSets();

      if (!codesResponse) {
        // TODO error handling/messaging
        return;
      }

      setCodes(codesResponse);
    };

    if (!isLoadingCodes && !codes) {
      getCodes();
      setIsLoadingCodes(true);
    }
  }, [urlParams, restorationTrackerApi.codes, isLoadingCodes, codes]);

  const getProject = useCallback(async () => {
    const projectWithDetailsResponse = await restorationTrackerApi.project.getProjectById(urlParams['id']);

    if (!projectWithDetailsResponse) {
      // TODO error handling/messaging
      return;
    }

    setProjectWithDetails(projectWithDetailsResponse);
  }, [restorationTrackerApi.project, urlParams]);

  useEffect(() => {
    if (!isLoadingProject && !projectWithDetails) {
      getProject();
      setIsLoadingProject(true);
    }
  }, [isLoadingProject, projectWithDetails, getProject]);

  if (!codes || !projectWithDetails) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const end_date = projectForViewData.project.end_date;
  const completion_status =
    (end_date && moment(end_date).endOf('day').isBefore(moment()) && ProjectStatusType.COMPLETED) ||
    ProjectStatusType.ACTIVE;

  const priority_status = ProjectStatusType.PRIORITY;

  const getChipIcon = (status_name: string) => {
    let chipLabel;
    let chipStatusClass;

    if (ProjectStatusType.ACTIVE === status_name) {
      chipLabel = 'Active';
      chipStatusClass = classes.chipActive;
    } else if (ProjectStatusType.COMPLETED === status_name) {
      chipLabel = 'Completed';
      chipStatusClass = classes.chipPublishedCompleted;
    } else if (ProjectStatusType.DRAFT === status_name) {
      chipLabel = 'Draft';
      chipStatusClass = classes.chipDraft;
    } else if (ProjectStatusType.PRIORITY === status_name) {
      chipLabel = 'Priority';
      chipStatusClass = classes.chipPriority;
    }

    return <Chip size="small" className={clsx(classes.chip, chipStatusClass)} label={chipLabel} />;
  };
  const showDeleteErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({ ...deleteErrorDialogProps, ...textDialogProps, open: true });
  };

  const deleteErrorDialogProps = {
    dialogTitle: DeleteProjectI18N.deleteErrorTitle,
    dialogText: DeleteProjectI18N.deleteErrorText,
    open: false,
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  const showDeleteProjectDialog = () => {
    dialogContext.setYesNoDialog({
      ...defaultYesNoDialogProps,
      open: true,
      onYes: () => {
        deleteProject();
        dialogContext.setYesNoDialog({ open: false });
      }
    });
  };

  const deleteProject = async () => {
    if (!projectWithDetails) {
      return;
    }

    try {
      const response = await restorationTrackerApi.project.deleteProject(projectWithDetails.id);

      if (!response) {
        showDeleteErrorDialog({ open: true });
        return;
      }

      history.push(`/admin/projects`);
    } catch (error) {
      const apiError = error as APIError;
      showDeleteErrorDialog({ dialogText: apiError.message, open: true });
      return error;
    }
  };

  // Show delete button if you are a system admin or a project admin
  const showDeleteProjectButton = keycloakWrapper?.hasSystemRole([
    SYSTEM_ROLE.SYSTEM_ADMIN,
    SYSTEM_ROLE.PROJECT_CREATOR
  ]);
  // Enable delete button if you a system admin OR a project admin and the project is not published
  const enableDeleteProjectButton =
    keycloakWrapper?.hasSystemRole([SYSTEM_ROLE.SYSTEM_ADMIN]) ||
    (keycloakWrapper?.hasSystemRole([SYSTEM_ROLE.PROJECT_CREATOR]) && !projectWithDetails.project.publish_date);

  return (
    <>
      <Box display="flex" position="absolute" width="100%" height="100%" overflow="hidden">
        <Drawer variant="permanent" className={classes.projectDetailDrawer}>
          <Box display="flex" flexDirection="column" overflow="hidden" width="30rem" height="100%">
            <Box flex="0 auto" p={3}>
              <Box mb={2}>
                <Button href="/projects" size="small" startIcon={<Icon path={mdiArrowLeft} size={0.875}></Icon>}>
                  Back to Projects
                </Button>
              </Box>
              <h1 className={classes.projectTitle}>
                <b>Project -</b> {projectForViewData.project.project_name}
                <Box display="flex">
                  <Box mb={4}>
                    {getChipIcon(priority_status)}
                    {getChipIcon(completion_status)}
                  </Box>
                  <Box>
                    <Button
                      variant="outlined"
                      disableElevation
                      className={classes.actionButton}
                      data-testid="manage-project-team-button"
                      aria-label="Manage Project Team"
                      onClick={() => history.push('users')}>
                      Manage Team
                    </Button>
                    {showDeleteProjectButton && (
                      <Tooltip
                        arrow
                        color="secondary"
                        title={!enableDeleteProjectButton ? 'Cannot delete a published project' : ''}>
                        <>
                          <IconButton
                            data-testid="delete-project-button"
                            onClick={showDeleteProjectDialog}
                            disabled={!enableDeleteProjectButton}>
                            <Icon path={mdiTrashCanOutline} size={1} />
                          </IconButton>
                        </>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              </h1>
            </Box>

            {/* Project Metadata */}
            <Box flex="1 auto" p={3} className={classes.projectMetadata}>
              <Box component="section">
                <Box component="section" mt={3}>
                  <Objectives projectForViewData={projectForViewData} refresh={refresh} />
                </Box>
              </Box>

              <Divider></Divider>

              <Box component="section">
                <Box component="section" mt={3}>
                  <GeneralInformation projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
                </Box>
              </Box>

              <Divider></Divider>

              <Box component="section">
                <Box component="section" mt={3}>
                  <ProjectCoordinator projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
                </Box>
              </Box>

              <Divider></Divider>

              <Box component="section">
                <Box component="section" mt={3}>
                  <IUCNClassification projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
                </Box>
              </Box>

              <Divider></Divider>

              <Box component="section">
                <Box component="section" mt={3}>
                  <ProjectPermits projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
                </Box>
              </Box>

              <Divider></Divider>

              <Box component="section">
                <Box component="section" mt={3}>
                  <FundingSource projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
                </Box>
              </Box>
              <Divider></Divider>

              <Box component="section">
                <Box component="section" mt={3}>
                  <Partnerships projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
                </Box>
              </Box>
            </Box>
          </Box>
        </Drawer>

        <Box
          display="flex"
          flex="1 1 auto"
          alignItems="center"
          justifyContent="center"
          className={classes.projectDetailMain}>
          <div>Project Boundary Map</div>

          <Container maxWidth="xl" className={classes.treatmentsContainer}>
            <Box p={3}>
              <Box mb={1} display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h2" className={classes.contentTitle}>
                  Treatment Units
                </Typography>
                <Button size="large" variant="contained" color="primary" onClick={fundingSourceDialogOpen}>
                  Add Treatment Unit
                </Button>
              </Box>
              <Box mb={5}>
                <Typography variant="body1" color="textSecondary">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                  dolore magna aliqua.
                </Typography>
              </Box>
              <Box>
                <Paper variant="outlined">
                  <Box p={3}></Box>
                </Paper>
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>

      <Dialog open={openDialog} fullWidth aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Add Treatment Unit</DialogTitle>
        <DialogContent>
          <Box py={1}>
            <Box mb={4}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth variant="outlined" label="ID"></TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="linear-feature-type">Linear Feature Type</InputLabel>
                    <Select labelId="linear-feature-type" label="Linear Feature Type" id="linear-feature-type-select">
                      <MenuItem value={1}>Pipeline</MenuItem>
                      <MenuItem value={2}>Railway</MenuItem>
                      <MenuItem value={3}>Roads</MenuItem>
                      <MenuItem value={4}>Seismic Lines</MenuItem>
                      <MenuItem value={5}>Trail</MenuItem>
                      <MenuItem value={6}>Transmission Line</MenuItem>
                      <MenuItem value={7}>Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Description of Treatment Unit"
                    multiline
                    rows={3}></TextField>
                </Grid>
              </Grid>
            </Box>
            <Box mb={3}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Was reconnaissance conducted for this treatment unit?</FormLabel>
                <Box mt={2}>
                  <RadioGroup aria-label="gender" name="priorityArea" value={reconValue} onChange={handleReconValue}>
                    <FormControlLabel value="priorityAreaYes" control={<Radio color="primary" />} label="Yes" />
                    <FormControlLabel value="priorityAreaNo" control={<Radio color="primary" />} label="No" />
                  </RadioGroup>
                </Box>
              </FormControl>
            </Box>
            <Box mb={3}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Leave treatment unit for natural recovery?</FormLabel>
                <Box mt={2}>
                  <RadioGroup
                    aria-label="gender"
                    name="priorityArea"
                    value={treatmentValue}
                    onChange={handleTreatmentValue}>
                    <FormControlLabel
                      value="treatmentNaturalRecoveryYes"
                      control={<Radio color="primary" />}
                      label="Yes"
                    />
                    <FormControlLabel
                      value="treatmentNaturalRecoveryNo"
                      control={<Radio color="primary" />}
                      label="No"
                    />
                  </RadioGroup>
                </Box>
              </FormControl>
            </Box>

            <Box mb={3}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Was treatment implemented?</FormLabel>
                <Box mt={2}>
                  <RadioGroup
                    aria-label="gender"
                    name="treatmentImplemented"
                    value={treatmentImplementedValue}
                    onChange={handleTreatmentImplementedValue}>
                    <FormControlLabel value="treatmentImplementedYes" control={<Radio color="primary" />} label="Yes" />
                    <FormControlLabel value="treatmentImplementedNo" control={<Radio color="primary" />} label="No" />
                  </RadioGroup>
                </Box>
              </FormControl>
            </Box>

            {treatmentImplementedValue === 'treatmentImplementedYes' && (
              <Box>
                <Box mb={2}>
                  <Typography variant="body1" color="textSecondary">
                    Specify treatments applied to this unit
                  </Typography>
                </Box>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="treatments-label">Treatments</InputLabel>
                  <Select labelId="treatments-label" label="Treatments" id="treatment-type-select">
                    <MenuItem value={1}>Debris rollback</MenuItem>
                    <MenuItem value={2}>Hummock placing</MenuItem>
                    <MenuItem value={3}>Screef</MenuItem>
                    <MenuItem value={4}>Seeding</MenuItem>
                    <MenuItem value={5}>Seedling Planting</MenuItem>
                    <MenuItem value={6}>Tree Bending</MenuItem>
                    <MenuItem value={7}>Tree Felling</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={fundingSourceDialogClose}>
            Add
          </Button>
          <Button variant="outlined" color="primary" onClick={fundingSourceDialogClose}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RestoProjectDetailsPage;
