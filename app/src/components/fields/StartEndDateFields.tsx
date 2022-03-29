import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { DATE_FORMAT, DATE_LIMIT } from 'constants/dateTimeFormats';
import { DialogContext, ISnackbarProps } from 'contexts/dialogContext';
import get from 'lodash-es/get';
import moment from 'moment';
import React, { useCallback, useContext, useEffect } from 'react';

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
    formikProps: { values, handleChange, errors, touched, setFieldValue },
    startName,
    endName,
    startRequired,
    endRequired,
    startDateHelperText,
    endDateHelperText
  } = props;

  const rawStartDateValue = get(values, startName);
  const rawEndDateValue = get(values, endName);

  const formattedStartDateValue =
    (rawStartDateValue &&
      moment(rawStartDateValue).isValid() &&
      moment(rawStartDateValue).format(DATE_FORMAT.ShortDateFormat)) ||
    '';

  const formattedEndDateValue =
    (rawEndDateValue &&
      moment(rawEndDateValue).isValid() &&
      moment(rawEndDateValue).format(DATE_FORMAT.ShortDateFormat)) ||
    '';

  const dialogContext = useContext(DialogContext);

  const updateEndDate = useCallback(() => {
    const updateEndDateValue = moment(formattedStartDateValue).add(1, 'd').format(DATE_FORMAT.ShortDateFormat);
    setFieldValue(endName, updateEndDateValue, true);
  }, [formattedStartDateValue, endName, setFieldValue]);

  useEffect(() => {
    const showSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => {
      dialogContext.setSnackbar({ ...textDialogProps, open: true });
    };

    if (formattedEndDateValue && formattedStartDateValue >= formattedEndDateValue) {
      updateEndDate();
      showSnackBar({ snackbarMessage: 'Updated End Date to after selected Start Date.' });
    }
  }, [formattedStartDateValue, formattedEndDateValue, updateEndDate, dialogContext]);

  const fillInEmptyEndDate = () => {
    if (!formattedEndDateValue) {
      updateEndDate();
    }
  };

  return (
    <Grid container item spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          id="start_date"
          data-testid="start_date"
          name={startName}
          label="Start Date"
          variant="outlined"
          required={startRequired}
          value={formattedStartDateValue}
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
          error={get(touched, startName) && Boolean(get(errors, startName))}
          helperText={(get(touched, startName) && get(errors, startName)) || startDateHelperText}
          InputLabelProps={{
            shrink: true
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          id="end_date"
          data-testid="end_date"
          name={endName}
          label="End Date"
          variant="outlined"
          required={endRequired}
          value={formattedEndDateValue}
          type="date"
          onClick={() => {
            fillInEmptyEndDate();
          }}
          InputProps={{
            // Chrome min/max dates
            inputProps: {
              min: formattedStartDateValue,
              max: DATE_LIMIT.max,
              'data-testid': 'end-date'
            }
          }}
          inputProps={{
            // Firefox min/max dates
            min: formattedStartDateValue,
            max: DATE_LIMIT.max,
            'data-testid': 'end-date'
          }}
          onChange={handleChange}
          error={get(touched, endName) && Boolean(get(errors, endName))}
          helperText={(get(touched, endName) && get(errors, endName)) || endDateHelperText}
          InputLabelProps={{
            shrink: true
          }}
        />
      </Grid>
    </Grid>
  );
};

export default StartEndDateFields;
