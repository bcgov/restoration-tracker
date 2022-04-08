import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import ArrowBack from '@material-ui/icons/ArrowBack';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { ScrollToFormikError } from 'components/formik/ScrollToFormikError';
import { CreateProjectDraftI18N, CreateProjectI18N } from 'constants/i18n';
import { AuthStateContext } from 'contexts/authStateContext';
import { DialogContext } from 'contexts/dialogContext';
import ProjectContactForm, {
  ProjectContactInitialValues,
  ProjectContactYupSchema
} from 'features/projects/components/ProjectContactForm';
import ProjectDraftForm, {
  IProjectDraftForm,
  ProjectDraftFormYupSchema
} from 'features/projects/components/ProjectDraftForm';
import ProjectFundingForm, {
  ProjectFundingFormInitialValues,
  ProjectFundingFormYupSchema
} from 'features/projects/components/ProjectFundingForm';
import ProjectGeneralInformationForm, {
  ProjectGeneralInformationFormInitialValues,
  ProjectGeneralInformationFormYupSchema
} from 'features/projects/components/ProjectGeneralInformationForm';
import ProjectIUCNForm, {
  ProjectIUCNFormInitialValues,
  ProjectIUCNFormYupSchema
} from 'features/projects/components/ProjectIUCNForm';
import ProjectLocationForm, {
  ProjectLocationFormInitialValues,
  ProjectLocationFormYupSchema
} from 'features/projects/components/ProjectLocationForm';
import ProjectPartnershipsForm, {
  ProjectPartnershipsFormInitialValues,
  ProjectPartnershipsFormYupSchema
} from 'features/projects/components/ProjectPartnershipsForm';
import ProjectPermitForm, {
  ProjectPermitFormInitialValues,
  ProjectPermitFormYupSchema
} from 'features/projects/components/ProjectPermitForm';
import { Form, Formik, FormikProps } from 'formik';
import History from 'history';
import { APIError } from 'hooks/api/useAxios';
import useCodes from 'hooks/useCodes';
import { useQuery } from 'hooks/useQuery';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { ICreateProjectRequest } from 'interfaces/useProjectApi.interface';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { Prompt } from 'react-router-dom';
import yup from 'utils/YupSchema';

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

export const ProjectFormInitialValues = {
  ...ProjectGeneralInformationFormInitialValues,
  ...ProjectIUCNFormInitialValues,
  ...ProjectContactInitialValues,
  ...ProjectPermitFormInitialValues,
  ...ProjectFundingFormInitialValues,
  ...ProjectPartnershipsFormInitialValues,
  ...ProjectLocationFormInitialValues
};

export const ProjectFormYupSchema = yup
  .object()
  .concat(ProjectGeneralInformationFormYupSchema)
  .concat(ProjectIUCNFormYupSchema)
  .concat(ProjectContactYupSchema)
  .concat(ProjectPermitFormYupSchema)
  .concat(ProjectFundingFormYupSchema)
  .concat(ProjectPartnershipsFormYupSchema)
  .concat(ProjectLocationFormYupSchema);

/**
 * Page for creating a new project.
 *
 * @return {*}
 */
