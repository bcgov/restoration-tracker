import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
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
  };
}

export const ProjectGeneralInformationFormInitialValues: IProjectGeneralInformationForm = {
  project: {
    project_name: '',
    start_date: '',
    end_date: '',
    objectives: ''
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
      .required('You must provide objectives for the project')
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
            <TextField fullWidth required variant="outlined" label="Project Name" id="project.project_name"></TextField>
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
                other={{ multiline: true, required: true, rows: 4 }}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ProjectGeneralInformationForm;
