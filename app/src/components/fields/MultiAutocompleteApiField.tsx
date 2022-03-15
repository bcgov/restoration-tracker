//import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import CircularProgress from "@material-ui/core/CircularProgress";
//import CheckBox from '@material-ui/icons/CheckBox';
//import CheckBoxOutlineBlank from '@material-ui/icons/CheckBoxOutlineBlank';
//import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import Autocomplete from '@material-ui/lab/Autocomplete';
//import { useFormikContext } from 'formik';
//import get from 'lodash-es/get';
import React, { useState, useEffect } from 'react';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';

export interface IMultiAutocompleteFieldOption {
  value: string | number;
  label: string;
}

export interface IMultiAutocompleteField {
  id: string;
  label: string;
  options: IMultiAutocompleteFieldOption[];
  required?: boolean;
  filterLimit?: number;
}

const MultiAutocompleteApiField: React.FC<IMultiAutocompleteField> = (props) => {
  //const { touched, errors, setFieldValue } = useFormikContext<IMultiAutocompleteFieldOption>();
  const restorationTrackerApi = useRestorationTrackerApi();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const loading = open && options.length === 0;

  const onChangeHandle = async (value: any) => {
    console.log(value);
    //const searchRequest = { terms: value} ;

    const response = restorationTrackerApi.searchTaxonomy.getSearchResults(value);

    console.log(response);
    setOptions([]);
  };        

  useEffect(() => {
    if (!open) { setOptions([]) }
  }, [open]);

  return (
    <Autocomplete
      autoHighlight={true}
      id={props.id}
      open={open}
      onOpen={() => { setOpen(true); }}
      onClose={() => { setOpen(false); }}
      //getOptionSelected={(option, value) => option.name === value.name}
      //getOptionLabel={option => option.name}
      options={options}
      loading={loading}
      renderInput={params => (
        <TextField
          {...params}
          label="Asynchronous"
          variant="outlined"
          onChange={ev => {
            // dont fire API if the user delete or not entered anything
            if (ev.target.value !== "" || ev.target.value !== null) {
              onChangeHandle(ev.target.value);
            }
          }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            )
          }}
        />
      )}
    />
  );
};

export default MultiAutocompleteApiField;
