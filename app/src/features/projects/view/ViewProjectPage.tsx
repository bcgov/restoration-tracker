import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import CircularProgress from '@material-ui/core/CircularProgress';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import { mdiAccountMultipleOutline, mdiArrowLeft, mdiCogOutline, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import clsx from 'clsx';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { RoleGuard } from 'components/security/Guards';
import { DeleteProjectI18N } from 'constants/i18n';
import { ProjectStatusType } from 'constants/misc';
import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import { DialogContext } from 'contexts/dialogContext';
import LocationBoundary from 'features/projects/view/components/LocationBoundary';
import { APIError } from 'hooks/api/useAxios';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import {
  IGetProjectAttachment,
  IGetProjectForViewResponse,
  IGetProjectTreatment,
  TreatmentSearchCriteria
} from 'interfaces/useProjectApi.interface';
import moment from 'moment';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import TreatmentList from './components/TreatmentList';
import TreatmentSpatialUnits from './components/TreatmentSpatialUnits';
import ProjectAttachments from './ProjectAttachments';
import ProjectDetailsPage from './ProjectDetailsPage';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    projectDetailDrawer: {
      '& .MuiDrawer-paper': {
        position: 'relative',
        overflow: 'hidden',
        width: '30rem'
      }
    },
    projectTitle: {
      margin: 0,
      fontSize: '1.5rem',
      fontWeight: 400
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
    },
    chipNotAPriority: {
      backgroundColor: theme.palette.text.disabled
    },
    tabs: {
      flexDirection: 'row',
      '& .MuiTabs-indicator': {
        backgroundColor: '#1a5a96'
      },
      '& .MuiTab-root.Mui-selected': {
        color: '#1a5a96'
      }
    },
    tabPanel: {
      overflowY: 'auto'
    },
    tabIcon: {
      verticalAlign: 'middle'
    },
    projectLocationBoundary: {
      background: '#ffffff'
    }
  })
);

/**
 * Page to display a single Project.
 *
 * @return {*}
 */
