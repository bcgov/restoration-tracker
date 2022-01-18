import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import ArrowBack from '@material-ui/icons/ArrowBack';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { CreateProjectDraftI18N, CreateProjectI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { ProjectCoordinatorInitialValues } from 'features/projects/components/ProjectCoordinatorForm';
import { ProjectDetailsFormInitialValues } from 'features/projects/components/ProjectDetailsForm';
import ProjectDraftForm, {
  IProjectDraftForm,
  ProjectDraftFormYupSchema
} from 'features/projects/components/ProjectDraftForm';
import { ProjectFundingFormInitialValues } from 'features/projects/components/ProjectFundingForm';
import { ProjectIUCNFormInitialValues } from 'features/projects/components/ProjectIUCNForm';
import ProjectLocationForm, {
  ProjectLocationFormInitialValues
} from 'features/projects/components/ProjectLocationForm';
import { ProjectObjectivesFormInitialValues } from 'features/projects/components/ProjectObjectivesForm';
import { ProjectPartnershipsFormInitialValues } from 'features/projects/components/ProjectPartnershipsForm';
import ProjectPermitForm, { ProjectPermitFormInitialValues } from 'features/projects/components/ProjectPermitForm';
import { Formik, FormikProps } from 'formik';
import History from 'history';
import { APIError } from 'hooks/api/useAxios';
import { useQuery } from 'hooks/useQuery';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { ICreateProjectRequest } from 'interfaces/useProjectApi.interface';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { Prompt } from 'react-router-dom';
import { getFormattedDate } from 'utils/Utils';

const useStyles = makeStyles((theme: Theme) => ({
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  },
  formButtons: {
    '& button': {
      margin: theme.spacing(0.5)
    }
  },
  breadCrumbLink: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  breadCrumbLinkIcon: {
    marginRight: '0.25rem'
  }
}));

/**
 * Page for creating a new project.
 *
 * @return {*}
 */
