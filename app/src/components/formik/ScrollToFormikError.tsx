import { Snackbar } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { useFormikContext } from 'formik';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useEffect, useState } from 'react';

export const ScrollToFormikError: React.FC = () => {
  const formikProps = useFormikContext<IGetProjectForViewResponse>();
  const { submitCount, isValid, errors } = formikProps;
  const [openSnackbar, setOpenSnackbar] = useState({ open: false, msg: '' });

  useEffect(() => {
    if (isValid) {
      return;
    }

    const showSnackBar = (message: string) => {
      setOpenSnackbar({ open: true, msg: message });
    };

    const getFieldErrorNames = (obj: object, prefix = '', result: string[] = []) => {
      Object.keys(obj).forEach((key) => {
        const value = obj[key];
        if (!value) return;

        key = Number(key) || key === '0' ? `[${key}]` : key;

        var nextKey = prefix ? `${prefix}.${key}` : key;

        if (typeof value === 'object') {
          getFieldErrorNames(value, nextKey, result);
        } else {
          result.push(nextKey);
        }
      });
      return result;
    };

    const getFieldTitle = (absoluteErrorName: string) => {
      const fieldTitleArray = absoluteErrorName.split('.');
      const fieldTitleSplit = fieldTitleArray[fieldTitleArray.length - 1].split('_');
      var fieldTitleUpperCase = '';
      fieldTitleSplit.forEach((item) => {
        fieldTitleUpperCase += `${item.charAt(0).toUpperCase() + item.slice(1)} `;
      });
      return fieldTitleUpperCase;
    };

    const fieldErrorNames = getFieldErrorNames(errors);
    if (fieldErrorNames.length <= 0) {
      return;
    }

    const element = document.getElementsByName(fieldErrorNames[fieldErrorNames.length - 1]);
    if (element.length <= 0) {
      return;
    }

    const fieldTitle = getFieldTitle(fieldErrorNames[fieldErrorNames.length - 1]);

    showSnackBar(`ERROR: invalid form values: ${fieldTitle}`);
    element[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [submitCount, isValid, errors]);

  return (
    <>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        open={openSnackbar.open}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar({ open: false, msg: '' })}>
        <Alert severity="error">{openSnackbar.msg}</Alert>
      </Snackbar>
    </>
  );
};
