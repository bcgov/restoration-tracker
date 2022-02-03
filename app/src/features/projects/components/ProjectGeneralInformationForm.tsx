import Box from '@material-ui/core/Box';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import CustomTextField from 'components/fields/CustomTextField';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IProjectGeneralInformationForm {
  project: {
    project_name: string;
    start_date: string;
    end_date: string;
    objectives: string;
    region: string;
  };
}

const regionList = [
  { id: 1, name: 'region 1' },
  { id: 2, name: 'region 2' }
];

export const ProjectGeneralInformationFormInitialValues: IProjectGeneralInformationForm = {
  project: {
    project_name: '',
    start_date: '',
    end_date: '',
    objectives: '',
    region: ''
  }
};

export const ProjectGeneralInformationFormYupSchema = yup.object().shape({
  project: yup.object().shape({
    project_name: yup.string().max(300, 'Cannot exceed 300 characters').required('Required'),
    start_date: yup.string().isValidDateString().required('Required'),
    end_date: yup.string().isValidDateString().isEndDateAfterStartDate('start_date'),
    objectives: yup
      .string()
      .max(3000, 'Cannot exceed 3000 characters')
      .required('You must provide objectives for the project'),
    region: yup.string().isValidDateString().required('Required')
  })
});
/**
 * Create project - General information section
 *
 * @return {*}
 */
const ProjectGeneralInformationForm: React.FC = () => {
  const formikProps = useFormikContext<IProjectGeneralInformationForm>();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={9}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <CustomTextField
              name="project.project_name"
              label="Project Name"
              other={{
                required: true
              }}
            />
          </Grid>
          <StartEndDateFields
            formikProps={formikProps}
            startName={'project.start_date'}
            endName={'project.end_date'}
            startRequired={true}
            endRequired={false}
          />
          <Grid item xs={12}>
            <Grid item xs={12}>
              <CustomTextField
                name="project.objectives"
                label="Objectives"
                other={{ required: true, multiline: true, rows: 4 }}
              />
            </Grid>
          </Grid>

          <Box mb={5}>
            <Box mb={2} maxWidth={'72ch'}>
              <Typography variant="body1" color="textSecondary">
                Specify the region of your project.
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <FormControl component="fieldset" required={true} fullWidth variant="outlined">
                  <InputLabel id="caribou-range-select-label">NRM Region</InputLabel>
                  <Select
                    id="nrm-region-select"
                    name="project.region"
                    labelId="nrm-region-select-label"
                    label="NRM Region"
                    value={formikProps.values.project.region}
                    onChange={formikProps.handleChange}
                    error={formikProps.touched?.project?.region && Boolean(formikProps.errors?.project?.region)}
                    displayEmpty
                    inputProps={{ 'aria-label': 'NRM Region' }}>
                    {regionList.map((item) => (
                      <MenuItem key={item.id} value={item.name}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{formikProps.errors?.project?.region}</FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ProjectGeneralInformationForm;