const CreateProjectPage: React.FC = () => {
  const classes = useStyles();

  const history = useHistory();

  const { keycloakWrapper } = useContext(AuthStateContext);

  const restorationTrackerApi = useRestorationTrackerApi();

  const queryParams = useQuery();

  const codes = useCodes();

  const [hasLoadedDraftData, setHasLoadedDraftData] = useState(!queryParams.draftId);

  // Reference to pass to the formik component in order to access its state at any time
  // Used by the draft logic to fetch the values of a step form that has not been validated/completed
  const formikRef = useRef<FormikProps<ICreateProjectRequest>>(null);

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
      history.push('/admin/user/projects');
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

  const [initialProjectFormData, setInitialProjectFormData] = useState<ICreateProjectRequest>(ProjectFormInitialValues);

  const [projectDraftFormInitialName, setProjectDraftFormInitialName] = React.useState<string>(
    initialProjectFormData.project.project_name
  );

  // Get draft project fields if draft id exists
  useEffect(() => {
    const getDraftProjectFields = async () => {
      const response = await restorationTrackerApi.draft.getDraft(queryParams.draftId);

      setHasLoadedDraftData(true);

      if (!response || !response.data) {
        return;
      }

      setInitialProjectFormData(response.data);
    };

    if (hasLoadedDraftData) {
      return;
    }

    getDraftProjectFields();
  }, [restorationTrackerApi.draft, hasLoadedDraftData, queryParams.draftId]);

  const handleCancel = () => {
    dialogContext.setYesNoDialog(defaultCancelDialogProps);
    history.push('/admin/user/projects');
  };

  const handleSubmitDraft = async (values: IProjectDraftForm) => {
    try {
      const draftId = Number(queryParams.draftId) || draft?.id;

      let response;
      if (draftId) {
        response = await restorationTrackerApi.draft.updateDraft(draftId, values.draft_name, formikRef.current?.values);
      } else {
        response = await restorationTrackerApi.draft.createDraft(values.draft_name, formikRef.current?.values);
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

      history.push('/admin/user/projects');
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
  const handleProjectCreation = async (values: ICreateProjectRequest) => {
    try {
      const response = await restorationTrackerApi.project.createProject(values);

      if (!response?.id) {
        showCreateErrorDialog({
          dialogError: 'The response from the server was null, or did not contain a project ID.'
        });
        return;
      }

      await deleteDraft();

      setEnableCancelCheck(false);

      keycloakWrapper?.refresh();

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

  if (!codes.codes) {
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
            draft_name: projectDraftFormInitialName
          },
          validationSchema: ProjectDraftFormYupSchema
        }}
        onCancel={() => setOpenDraftDialog(false)}
        onSave={handleSubmitDraft}
      />

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

        <Box component={Paper} p={4}>
          <Formik<ICreateProjectRequest>
            innerRef={formikRef}
            enableReinitialize={true}
            initialValues={initialProjectFormData}
            validationSchema={ProjectFormYupSchema}
            validateOnBlur={true}
            validateOnChange={false}
            onSubmit={handleProjectCreation}>
            <>
              <ScrollToFormikError
                onChangeFormikValues={(values) => setProjectDraftFormInitialName(values.project.project_name)}
              />
              <Form noValidate>
                <Box my={5}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                      <Typography variant="h2">General Information</Typography>
                    </Grid>

                    <Grid item xs={12} md={9}>
                      <ProjectGeneralInformationForm />

                      <Box component="fieldset" mt={5} mx={0}>
                        <ProjectIUCNForm
                          classifications={
                            codes.codes.iucn_conservation_action_level_1_classification?.map((item) => {
                              return { value: item.id, label: item.name };
                            }) || []
                          }
                          subClassifications1={
                            codes.codes.iucn_conservation_action_level_2_subclassification?.map((item) => {
                              return { value: item.id, iucn1_id: item.iucn1_id, label: item.name };
                            }) || []
                          }
                          subClassifications2={
                            codes.codes.iucn_conservation_action_level_3_subclassification?.map((item) => {
                              return { value: item.id, iucn2_id: item.iucn2_id, label: item.name };
                            }) || []
                          }
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                <Divider></Divider>

                <Box my={5}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                      <Typography variant="h2">Contacts</Typography>
                    </Grid>

                    <Grid item xs={12} md={9}>
                      <ProjectContactForm
                        coordinator_agency={codes.codes.coordinator_agency.map((item) => item.name)}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Divider></Divider>

                <Box my={5}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                      <Typography variant="h2">Permits</Typography>
                    </Grid>

                    <Grid item xs={12} md={9}>
                      <ProjectPermitForm />
                    </Grid>
                  </Grid>
                </Box>

                <Divider></Divider>

                <Box my={5}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                      <Typography variant="h2">Funding and Partnerships</Typography>
                    </Grid>

                    <Grid item xs={12} md={9}>
                      <Box component="fieldset" mx={0}>
                        <ProjectFundingForm
                          fundingSources={codes.codes.funding_source.map((item) => {
                            return { value: item.id, label: item.name };
                          })}
                          investment_action_category={codes.codes.investment_action_category.map((item) => {
                            return { value: item.id, label: item.name, fs_id: item.fs_id };
                          })}
                        />
                      </Box>

                      <Box component="fieldset" mt={5} mx={0}>
                        <ProjectPartnershipsForm
                          first_nations={codes.codes.first_nations.map((item) => {
                            return { value: item.id, label: item.name };
                          })}
                          stakeholder_partnerships={codes.codes.funding_source.map((item) => {
                            return { value: item.name, label: item.name };
                          })}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                <Divider></Divider>

                <Box my={5}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                      <Typography variant="h2">Location</Typography>
                    </Grid>

                    <Grid item xs={12} md={9}>
                      <ProjectLocationForm
                        ranges={codes.codes.ranges.map((item) => {
                          return { value: item.id, label: item.name };
                        })}
                        regions={codes.codes.regions.map((item) => {
                          return { value: item.id, label: item.name };
                        })}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Divider></Divider>

                <Box mt={5} className={classes.formButtons} display="flex" justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    onClick={() => setOpenDraftDialog(true)}
                    data-testid="project-save-draft-button">
                    Save Draft
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    type="submit"
                    data-testid="project-create-button">
                    Create Project
                  </Button>
                  <Button
                    variant="text"
                    color="primary"
                    size="large"
                    data-testid="project-cancel-buttton"
                    onClick={handleCancel}>
                    Cancel
                  </Button>
                </Box>
              </Form>
            </>
          </Formik>
        </Box>
      </Container>
    </>
  );
};

export default CreateProjectPage;
