import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import CustomTextField from 'components/fields/CustomTextField';
import { FieldArray, useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

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

export interface IProjectPermitFormArrayItem {
  permit_number: string;
  permit_type: string;
}

export interface IProjectPermitForm {
  permit: {
    permits: IProjectPermitFormArrayItem[];
  };
}

export const ProjectPermitFormArrayItemInitialValues: IProjectPermitFormArrayItem = {
  permit_number: '',
  permit_type: ''
};

export const ProjectPermitFormInitialValues: IProjectPermitForm = {
  permit: {
    permits: [ProjectPermitFormArrayItemInitialValues]
  }
};

export const ProjectPermitFormYupSchema = yup.object().shape({
  permit: yup.object().shape({
    permits: yup
      .array()
      .of(
        yup.object().shape({
          permit_number: yup.string().max(100, 'Cannot exceed 100 characters').required('Required'),
          permit_type: yup.string().required('Required')
        })
      )
      .isUniquePermitNumber('Permit numbers must be unique')
  })
});

/**
 * Create project - Permit section
 *
 * @return {*}
 */
const ProjectPermitForm: React.FC = () => {
  const classes = useStyles();

  const { values, handleChange, getFieldMeta, errors } = useFormikContext<IProjectPermitForm>();

  const permitTypes = [
    'Forestry License to Cut',
    'Heritage Inspection Permit',
    'License of Occupation',
    'Occupant License to Cut under the Forest Act',
    'Park Use Permit',
    'Road Use Permit',
    'Special Use Permit'
  ];

  return (
    <>
      <FieldArray
        name="permit.permits"
        render={(arrayHelpers) => (
          <>
            <Box mb={3} maxWidth={'72ch'}>
              <Typography variant="body1" color="textSecondary">
                <strong>Note:</strong> For permit numbers, only provide the last 6 digits located after the hyphen (e.g.
                for KA12-845782 enter 845782)
              </Typography>
            </Box>
            {values.permit.permits?.map((permit, index) => {
              const permitNumberMeta = getFieldMeta(`permit.permits.[${index}].permit_number`);
              const permitTypeMeta = getFieldMeta(`permit.permits.[${index}].permit_type`);

              return (
                /* Permit List List */
                <Grid container spacing={3} key={index}>
                  <Grid item xs={12} md={6}>
                    <List>
                      <ListItem className={classes.customListItem}>
                        <Grid container spacing={3}>
                          <Grid item xs={6}>
                            <FormControl fullWidth variant="outlined">
                              <InputLabel id="permit-type-label">Permit Type</InputLabel>
                              <Select
                                id="permit-type-select"
                                name={`permit.permits.[${index}].permit_type`}
                                labelId="permit-type-label"
                                label="Permit Type"
                                value={permit.permit_type}
                                onChange={handleChange}
                                error={permitTypeMeta.touched && Boolean(permitTypeMeta.error)}
                                displayEmpty
                                inputProps={{ 'aria-label': 'Permit Type' }}>
                                {permitTypes.map((permitType, index) => (
                                  <MenuItem key={index} value={permitType}>
                                    {permitType}
                                  </MenuItem>
                                ))}
                              </Select>
                              <FormHelperText>{permitTypeMeta.touched && permitTypeMeta.error}</FormHelperText>
                            </FormControl>
                          </Grid>
                          <Grid item xs={6}>
                            <CustomTextField
                              name={`permit.permits.[${index}].permit_number`}
                              label="Permit Number"
                              other={{
                                required: true,
                                value: permit.permit_number,
                                error: permitNumberMeta.touched && Boolean(permitNumberMeta.error),
                                helperText: permitNumberMeta.touched && permitNumberMeta.error
                              }}
                            />
                          </Grid>
                        </Grid>
                        <ListItemSecondaryAction>
                          <IconButton
                            color="primary"
                            data-testid="delete-icon"
                            aria-label="remove permit"
                            onClick={() => arrayHelpers.remove(index)}
                            edge="end">
                            <Icon path={mdiTrashCanOutline} size={1}></Icon>
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              );
            })}
            <Box pt={2}>
              <Button
                type="button"
                variant="outlined"
                color="primary"
                aria-label="add permit"
                startIcon={<Icon path={mdiPlus} size={1}></Icon>}
                onClick={() => arrayHelpers.push(ProjectPermitFormArrayItemInitialValues)}>
                Add New Permit
              </Button>
            </Box>
          </>
        )}
      />
      <Box>
        {errors.permit?.permits && !Array.isArray(errors.permit?.permits) && (
          <Box pt={2}>
            <Typography style={{ fontSize: '12px', color: '#f44336' }}>{errors.permit.permits}</Typography>
          </Box>
        )}
      </Box>
    </>
  );
};

export default ProjectPermitForm;
