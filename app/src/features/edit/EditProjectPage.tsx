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
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { CreateProjectI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import ProjectCoordinatorForm from //ProjectCoordinatorYupSchema //ProjectCoordinatorInitialValues,
'features/projects/components/ProjectCoordinatorForm';

import ProjectFundingForm from //ProjectFundingFormYupSchema //ProjectFundingFormInitialValues,
'features/projects/components/ProjectFundingForm';
import ProjectGeneralInformationForm from //ProjectGeneralInformationFormYupSchema //ProjectGeneralInformationFormInitialValues,
'features/projects/components/ProjectGeneralInformationForm';
import ProjectIUCNForm from //ProjectIUCNFormYupSchema //ProjectIUCNFormInitialValues,
'features/projects/components/ProjectIUCNForm';
import ProjectLocationForm from //ProjectLocationFormYupSchema //ProjectLocationFormInitialValues,
'features/projects/components/ProjectLocationForm';
import ProjectPartnershipsForm from //ProjectPartnershipsFormYupSchema //ProjectPartnershipsFormInitialValues,
'features/projects/components/ProjectPartnershipsForm';
import ProjectPermitForm from //IProjectPermitFormArrayItem
//ProjectPermitFormInitialValues,
//ProjectPermitFormYupSchema
'features/projects/components/ProjectPermitForm';
import { Form, Formik, FormikProps } from 'formik';
import History from 'history';
import { APIError } from 'hooks/api/useAxios';
import useCodes from 'hooks/useCodes';
import { useParams } from 'react-router';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import {
  IGetProjectForViewResponse,
  IGetProjectForViewResponseDetails,
  IGetProjectForViewResponsePermit,
  IGetProjectForViewResponseLocation,
  IGetProjectForViewResponseCoordinator,
  IGetProjectForViewResponseIUCN,
  IGetProjectForViewResponseFundingData,
  IGetProjectForViewResponsePartnerships

  //IGetProjectForUpdateResponse,
  //IGetGeneralInformationForUpdateResponseDetails,
  //IGetProjectForUpdateResponsePermit,
  //IGetProjectForUpdateResponseLocation,
  //IGetProjectForUpdateResponseCoordinator,
  //IGetProjectForUpdateResponseIUCN,
  //IGetProjectForUpdateResponseFundingData,
  //IGetProjectForUpdateResponsePartnerships
} from 'interfaces/useProjectApi.interface';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { Prompt } from 'react-router-dom';
//import { number } from 'yup';
//import yup from 'utils/YupSchema';

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
  id: 0,
  project: {
    project_name: 'string',
    start_date: 'string',
    end_date: 'string',
    objectives: 'string'
  } as IGetProjectForViewResponseDetails,
  permit: {
    permits: [
      {
        permit_number: '',
        permit_type: ''
      }
    ]
  } as IGetProjectForViewResponsePermit,
  location: {
    geometry: [],
    range: '0',
    priority: 'false'
  } as IGetProjectForViewResponseLocation,
  coordinator: {
    first_name: 'string',
    last_name: 'string',
    email_address: 'string',
    coordinator_agency: 'string',
    share_contact_details: 'string'
  } as IGetProjectForViewResponseCoordinator,
  iucn: {
    classificationDetails: []
  } as IGetProjectForViewResponseIUCN,
  funding: {
    fundingSources: []
  } as IGetProjectForViewResponseFundingData,
  partnerships: {
    indigenous_partnerships: [],
    stakeholder_partnerships: []
  } as IGetProjectForViewResponsePartnerships
} as IGetProjectForViewResponse;

/**
 * Page for creating a new project.
 *
 * @return {*}
 */
const EditProjectPage: React.FC = () => {
  const classes = useStyles();

  const history = useHistory();

  const restorationTrackerApi = useRestorationTrackerApi();

  const urlParams = useParams();

  const codes = useCodes();

  const [hasLoadedDraftData, setHasLoadedDraftData] = useState(false);

  // Reference to pass to the formik component in order to access its state at any time
  // Used by the draft logic to fetch the values of a step form that has not been validated/completed
  const formikRef = useRef<FormikProps<IGetProjectForViewResponse>>(null);

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


  const [initialProjectFormData, setInitialProjectFormData] = useState<IGetProjectForViewResponse>(ProjectFormInitialValues);

  useEffect(() => {
    const getEditProjectFields = async () => {

      console.log('codes////////////////////////////////////////////////////');
      console.log(JSON.stringify(codes));

      console.log('start////////////////////////////////////////////////////');
      var id = urlParams['id'];
      const response = await restorationTrackerApi.project.getProjectById(id);

      setInitialProjectFormData(response);

      console.log('response////////////////////////////////////////////////////');

      console.log(JSON.stringify(response));
      console.log('initaia; valiues////////////////////////////////////////////////////');

      console.log(JSON.stringify(initialProjectFormData));

      if (!response || !response.id) {
        return;
      }

      setHasLoadedDraftData(true);
    };

    if (hasLoadedDraftData) {
      return;
    }

    getEditProjectFields();
  }, [hasLoadedDraftData, restorationTrackerApi.project, urlParams]);

  const handleCancel = () => {
    dialogContext.setYesNoDialog(defaultCancelDialogProps);
    history.push('/admin/projects');
  };

  /**
   * Handle project creation.
   */
  const handleProjectEdits = async (values: IGetProjectForViewResponse) => {
    try {
      var id = urlParams['id'];
      const hold = false;

      if (hold) {
        const response = { id: id };

        //await restorationTrackerApi.project.updateProject(id, values);

        if (!response?.id) {
          showCreateErrorDialog({
            dialogError: 'The response from the server was null, or did not contain a project ID.'
          });
          return;
        }

        setEnableCancelCheck(false);

        history.push(`/admin/projects/${response.id}`);
      }
      console.log(JSON.stringify(values));
    } catch (error) {
      showCreateErrorDialog({
        dialogTitle: 'Error Creating Project',
        dialogError: (error as APIError)?.message,
        dialogErrorDetails: (error as APIError)?.errors
      });
    }
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

  if (!codes.codes || !hasLoadedDraftData) {
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
              <Typography variant="h1">Edit Restoration Project</Typography>
            </Box>
            <Typography variant="body1" color="textSecondary">
              Configure and submit updated restoration project
            </Typography>
          </Box>

          <Box component={Paper} p={4}>
            <Formik<IGetProjectForViewResponse>
              innerRef={formikRef}
              enableReinitialize={true}
              initialValues={initialProjectFormData}
              validateOnBlur={true}
              validateOnChange={false}
              onSubmit={handleProjectEdits}>
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
                      <Typography variant="h2">Contact</Typography>
                    </Grid>

                    <Grid item xs={12} md={9}>
                      <ProjectCoordinatorForm
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
                            return { value: item.id, label: item.name };
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
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Divider></Divider>

                <Box mt={5} className={classes.formButtons} display="flex" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    type="submit"
                    data-testid="project-create-button">
                    Save Project
                  </Button>
                  <Button variant="text" color="primary" size="large" data-testid="project-cancel-buttton">
                    Cancel
                  </Button>
                </Box>
              </Form>
            </Formik>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default EditProjectPage;
