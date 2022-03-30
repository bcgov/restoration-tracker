import { Snackbar } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { useFormikContext } from 'formik';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useEffect, useState } from 'react';

export const ScrollToFormikError: React.FC = () => {
  const formikProps = useFormikContext<IGetProjectForViewResponse>();
  const { errors } = formikProps;
  const [openSnackbar, setOpenSnackbar] = useState({ open: false, msg: '' });

  //formik does not maintain object order, this list is to assist selecting top most error.
  const formikErrorTopDownList = [
    'project.project_name',
    'project.start_date',
    'project.objectives',
    'species.focal_species',
    'iucn.classificationDetails.classification',
    'iucn.classificationDetails.subClassification1',
    'iucn.classificationDetails.subClassification2',
    'permit.permits.permit_number',
    'permit.permits.permit_type',
    'location.region',
    'location.geometry'
  ];

  useEffect(() => {
    const showSnackBar = (message: string) => {
      setOpenSnackbar({ open: true, msg: message });
    };

    const getAllFieldErrorNames = (obj: object, prefix = '', result: string[] = []) => {
      Object.keys(obj).forEach((key) => {
        const value = obj[key];
        if (!value) return;

        key = Number(key) || key === '0' ? `[${key}]` : key;

        const nextKey = prefix ? `${prefix}.${key}` : key;

        if (typeof value === 'object') {
          getAllFieldErrorNames(value, nextKey, result);
        } else {
          result.push(nextKey);
        }
      });
      return result;
    };

    const getFirstErrorField = (errorArray: string[]) => {
      return formikErrorTopDownList.find((listError) => {
        return errorArray.find((trueError) => {
          return listError === trueError;
        });
      });
    };

    const getFieldTitle = (absoluteErrorName: string) => {
      const fieldTitleArray = absoluteErrorName.split('.');
      const fieldTitleSplit = fieldTitleArray[fieldTitleArray.length - 1].split('_');
      let fieldTitleUpperCase = '';
      fieldTitleSplit.forEach((item) => {
        fieldTitleUpperCase += `${item.charAt(0).toUpperCase() + item.slice(1)} `;
      });
      return fieldTitleUpperCase;
    };

    const fieldErrorNames = getAllFieldErrorNames(errors);

    const topFieldError = getFirstErrorField(fieldErrorNames);

    if (!topFieldError) {
      return;
    }

    const fieldTitle = getFieldTitle(topFieldError);
    showSnackBar(`Error Invalid Form Value: ${fieldTitle}`);

    const errorElement = document.getElementsByName(topFieldError);

    if (errorElement.length <= 0) {
      return;
    }

    errorElement[0].scrollIntoView({ behavior: 'smooth', block: 'center' });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors]);

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
