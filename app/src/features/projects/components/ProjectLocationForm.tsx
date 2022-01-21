import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import { mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import FileUpload from 'components/attachments/FileUpload';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import MapContainer from 'components/map/MapContainer';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import React, { useState } from 'react';
import yup from 'utils/YupSchema';

export interface IProjectLocationForm {
  location: {
    geometry: Feature[];
    range: string;
    priority: string;
  };
}

export const ProjectLocationFormInitialValues: IProjectLocationForm = {
  location: {
    geometry: [],
    range: '',
    priority: 'false'
  }
};

export const ProjectLocationFormYupSchema = yup.object().shape({
  location: yup.object().shape({
    geometry: yup.array().min(1, 'You must specify a project boundary').required('You must specify a project boundary'),
    range: yup.string().required('Required'),
    priority: yup.string().required('Required')
  })
});

export interface IProjectLocationFormProps {
  ranges: IAutocompleteFieldOption<number>[];
}

/**
 * Create project - Location section
 *
 * @return {*}
 */
const ProjectLocationForm: React.FC<IProjectLocationFormProps> = (props) => {
  const formikProps = useFormikContext<IProjectLocationForm>();

  const { errors, touched, values, handleChange, setFieldValue } = formikProps;

  const [openUploadBoundary, setOpenUploadBoundary] = useState(false);

  const getUploadHandler = (): IUploadHandler => {
    return async (file: File) => {
      console.log(file);
      // TODO use `formikProps.setFieldValue` to manually set the form `geometry` value based on the contents of the uploaded boundary file
      return Promise.resolve();
    };
  };

  return (
    <>
      <Box mb={5}>
        <Box mb={2} maxWidth={'72ch'}>
          <Typography variant="body1" color="textSecondary">
            Specify the caribou range associate with this project.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={6}>
            <FormControl component="fieldset" required={true} fullWidth variant="outlined">
              <InputLabel id="caribou-range-select-label">Caribou Range</InputLabel>
              <Select
                id="caribou-range-select"
                name="location.range"
                labelId="caribou-range-select-label"
                label="Caribou Range"
                value={values.location.range}
                onChange={handleChange}
                error={touched.location?.range && Boolean(errors.location?.range)}
                displayEmpty
                inputProps={{ 'aria-label': 'Caribou Range' }}>
                {props.ranges.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.location?.range}</FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <Box mb={4}>
        <FormControl
          component="fieldset"
          required={true}
          error={touched.location?.priority && Boolean(errors.location?.priority)}>
          <FormLabel component="legend">Is this location a priority area?</FormLabel>

          <Box mt={2}>
            <RadioGroup
              name="location.priority"
              aria-label="Location Priority"
              value={values.location.priority}
              onChange={handleChange}>
              <FormControlLabel
                value="false"
                control={<Radio required={true} color="primary" size="small" />}
                label="No"
              />
              <FormControlLabel
                value="true"
                control={<Radio required={true} color="primary" size="small" />}
                label="Yes"
              />
              <FormHelperText>{touched.location?.priority && errors.location?.priority}</FormHelperText>
            </RadioGroup>
          </Box>
        </FormControl>
      </Box>

      <Box component="fieldset">
        <Typography component="legend">Project Boundary</Typography>
        <Box mb={3} maxWidth={'72ch'}>
          <Typography variant="body1" color="textSecondary">
            Upload a shapefile or use the drawing tools on the map to define your project boundary (KML or shapefiles
            accepted).
          </Typography>
        </Box>

        <Box mb={5}>
          <Button
            size="large"
            variant="outlined"
            color="primary"
            component="span"
            startIcon={<Icon path={mdiTrayArrowUp} size={1}></Icon>}
            onClick={() => setOpenUploadBoundary(true)}
            data-testid="project-boundary-upload">
            Upload Boundary
          </Button>
        </Box>

        <Box height={500}>
          <MapContainer
            mapId={'project_location_map'}
            geometryState={{
              geometry: values.location.geometry,
              setGeometry: (newGeo: Feature[]) => setFieldValue('location.geometry', newGeo)
            }}
          />
        </Box>
        {errors?.location?.geometry && (
          <Box pt={2}>
            <Typography style={{ fontSize: '12px', color: '#f44336' }}>{errors?.location?.geometry}</Typography>
          </Box>
        )}
      </Box>

      <ComponentDialog
        open={openUploadBoundary}
        dialogTitle="Upload Project Boundary"
        onClose={() => setOpenUploadBoundary(false)}>
        <FileUpload uploadHandler={getUploadHandler()} />
      </ComponentDialog>
    </>
  );
};

export default ProjectLocationForm;
