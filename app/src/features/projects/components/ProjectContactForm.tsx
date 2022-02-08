import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { FieldArray, useFormikContext } from 'formik';
import React, { useState } from 'react';
import yup from 'utils/YupSchema';
import ProjectCoordinatorForm, {
  IProjectCoordinatorForm,
  IProjectCoordinatorFormProps,
  ProjectCoordinatorInitialValues,
  ProjectCoordinatorYupSchema
} from './ProjectCoordinatorForm';
import { Icon } from '@mdi/react';
import { mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import EditDialog from 'components/dialog/EditDialog';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';

export interface IProjectContactForm {
  contact: {
    coordinators: IProjectCoordinatorForm[];
  };
}

export const ProjectContactInitialValues: IProjectContactForm = {
  contact: {
    coordinators: []
  }
};

export const ProjectContactYupSchema = yup.object().shape({
  contact: yup.object().shape({
    coordinators: yup.array().of(ProjectCoordinatorYupSchema),
    share_contact_details: yup.string().required('Required')
  })
});

export type IProjectContactFormProps = IProjectCoordinatorFormProps;

const useStyles = makeStyles((theme: Theme) => ({
  legend: {
    marginTop: '1rem',
    float: 'left',
    marginBottom: '0.75rem',
    letterSpacing: '-0.01rem'
  },
  title: {
    flexGrow: 1,
    marginRight: '1rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontWeight: 700
  },
  titleDesc: {
    marginLeft: theme.spacing(1),
    fontWeight: 400
  },
  contactListItem: {
    padding: 0,
    '& + li': {
      marginTop: theme.spacing(2)
    }
  },
  contactListItemInner: {
    flexGrow: 1,
    flexShrink: 1,
    overflow: 'hidden'
  },
  contactListItemToolbar: {
    paddingRight: theme.spacing(2)
  }
}));

/**
 * Create project - contact section
 *
 * @return {*}
 */
const ProjectContactForm: React.FC<IProjectContactFormProps> = ({ coordinator_agency }) => {
  const classes = useStyles();

  const { values } = useFormikContext<IProjectContactForm>();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Tracks information about the coordinator that is being added/edited
  const [currentProjectCoordinator, setCurrentProjectCoordinator] = useState({
    index: 0,
    values: ProjectCoordinatorInitialValues
  });

  return (
    <>
      <Typography component="legend">Coordinators</Typography>

      <Box mb={3} maxWidth={'72ch'}>
        <Typography variant="body1" color="textSecondary">
          Specify all coordinators for the project.
        </Typography>
      </Box>
      <Box>
        <FieldArray
          name="contact.coordinators"
          render={(arrayHelpers) => (
            <Box mb={2}>
              <EditDialog
                dialogTitle={'Add Coordinator'}
                open={isModalOpen}
                component={{
                  element: <ProjectCoordinatorForm coordinator_agency={coordinator_agency} />,
                  initialValues: currentProjectCoordinator.values,
                  validationSchema: ProjectCoordinatorYupSchema
                }}
                onCancel={() => setIsModalOpen(false)}
                onSave={(projectCoordinatorValues) => {
                  console.log(projectCoordinatorValues);
                  if (currentProjectCoordinator.index < values.contact.coordinators.length) {
                    // Update an existing item
                    arrayHelpers.replace(currentProjectCoordinator.index, projectCoordinatorValues);
                  } else {
                    // Add a new item
                    arrayHelpers.push(projectCoordinatorValues);
                  }

                  // Close the modal
                  setIsModalOpen(false);
                }}
              />
              <List dense disablePadding>
                {!values.contact.coordinators.length && (
                  <ListItem dense component={Paper}>
                    <Box display="flex" flexGrow={1} justifyContent="center" alignContent="middle" p={2}>
                      <Typography variant="subtitle2">No Coordinators</Typography>
                    </Box>
                  </ListItem>
                )}
                {values.contact.coordinators.map((coordinator, index) => (
                  <ListItem dense className={classes.contactListItem} key={index}>
                    <Paper className={classes.contactListItemInner}>
                      <Toolbar className={classes.contactListItemToolbar}>
                        <Typography className={classes.title}>
                          {`${coordinator.first_name} ${coordinator.last_name}`}
                        </Typography>

                        <IconButton
                          color="primary"
                          data-testid={'edit-button-' + index}
                          title="Edit Coordinator"
                          aria-label="Edit Coordinator"
                          onClick={() => {
                            setCurrentProjectCoordinator({
                              index: index,
                              values: values.contact.coordinators[index]
                            });
                            setIsModalOpen(true);
                          }}>
                          <Icon path={mdiPencilOutline} size={1} />
                        </IconButton>
                        <IconButton
                          color="primary"
                          data-testid={'delete-button-' + index}
                          title="Remove Coordinator"
                          aria-label="Remove Coordinator"
                          onClick={() => arrayHelpers.remove(index)}>
                          <Icon path={mdiTrashCanOutline} size={1} />
                        </IconButton>
                      </Toolbar>
                      <Divider />
                      <Box py={2} px={3}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6} md={4}>
                            <Typography variant="body2" color="textSecondary">
                              Agency
                            </Typography>
                            <Typography variant="body1">{coordinator.coordinator_agency}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6} md={4}>
                            <Typography variant="body2" color="textSecondary">
                              Email
                            </Typography>
                            <Typography variant="body1">{coordinator.email_address}</Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Paper>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        />
      </Box>
      <Button
        variant="outlined"
        color="primary"
        title="Add Coordinator"
        aria-label="Add Coordinator"
        startIcon={<Icon path={mdiPlus} size={1}></Icon>}
        data-testid="add-coordinator-button"
        onClick={() => {
          setCurrentProjectCoordinator({
            index: values.contact.coordinators.length,
            values: ProjectCoordinatorInitialValues
          });
          setIsModalOpen(true);
        }}>
        Add Coordinator
      </Button>
    </>
  );
};

export default ProjectContactForm;
