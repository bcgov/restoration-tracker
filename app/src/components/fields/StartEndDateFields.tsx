import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { DATE_LIMIT } from 'constants/dateTimeFormats';
import React from 'react';

interface IStartEndDateFieldsProps {
  formikProps: any;
  startName: string;
  endName: string;
  startRequired: boolean;
  endRequired: boolean;
  startDateHelperText?: string;
  endDateHelperText?: string;
}

/**
 * Start/end date fields - commonly used throughout forms
 *
 */
const StartEndDateFields: React.FC<IStartEndDateFieldsProps> = (props) => {
  const {
    formikProps: { values, handleChange, errors, touched },
    startName,
    endName,
    startRequired,
    endRequired,
    startDateHelperText,
    endDateHelperText
  } = props;

  return (
    <Grid container item spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          id="start_date"
          name="start_date"
          label="Start Date"
          variant="outlined"
          required={startRequired}
          value={values[startName]}
          type="date"
          InputProps={{
            // Chrome min/max dates
            inputProps: { min: DATE_LIMIT.min, max: DATE_LIMIT.max, 'data-testid': 'start-date' }
          }}
          inputProps={{
            // Firefox min/max dates
            min: DATE_LIMIT.min,
            max: DATE_LIMIT.max,
            'data-testid': 'start-date'
          }}
          onChange={handleChange}
          error={touched[startName] && Boolean(errors[startName])}
          helperText={(touched[startName] && errors[startName]) || startDateHelperText}
          InputLabelProps={{
            shrink: true
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          id="end_date"
          name="end_date"
          label="End Date"
          variant="outlined"
          required={endRequired}
          value={values[endName]}
          type="date"
          InputProps={{
            // Chrome min/max dates
            inputProps: { min: DATE_LIMIT.min, max: DATE_LIMIT.max, 'data-testid': 'end-date' }
          }}
          inputProps={{
            // Firefox min/max dates
            min: DATE_LIMIT.min,
            max: DATE_LIMIT.max,
            'data-testid': 'end-date'
          }}
          onChange={handleChange}
          error={touched[endName] && Boolean(errors[endName])}
          helperText={(touched[endName] && errors[endName]) || endDateHelperText}
          InputLabelProps={{
            shrink: true
          }}
        />
      </Grid>
    </Grid>
  );
};

export default StartEndDateFields;