const CreateProjectPage: React.FC = () => {
  const classes = useStyles();

  const history = useHistory();

  const restorationTrackerApi = useRestorationTrackerApi();

  const queryParams = useQuery();

  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const [hasLoadedDraftData, setHasLoadedDraftData] = useState(!queryParams.draftId);

  // Reference to pass to the formik component in order to access its state at any time
  // Used by the draft logic to fetch the values of a step form that has not been validated/completed
  const formikRef = useRef<FormikProps<any>>(null);

  // Ability to bypass showing the 'Are you sure you want to cancel' dialog
  const [enableCancelCheck, setEnableCancelCheck] = useState(true);

  const dialogContext = useContext(DialogContext);

  const defaultCancelDialogProps = {
    dialogTitle: CreateProjectI18N.cancelTitle,
    dialogText: CreateProjectI18N.cancelText,
    open: false,
    onClose: () => {
      dialogContext.setYesNoDialog({ open: false });
    },
    onNo: () => {
      dialogContext.setYesNoDialog({ open: false });
    },
    onYes: () => {
      dialogContext.setYesNoDialog({ open: false });
      history.push('/admin/projects');
    }
  };

  const defaultErrorDialogProps = {
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  // Whether or not to show the 'Save as draft' dialog
  const [openDraftDialog, setOpenDraftDialog] = useState(false);

  const [draft, setDraft] = useState({ id: 0, date: '' });
  const [initialProjectFieldData, setInitialProjectFieldData] = useState<ICreateProjectRequest>({
    coordinator: ProjectCoordinatorInitialValues,
    permit: ProjectPermitFormInitialValues,
    project: ProjectDetailsFormInitialValues,
    objectives: ProjectObjectivesFormInitialValues,
    location: ProjectLocationFormInitialValues,
    iucn: ProjectIUCNFormInitialValues,
    funding: ProjectFundingFormInitialValues,
    partnerships: ProjectPartnershipsFormInitialValues
  });

  // Get draft project fields if draft id exists
  useEffect(() => {
    const getDraftProjectFields = async () => {
      const response = await restorationTrackerApi.draft.getDraft(queryParams.draftId);

      setHasLoadedDraftData(true);

      if (!response || !response.data) {
        return;
      }

      setInitialProjectFieldData(response.data);
    };

    if (hasLoadedDraftData) {
      return;
    }

    getDraftProjectFields();
  }, [restorationTrackerApi.draft, hasLoadedDraftData, queryParams.draftId]);

  // Get code sets
  // TODO refine this call to only fetch code sets this form cares about? Or introduce caching so multiple calls is still fast?
  useEffect(() => {
    const getAllCodeSets = async () => {
      const response = await restorationTrackerApi.codes.getAllCodeSets();

      // TODO error handling/user messaging - Cant create a project if required code sets fail to fetch

      setCodes(() => {
        setIsLoadingCodes(false);
        return response;
      });
    };

    if (!isLoadingCodes && !codes) {
      getAllCodeSets();
      setIsLoadingCodes(true);
    }
  }, [restorationTrackerApi, isLoadingCodes, codes]);

  const handleCancel = () => {
    dialogContext.setYesNoDialog(defaultCancelDialogProps);
    history.push('/admin/projects');
  };

  const handleSubmitDraft = async (values: IProjectDraftForm) => {
    try {
      let response;

      // Get the form data for all steps
      // Fetch the data from the formikRef for whichever step is the active step
      // Why? WIP changes to the active step will not yet be updated into its respective stepForms[n].stepInitialValues
      const draftFormData = {
        // TODO
      };

      const draftId = Number(queryParams.draftId) || draft?.id;

      if (draftId) {
        response = await restorationTrackerApi.draft.updateDraft(draftId, values.draft_name, draftFormData);
      } else {
        response = await restorationTrackerApi.draft.createDraft(values.draft_name, draftFormData);
      }

      setOpenDraftDialog(false);

      if (!response?.id) {
        showCreateErrorDialog({
          dialogError: 'The response from the server was null, or did not contain a draft project ID.'
        });

        return;
      }

      setDraft({ id: response.id, date: response.date });
      setEnableCancelCheck(false);

      history.push(`/admin/projects`);
    } catch (error) {
      setOpenDraftDialog(false);

      const apiError = error as APIError;
      showDraftErrorDialog({
        dialogError: apiError?.message,
        dialogErrorDetails: apiError?.errors
      });
    }
  };

  /**
   * Handle project creation.
   */
  const handleProjectCreation = async () => {
    try {
      const response = await restorationTrackerApi.project.createProject(initialProjectFieldData);

      if (!response?.id) {
        showCreateErrorDialog({
          dialogError: 'The response from the server was null, or did not contain a project ID.'
        });
        return;
      }

      await deleteDraft();

      setEnableCancelCheck(false);

      history.push(`/admin/projects/${response.id}`);
    } catch (error) {
      showCreateErrorDialog({
        dialogTitle: 'Error Creating Project',
        dialogError: (error as APIError)?.message,
        dialogErrorDetails: (error as APIError)?.errors
      });
    }
  };

  /**
   * Deletes the draft record used when creating this project, if one exists.
   *
   * @param {number} draftId
   * @returns {*}
   */
  const deleteDraft = async () => {
    const draftId = Number(queryParams.draftId);

    if (!draftId) {
      return;
    }

    try {
      await restorationTrackerApi.draft.deleteDraft(draftId);
    } catch (error) {
      return error;
    }
  };

  const showDraftErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: CreateProjectDraftI18N.draftErrorTitle,
      dialogText: CreateProjectDraftI18N.draftErrorText,
      ...defaultErrorDialogProps,
      ...textDialogProps,
      open: true
    });
  };

  const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: CreateProjectI18N.createErrorTitle,
      dialogText: CreateProjectI18N.createErrorText,
      ...defaultErrorDialogProps,
      ...textDialogProps,
      open: true
    });
  };

  if (!codes) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  /**
   * Intercepts all navigation attempts (when used with a `Prompt`).
   *
   * Returning true allows the navigation, returning false prevents it.
   *
   * @param {History.Location} location
   * @return {*}
   */
  const handleLocationChange = (location: History.Location, action: History.Action) => {
    if (!dialogContext.yesNoDialogProps.open) {
      // If the cancel dialog is not open: open it
      dialogContext.setYesNoDialog({
        ...defaultCancelDialogProps,
        onYes: () => {
          dialogContext.setYesNoDialog({ open: false });
          history.push(location.pathname);
        },
        open: true
      });
      return false;
    }

    // If the cancel dialog is already open and another location change action is triggered: allow it
    return true;
  };

  return (
    <>
      <Prompt when={enableCancelCheck} message={handleLocationChange} />

      <EditDialog
        dialogTitle="Save Incomplete Project as a Draft"
        dialogSaveButtonLabel="Save"
        open={openDraftDialog}
        component={{
          element: <ProjectDraftForm />,
          initialValues: {
            draft_name: '' // TODO
          },
          validationSchema: ProjectDraftFormYupSchema
        }}
        onCancel={() => setOpenDraftDialog(false)}
        onSave={(values) => handleSubmitDraft(values)}
      />

      <Box my={4}>
        <Container maxWidth="xl">
          <Box mb={3}>
            <Breadcrumbs>
              <Link color="primary" onClick={handleCancel} aria-current="page" className={classes.breadCrumbLink}>
                <ArrowBack color="primary" fontSize="small" className={classes.breadCrumbLinkIcon} />
                <Typography variant="body2">Cancel and Exit</Typography>
              </Link>
            </Breadcrumbs>
          </Box>

          <Box mb={5}>
            <Box mb={1}>
              <Typography variant="h1">Create Restoration Project</Typography>
            </Box>
            <Typography variant="body1" color="textSecondary">
              Configure and submit a new restoration project
            </Typography>
          </Box>

          <Box display="flex" justifyContent="flex-end">
            <Box visibility={(draft?.date && 'visible') || 'hidden'}>
              <Typography component="span" variant="subtitle2" color="textSecondary">
                {`Draft saved on ${getFormattedDate(DATE_FORMAT.ShortMediumDateTimeFormat, draft.date)}`}
              </Typography>
            </Box>
          </Box>

          <Box component={Paper} p={4}>
            <Formik
              innerRef={formikRef}
              enableReinitialize={true}
              initialValues={initialProjectFieldData}
              // validationSchema={} // TODO
              validateOnBlur={true}
              validateOnChange={false}
              onSubmit={handleProjectCreation}>
              <>
                {/* <Box my={5}>
                  <ProjectDetailsForm />
                </Box> */}

                {/* <Divider></Divider> */}

                {/* <Box my={5}>
                  <ProjectCoordinatorForm />
                </Box> */}

                {/* <Divider></Divider> */}

                <Box my={5}>
                  <ProjectPermitForm />
                </Box>

                <Divider></Divider>

                {/* <Box my={5}>
                  <ProjectFundingForm />
                </Box> */}

                {/* <Divider></Divider> */}

                <Box my={5}>
                  <ProjectLocationForm ranges={[]} />
                </Box>

                <Divider></Divider>

                <Box mt={5} className={classes.formButtons} display="flex" justifyContent="flex-end">
                  <Button variant="outlined" color="primary" size="large" onClick={() => setOpenDraftDialog(true)}>
                    Save Draft
                  </Button>
                  <Button variant="contained" color="primary" size="large">
                    Create Project
                  </Button>
                  <Button variant="text" color="primary" size="large">
                    Cancel
                  </Button>
                </Box>
              </>
            </Formik>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default CreateProjectPage;
