import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import React, { useEffect, useState } from 'react';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';

export interface IMultiAutocompleteFieldOption {
  value: string | number;
  label: string;
}

export interface IMultiAutocompleteField {
  id: string;
  label: string;
  required?: boolean;
  filterLimit?: number;
}

const MultiAutocompleteApiField: React.FC<IMultiAutocompleteField> = (props) => {
  const restorationTrackerApi = useRestorationTrackerApi();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([{ label: '', id: 0}]);
  const loading = open && options.length === 0;

  const onChangeHandle = async (value: any) => {
    const response = await restorationTrackerApi.searchTaxonomy.getSearchResults(value);
     
    setOptions(response.searchResponse);
  };        

  useEffect(() => {
    if (!open) { setOptions([]) }
  }, [open]);

  return (
    <Autocomplete
      filterOptions={(x) => x}
      autoHighlight={true}
      id={props.id}
      open={open}
      onOpen={() => { setOpen(true); }}
      onClose={() => { setOpen(false); }}
      getOptionLabel={option => option.label}
      options={options}
      loading={loading}
      renderInput={params => (
        <TextField
          {...params}
          label="Focal Species*"
          variant="outlined"
          onChange={ev => {
            if (ev.target.value !== "" || ev.target.value !== null) {
              onChangeHandle(ev.target.value);
            }
          }}
        />
      )}
    />
  );
};

export default MultiAutocompleteApiField;
