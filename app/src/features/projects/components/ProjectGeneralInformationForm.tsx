import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IProjectGeneralInformationForm {
  project_name: string;
  start_date: string;
  end_date: string;
  objectives: string;
}

export const ProjectGeneralInformationFormInitialValues: IProjectGeneralInformationForm = {
  project_name: '',
  start_date: '',
  end_date: '',
  objectives: ''
};

export const ProjectGeneralInformationFormYupSchema = yup.object().shape({
  project_name: yup.string().max(300, 'Cannot exceed 300 characters').required('Required'),
  start_date: yup.string().isValidDateString().required('Required'),
  end_date: yup.string().isValidDateString().isEndDateAfterStartDate('start_date'),
  objectives: yup
    .string()
    .max(3000, 'Cannot exceed 3000 characters')
    .required('You must provide objectives for the project')
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formButtons: {
      '& button': {
        margin: theme.spacing(0.5)
      }
    },
    addRowButton: {
      fontWeight: 700
    },
    customListItem: {
      paddingTop: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      paddingRight: theme.spacing(8)
    },
    input: {
      display: 'none'
    }
  })
);

/**
 * Create project - General information section
 *
 * @return {*}
 */
const ProjectGeneralInformationForm: React.FC = (props) => {
  const formikProps = useFormikContext<IProjectGeneralInformationForm>();

  const { handleSubmit } = formikProps;

  const classes = useStyles();

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Typography variant="h2">General Information</Typography>
          {/* <Typography variant="body1" color="textSecondary">Permits required for this project.</Typography> */}
        </Grid>
        <Grid item xs={12} md={9}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField fullWidth required variant="outlined" label="Project Name" id="project_name"></TextField>
            </Grid>
            <StartEndDateFields formikProps={formikProps} startRequired={true} endRequired={false} />
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                variant="outlined"
                label="Objectives"
                id="objectives"
                multiline={true}
                rows={4}></TextField>
            </Grid>
          </Grid>

          <Box component="fieldset" mt={5} mx={0}>
            <Typography component="legend">IUCN Conservation Actions Classifications (Optional)</Typography>
            <Box mb={3} maxWidth={'72ch'}>
              <Typography variant="body1" color="textSecondary">
                Conservation actions are specific actions or sets of tasks undertaken by project staff designed to reach
                each of the project's objectives.
              </Typography>
            </Box>

            {/* IUCN Classifications List */}
            <List>
              <ListItem className={classes.customListItem}>
                <Grid container spacing={3}>
                  <Grid item xs={4}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="iucn-classification">Classification</InputLabel>
                      <Select labelId="iucn-classification" label="Classification" id="iucn-classification-select">
                        <MenuItem value={10}>Classification One</MenuItem>
                        <MenuItem value={20}>Classification Two</MenuItem>
                        <MenuItem value={30}>Classification Three</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={4}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="sub-classification-1">Sub-classification</InputLabel>
                      <Select labelId="sub-classification-1" label="Sub-classification" id="icun-subclass-select-1">
                        <MenuItem value={10}>Sub-classification</MenuItem>
                        <MenuItem value={20}>Sub-classification</MenuItem>
                        <MenuItem value={30}>Sub-classification</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={4}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="sub-classification-2">Sub-classification</InputLabel>
                      <Select labelId="sub-classification-2" label="Sub-classification" id="iucn-subclass-select-2">
                        <MenuItem value={10}>Sub-classification</MenuItem>
                        <MenuItem value={20}>Sub-classification</MenuItem>
                        <MenuItem value={30}>Sub-classification</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <ListItemSecondaryAction>
                  <IconButton edge="end">
                    <Icon path={mdiTrashCanOutline} size={1}></Icon>
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </List>

            <Box mt={2}>
              <Button variant="outlined" color="primary" startIcon={<Icon path={mdiPlus} size={1}></Icon>}>
                Add Classification
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default ProjectGeneralInformationForm;