const ViewProjectPage: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = React.useState('project_details');
  const classes = useStyles();
  const history = useHistory();
  const urlParams = useParams();
  const projectId = urlParams['id'];
  const dialogContext = useContext(DialogContext);

  const restorationTrackerApi = useRestorationTrackerApi();

  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [projectWithDetails, setProjectWithDetails] = useState<IGetProjectForViewResponse | null>(null);
  const [attachmentsList, setAttachmentsList] = useState<IGetProjectAttachment[]>([]);
  const [treatmentList, setTreatmentList] = useState<IGetProjectTreatment[]>([]);

  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();

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

  const getAttachments = useCallback(
    async (forceFetch: boolean) => {
      if (attachmentsList.length && !forceFetch) return;

      try {
        const response = await restorationTrackerApi.project.getProjectAttachments(projectId);

        if (!response?.attachmentsList) return;

        setAttachmentsList([...response.attachmentsList]);
      } catch (error) {
        return error;
      }
    },
    [restorationTrackerApi.project, projectId, attachmentsList.length]
  );

  const getTreatments = useCallback(
    async (forceFetch: boolean, selectedYears?: TreatmentSearchCriteria) => {
      if (treatmentList.length && !forceFetch) return;

      try {
        const response = await restorationTrackerApi.project.getProjectTreatments(projectId, selectedYears);

        if (!response?.treatmentList) return;

        setTreatmentList([...response.treatmentList]);
      } catch (error) {
        return error;
      }
    },
    [restorationTrackerApi.project, projectId, treatmentList.length]
  );

  useEffect(() => {
    if (!isLoadingProject && !projectWithDetails) {
      getProject();
      getAttachments(false);
      getTreatments(false);
      setIsLoadingProject(true);
    }
  }, [isLoadingProject, projectWithDetails, getProject, getAttachments, getTreatments]);
  if (!codes || !projectWithDetails) {
    return <CircularProgress className="pageProgress" size={40} data-testid="loading_spinner" />;
  }

  const defaultYesNoDialogProps = {
    dialogTitle: DeleteProjectI18N.deleteTitle,
    dialogText: DeleteProjectI18N.deleteText,
    open: false,
    onClose: () => dialogContext.setYesNoDialog({ open: false }),
    onNo: () => dialogContext.setYesNoDialog({ open: false }),
    onYes: () => dialogContext.setYesNoDialog({ open: false })
  };

  const end_date = projectWithDetails.project.end_date;
  const completion_status =
    (end_date && moment(end_date).endOf('day').isBefore(moment()) && ProjectStatusType.COMPLETED) ||
    ProjectStatusType.ACTIVE;
  const priority_status = ProjectStatusType.NOT_A_PRIORITY;

  const TabPanel = (props: { children?: React.ReactNode; index: string; value: string }) => {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        className={classes.tabPanel}
        {...other}>
        {value === index && children}
      </div>
    );
  };

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
    } else if (ProjectStatusType.NOT_A_PRIORITY === status_name) {
      chipLabel = 'Priority';
      chipStatusClass = classes.chipNotAPriority;
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
      const response = await restorationTrackerApi.project.deleteProject(projectWithDetails.project.project_id);

      if (!response) {
        showDeleteErrorDialog({ open: true });
        return;
      }

      history.push('/admin/user/projects');
    } catch (error) {
      const apiError = error as APIError;
      showDeleteErrorDialog({ dialogText: apiError.message, open: true });
      return error;
    }
  };

  // Project Actions Menu
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);

  const handleClose = () => setAnchorEl(null);

  const handleTabChange = (_: any, newValue: string) => setTabValue(newValue);

  return (
    <Box
      display="flex"
      position="absolute"
      width="100%"
      height="100%"
      overflow="hidden"
      data-testid="view_project_page_component">
      {/* Details Container */}
      <Drawer variant="permanent" className={classes.projectDetailDrawer}>
        <Box display="flex" flexDirection="column" height="100%">
          <Box flex="0 auto" p={3}>
            <Box mb={2}>
              <Button
                component={Link}
                onClick={() => history.push('/admin/user/projects')}
                size="small"
                startIcon={<Icon path={mdiArrowLeft} size={0.8375} />}>
                Back to Projects
              </Button>
            </Box>
            <Box display="flex" flexDirection={'row'}>
              <Box component="h1" flex="1 1 auto" className={classes.projectTitle}>
                <b>Project -</b> {projectWithDetails.project.project_name}
              </Box>
              <RoleGuard
                validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}
                validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR]}>
                <Box flex="0 0 auto" mt={'-4px'} mr={-1}>
                  <IconButton aria-controls="project-menu" aria-haspopup="true" onClick={handleClick}>
                    <Icon path={mdiCogOutline} size={0.9375} />
                  </IconButton>
                  <Menu
                    id="project-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleClose}>
                    <MenuItem onClick={() => history.push('users')}>
                      <ListItemIcon>
                        <Icon path={mdiAccountMultipleOutline} size={0.9375} />
                      </ListItemIcon>
                      Manage Project Team
                    </MenuItem>
                    <MenuItem onClick={() => history.push(`/admin/projects/${urlParams['id']}/edit`)}>
                      <ListItemIcon>
                        <Icon path={mdiPencilOutline} size={0.9375} />
                      </ListItemIcon>
                      Edit Project Details
                    </MenuItem>
                    <RoleGuard
                      validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}
                      validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD]}>
                      <MenuItem onClick={showDeleteProjectDialog}>
                        <ListItemIcon>
                          <Icon path={mdiTrashCanOutline} size={0.9375} />
                        </ListItemIcon>
                        Delete Project
                      </MenuItem>
                    </RoleGuard>
                  </Menu>
                </Box>
              </RoleGuard>
            </Box>

            <Box display="flex" flexDirection={'row'}>
              <Box mr={0.5}>{getChipIcon(priority_status)}</Box>
              <Box>{getChipIcon(completion_status)}</Box>
            </Box>
          </Box>

          <Box>
            <Tabs
              className={classes.tabs}
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              aria-label="Project Navigation">
              <Tab label="Project Details" value="project_details" />
              <Tab label="Documents" value="project_documents" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index="project_details">
            <ProjectDetailsPage projectForViewData={projectWithDetails} codes={codes} refresh={getProject} />
          </TabPanel>
          <TabPanel value={tabValue} index="project_documents">
            <ProjectAttachments attachmentsList={attachmentsList} getAttachments={getAttachments} />
          </TabPanel>
        </Box>
      </Drawer>

      {/* Map Container */}
      <Box display="flex" flex="1 1 auto" flexDirection="column" className={classes.projectLocationBoundary}>
        <Box>
          <TreatmentSpatialUnits
            treatmentList={treatmentList}
            getTreatments={getTreatments}
            getAttachments={getAttachments}
          />
        </Box>

        <Box flex="1 1 auto">
          <LocationBoundary
            projectForViewData={projectWithDetails}
            treatmentList={treatmentList}
            codes={codes}
            refresh={getProject}
          />
        </Box>

        <Box flex="0 0 auto" height="250px">
          <TreatmentList treatmentList={treatmentList} getTreatments={getTreatments} refresh={getProject} />
        </Box>
      </Box>
    </Box>
  );
};

export default ViewProjectPage;
