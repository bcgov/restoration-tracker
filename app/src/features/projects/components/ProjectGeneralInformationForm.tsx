import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { mdiCalendarEnd, mdiCalendarStart, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import CustomTextField from 'components/fields/CustomTextField';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IProjectGeneralInformationForm {
  project_name: string;
  project_type: number;
  start_date: string;
  end_date: string;
}

export const ProjectGeneralInformationFormInitialValues: IProjectGeneralInformationForm = {
  project_name: '',
  project_type: ('' as unknown) as number,
  start_date: '',
  end_date: ''
};

export const ProjectGeneralInformationFormYupSchema = yup.object().shape({
  project_name: yup.string().max(300, 'Cannot exceed 300 characters').required('Required'),
  project_type: yup.number().required('Required'),
  start_date: yup.string().isValidDateString().required('Required'),
  end_date: yup.string().isValidDateString().isEndDateAfterStartDate('start_date')
});

export interface IProjectGeneralInformationFormProps {
  project_type: IMultiAutocompleteFieldOption[];
}

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
const ProjectGeneralInformationForm: React.FC<IProjectGeneralInformationFormProps> = (props) => {
  const formikProps = useFormikContext<IProjectGeneralInformationForm>();

  const { values, touched, errors, handleChange, handleSubmit } = formikProps;

  const classes = useStyles();

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <CustomTextField
            name="project_name"
            label="Project Name"
            other={{
              required: true
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth variant="outlined" required={true} style={{ width: '100%' }}>
            <InputLabel id="project_type-label">Project Type</InputLabel>
            <Select
              id="project_type"
              name="project_type"
              labelId="project_type-label"
              label="Project Type"
              value={values.project_type}
              labelWidth={300}
              onChange={handleChange}
              error={touched.project_type && Boolean(errors.project_type)}
              displayEmpty
              inputProps={{ 'aria-label': 'Project Type' }}>
              {props.project_type.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{touched.project_type && errors.project_type}</FormHelperText>
          </FormControl>
        </Grid>
        <StartEndDateFields formikProps={formikProps} startRequired={true} endRequired={false} />

        <Box mb={5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Typography variant="h2">General Information</Typography>
              {/* <Typography variant="body1" color="textSecondary">General information about this restoration project</Typography> */}
            </Grid>
            <Grid item xs={12} md={9}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField fullWidth variant="outlined" label="Project Name"></TextField>
                </Grid>
                <Grid item xs={6} lg={3}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Icon path={mdiCalendarStart} size={1} color="primary"></Icon>
                        </InputAdornment>
                      )
                    }}
                    label="Project Start Date"></TextField>
                </Grid>
                <Grid item xs={6} lg={3}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Icon path={mdiCalendarEnd} size={1}></Icon>
                        </InputAdornment>
                      )
                    }}
                    label="Completion Date"></TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={4} variant="outlined" label="Objectives"></TextField>
                </Grid>
              </Grid>

              <Box component="fieldset" mt={5} mx={0}>
                <Typography component="legend">IUCN Conservation Actions Classifications (Optional)</Typography>
                <Box mb={3} maxWidth={'72ch'}>
                  <Typography variant="body1" color="textSecondary">
                    Conservation actions are specific actions or sets of tasks undertaken by project staff designed to
                    reach each of the project's objectives.
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
        </Box>
      </Grid>
    </form>
  );
};

export default ProjectGeneralInformationForm;
