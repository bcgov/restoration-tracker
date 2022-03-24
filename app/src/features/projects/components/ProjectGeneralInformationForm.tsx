import Grid from '@material-ui/core/Grid';
import CustomTextField from 'components/fields/CustomTextField';
import MultiAutocompleteFieldVariableSize, {
  IMultiAutocompleteFieldOption
} from 'components/fields/MultiAutocompleteFieldVariableSize';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IProjectGeneralInformationFormProps {
  species: IMultiAutocompleteFieldOption[];
}

export interface IProjectGeneralInformationForm {
  project: {
    project_name: string;
    start_date: string;
    end_date: string;
    objectives: string;
  };
  species: {
    focal_species: number[];
  };
}

export const ProjectGeneralInformationFormInitialValues: IProjectGeneralInformationForm = {
  project: {
    project_name: '',
    start_date: '',
    end_date: '',
    objectives: ''
  },
  species: {
    focal_species: []
  }
};

export const ProjectGeneralInformationFormYupSchema = yup.object().shape({
  project: yup.object().shape({
    project_name: yup.string().max(300, 'Cannot exceed 300 characters').required('Required'),
    start_date: yup.string().isValidDateString().required('Required'),
    end_date: yup.string().nullable().isValidDateString().isEndDateAfterStartDate('start_date'),
    objectives: yup
      .string()
      .max(3000, 'Cannot exceed 3000 characters')
      .required('You must provide objectives for the project')
  }),
  species: yup.object().shape({
    focal_species: yup.array().min(1, 'You must specify a focal species').required('Required')
  })
});

/**
 * Create project - General information section
 *
 * @return {*}
 */

const ProjectGeneralInformationForm: React.FC<IProjectGeneralInformationFormProps> = (props) => {
  const formikProps = useFormikContext<IProjectGeneralInformationForm>();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={9}>
        <Grid container spacing={3} direction="column">
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
                other={{ required: true, multiline: true, rowsMax: 24 }}
              />
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Grid item xs={12}>
              <MultiAutocompleteFieldVariableSize
                id="species.focal_species"
                label="Focal Species"
                options={props.species}
                required={true}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ProjectGeneralInformationForm;
