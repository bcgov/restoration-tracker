import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
// import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Select from '@material-ui/core/Select';
import Snackbar from '@material-ui/core/Snackbar';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { mdiCalendarEnd, mdiCalendarStart, mdiCurrencyUsd, mdiPlus, mdiTrashCanOutline, mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import React from 'react';

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formButtons: {
      '& button': {
        margin: theme.spacing(0.5),
      },
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
    },
    mapPreview: {
      minHeight: '30rem',
      background: '#f5f5f5'
    }
  }),
);


/**
 * Page for creating a new project.
 *
 * @return {*}
 */
const CreateRestoProjectPage: React.FC = () => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  // Funding Source Dialog Prototype
  const [openDialog, setOpenDialog] = React.useState(false);

  // Radio Group Prototype
  const [value, setValue] = React.useState('No');
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
  };

  // Save Draft Snackbar Indicator
  const saveDraft = () => {
    setOpen(true);
  };

  const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const fundingSourceDialogOpen = () => {
    setOpenDialog(true);
  };

  const fundingSourceDialogClose = () => {
    setOpenDialog(false);
  };

  return (
    <>
      <Box my={4}>
        <Container maxWidth="xl">
          
          <Box mb={5}>
            <Box mb={1}>
              <Typography variant="h1">Create Restoration Project</Typography>
            </Box>
            <Typography variant="body1" color="textSecondary">Configure and submit a new restoration project</Typography>
          </Box>
          
          <Box component={Paper} p={4}>
            
            {/* Project Details */}
            <Box mb={5}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <Typography variant="h2">General Information</Typography>
                  {/* <Typography variant="body1" color="textSecondary">General information about this restoration project</Typography> */}
                </Grid>
                <Grid item xs={12} md={9}>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="Project Name"
                      >
                      </TextField>
                    </Grid>
                    <Grid item xs={6} lg={3}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Icon path={mdiCalendarStart} size={1} color="primary"></Icon>
                            </InputAdornment>
                          ),
                        }}
                        label="Project Start Date"
                      >
                      </TextField>
                    </Grid>
                    <Grid item xs={6} lg={3}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Icon path={mdiCalendarEnd} size={1}></Icon>
                            </InputAdornment>
                          ),
                        }}
                        label="Completion Date"
                      >
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        label="Objectives"
                      >
                      </TextField>
                    </Grid>
                  </Grid>

                  <Box component="fieldset" mt={5} mx={0}>
                    <Typography component="legend">IUCN Conservation Actions Classifications (Optional)</Typography>
                    <Box mb={3} maxWidth={'72ch'}>
                      <Typography variant="body1" color="textSecondary">Conservation actions are specific actions or sets of tasks undertaken by project staff designed to reach each of the project's objectives.</Typography>
                    </Box>

                    {/* IUCN Classifications List */}
                    <List>
                      <ListItem className={classes.customListItem}>
                        <Grid container spacing={3}>
                          <Grid item xs={4}>
                            <FormControl 
                              fullWidth
                              variant="outlined">
                              <InputLabel id="iucn-classification">Classification</InputLabel>
                              <Select
                                labelId="iucn-classification"
                                label="Classification"
                                id="iucn-classification-select"
                              >
                                <MenuItem value={10}>Classification One</MenuItem>
                                <MenuItem value={20}>Classification Two</MenuItem>
                                <MenuItem value={30}>Classification Three</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={4}>
                            <FormControl 
                              fullWidth
                              variant="outlined">
                              <InputLabel id="sub-classification-1">Sub-classification</InputLabel>
                              <Select
                                labelId="sub-classification-1"
                                label="Sub-classification"
                                id="icun-subclass-select-1"
                              >
                                <MenuItem value={10}>Sub-classification</MenuItem>
                                <MenuItem value={20}>Sub-classification</MenuItem>
                                <MenuItem value={30}>Sub-classification</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={4}>
                            <FormControl 
                              fullWidth
                              variant="outlined">
                              <InputLabel id="sub-classification-2">Sub-classification</InputLabel>
                              <Select
                                labelId="sub-classification-2"
                                label="Sub-classification"
                                id="iucn-subclass-select-2"
                              >
                                <MenuItem value={10}>Sub-classification</MenuItem>
                                <MenuItem value={20}>Sub-classification</MenuItem>
                                <MenuItem value={30}>Sub-classification</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                        <ListItemSecondaryAction>
                          <IconButton edge="end">
                            <Icon path={mdiTrashCanOutline} size={1}></Icon>
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>

                    <Box mt={2}>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<Icon path={mdiPlus} size={1}></Icon>}>
                        Add Classification
                      </Button>
                    </Box>

                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Divider></Divider>
            
            {/* Contact */}
            <Box my={5}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <Typography variant="h2">Contact Information</Typography>
                  {/* <Typography variant="body1" color="textSecondary">Agency contact information for this project.</Typography> */}
                </Grid>
                <Grid item xs={12} md={6}>

                  <Box mb={3} maxWidth={'72ch'}>
                    <Typography variant="body1" color="textSecondary">Specify the primary contact information for this project.</Typography>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="First Name"
                      >
                      </TextField>
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="Last Name"
                      >
                      </TextField>
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="Email Address"
                      >
                      </TextField>
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        label="Agency Name"
                      >
                      </TextField>
                    </Grid>
                  </Grid>

                  <List hidden>
                    <ListItem className={classes.customListItem}>
                      <ListItemIcon>
                        <Radio edge="start" color="primary"></Radio>
                      </ListItemIcon>
                      <Grid container spacing={3}>
                        <Grid item xs={3}>
                          <TextField
                            fullWidth
                            variant="outlined"
                            label="First Name"
                          >
                          </TextField>
                        </Grid>
                        <Grid item xs={3}>
                          <TextField
                            fullWidth
                            variant="outlined"
                            label="Last Name"
                          >
                          </TextField>
                        </Grid>
                        <Grid item xs={3}>
                          <TextField
                            fullWidth
                            variant="outlined"
                            label="Email Address"
                          >
                          </TextField>
                        </Grid>
                        <Grid item xs={3}>
                          <TextField
                            fullWidth
                            variant="outlined"
                            label="Agency Name"
                          >
                          </TextField>
                        </Grid>
                      </Grid>
                      <ListItemSecondaryAction>
                        <IconButton edge="end">
                          <Icon path={mdiTrashCanOutline} size={1}></Icon>
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem className={classes.customListItem}>
                      <ListItemIcon>
                        <Radio edge="start" color="primary"></Radio>
                      </ListItemIcon>
                      <Grid container spacing={3}>
                        <Grid item xs={3}>
                          <TextField
                            fullWidth
                            variant="outlined"
                            label="First Name"
                          >
                          </TextField>
                        </Grid>
                        <Grid item xs={3}>
                          <TextField
                            fullWidth
                            variant="outlined"
                            label="Last Name"
                          >
                          </TextField>
                        </Grid>
                        <Grid item xs={3}>
                          <TextField
                            fullWidth
                            variant="outlined"
                            label="Email Address"
                          >
                          </TextField>
                        </Grid>
                        <Grid item xs={3}>
                          <TextField
                            fullWidth
                            variant="outlined"
                            label="Agency Name"
                          >
                          </TextField>
                        </Grid>
                      </Grid>
                      <ListItemSecondaryAction>
                        <IconButton edge="end">
                          <Icon path={mdiTrashCanOutline} size={1}></Icon>
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>

                  <Box mt={3}>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<Icon path={mdiPlus} size={1}></Icon>}>
                      Add New Contact
                    </Button>
                  </Box>

                </Grid>
              </Grid>
            </Box>

            <Divider></Divider>

            {/* Permits */}
            <Box my={5}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <Typography variant="h2">Permits</Typography>
                  {/* <Typography variant="body1" color="textSecondary">Permits required for this project.</Typography> */}
                </Grid>
                <Grid item xs={12} md={9}>
                  <Box mb={3} maxWidth={'72ch'}>
                    <Typography variant="body1" color="textSecondary"><strong>Note:</strong> For permit numbers, only provide the last 6 digits located after the hyphen (e.g. for KA12-845782 enter 845782)</Typography>
                  </Box>

                  {/* Permit List List */}
                  <Grid container spacing={3} hidden>
                    <Grid item xs={12} md={6}>
                      <List>
                        <ListItem className={classes.customListItem}>
                          <Grid container spacing={3}>
                            <Grid item xs={6}>
                              <FormControl 
                                fullWidth
                                variant="outlined">
                                <InputLabel id="permit-type-label">Permit Type</InputLabel>
                                <Select
                                  labelId="permit-type-label"
                                  label="Permit Type"
                                  id="permit-type-select"
                                >
                                  <MenuItem value={10}>Permit Type</MenuItem>
                                  <MenuItem value={20}>Permit Type</MenuItem>
                                  <MenuItem value={30}>Permit Type</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                              <TextField variant="outlined" label="Permit Number" type="number"></TextField>
                            </Grid>
                          </Grid>
                          <ListItemSecondaryAction>
                            <IconButton edge="end">
                              <Icon path={mdiTrashCanOutline} size={1}></Icon>
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>

                  <Box mt={2}>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<Icon path={mdiPlus} size={1}></Icon>}>
                      Add Permit
                    </Button>
                  </Box>

                </Grid>
              </Grid>
            </Box>

            <Divider></Divider>

            {/* Funding Sources and Partnerships */}
            <Box my={5}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <Typography variant="h2">Funding and Partnerships</Typography>
                  {/* <Typography variant="body2" color="textSecondary">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Typography> */}
                </Grid>
                <Grid item xs={12} md={9}>
                  
                  <Box component="fieldset" mx={0}>
                    <Typography component="legend">Funding Sources</Typography>
                    <Box mb={3} maxWidth={'72ch'}>
                      <Typography variant="body1" color="textSecondary">Specify all funding sources for the project.</Typography>
                    </Box>

                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<Icon path={mdiPlus} size={1}></Icon>}
                      onClick={fundingSourceDialogOpen}>
                      Add Funding Source
                    </Button>

                  </Box>

                  <Box component="fieldset" mt={5} mx={0}>
                    <Typography component="legend">Partnerships</Typography>
                    <Box mb={3} maxWidth={'72ch'}>
                      <Typography variant="body1" color="textSecondary">Specify any additional partnerships that have not been previously identified as a funding sources.</Typography>
                    </Box>

                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <FormControl 
                          fullWidth
                          variant="outlined">
                          <InputLabel id="partnerships-select-1-label">Indigenous Partners</InputLabel>
                          <Select
                            labelId="partnerships-select-1-label"
                            label="Indigenous Partners"
                            id="partnerships-select-1"
                          >
                            <MenuItem value={10}>Partner One</MenuItem>
                            <MenuItem value={20}>Partner Two</MenuItem>
                            <MenuItem value={30}>Partner Three</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl 
                          fullWidth
                          variant="outlined">
                          <InputLabel id="partnerships-select-2-label">Other Partners</InputLabel>
                          <Select
                            labelId="partnerships-select-2-label"
                            label="Other Partners"
                            id="partnerships-select-2"
                          >
                            <MenuItem value={10}>Partner One</MenuItem>
                            <MenuItem value={20}>Partner Two</MenuItem>
                            <MenuItem value={30}>Partner Three</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Box>

                </Grid>
              </Grid>
            </Box>

            <Divider></Divider>

            {/* Funding Sources and Partnerships */}
            <Box my={5}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <Typography variant="h2">Location</Typography>
                </Grid>
                <Grid item xs={12} md={9}>

                  <Box mb={5}>
                    <Box mb={2} maxWidth={'72ch'}>
                      <Typography variant="body1" color="textSecondary">
                        Specify the caribou range associate with this project.
                      </Typography>
                    </Box>
                    <Grid container spacing={3}>
                      <Grid item xs={6}>
                        <FormControl 
                          fullWidth
                          variant="outlined">
                          <InputLabel id="caribou-range-select-label">Caribou Range</InputLabel>
                          <Select
                            labelId="caribou-range-select-label"
                            label="Caribou Range"
                            id="caribou-range-select"
                          >
                            <MenuItem value={10}>Range One</MenuItem>
                            <MenuItem value={20}>Range Two</MenuItem>
                            <MenuItem value={30}>Range Three</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Box>

                  <Box mb={4}>
                    <FormControl component="fieldset">
                      <FormLabel component="legend">Is this location a priority area?</FormLabel>
                      <Box mt={2}>
                      <RadioGroup aria-label="gender" name="priorityArea" value={value} onChange={handleChange}>
                        <FormControlLabel value="priorityAreaYes" control={<Radio color="primary" />}  label="Yes" />
                        <FormControlLabel value="priorityAreaNo" control={<Radio color="primary" />} label="No" />
                      </RadioGroup>
                      </Box>
                    </FormControl>
                  </Box>

                  <Box component="fieldset">
                    <Typography component="legend">Project Boundary</Typography>
                    <Box mb={3} maxWidth={'72ch'}>
                      <Typography variant="body1" color="textSecondary">
                        Upload a shapefile or use the drawing tools on the map to define your project boundary (KML or shapefiles accepted).
                      </Typography>
                    </Box>
                  
                    {/* Use Upload Component */}
                    <Box mb={5}>
                      <input
                        accept="image/*"
                        className={classes.input}
                        id="contained-button-file"
                        multiple
                        type="file"
                      />
                      <label htmlFor="contained-button-file">
                        <Button
                          size="large"
                          variant="outlined"
                          color="primary"
                          component="span"
                          startIcon={<Icon path={mdiTrayArrowUp} size={1}></Icon>}>
                          Upload Boundary
                        </Button>
                      </label>
                    </Box>

                    <Box className={classes.mapPreview}>
                      
                    </Box>
                  </Box>

                </Grid>
              </Grid>
            </Box>

            <Divider></Divider>

            {/* Form Buttons */}
            <Box mt={5} className={classes.formButtons} display="flex" justifyContent="flex-end">
              <Button variant="outlined" color="primary" size="large" onClick={saveDraft}>Save Draft</Button>
              <Button variant="contained" color="primary" size="large">Create Project</Button>
              <Button variant="text" color="primary" size="large">Cancel</Button>
            </Box>

          </Box>
        </Container>
      </Box>

      {/* Save as Draft Notifications */}
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success">
          This is a success message!
        </Alert>
      </Snackbar>

      {/* Prototype Funding Source Dialog */}
      <Dialog open={openDialog} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Add Funding Source</DialogTitle>
        <DialogContent>
          <Box py={2}>
            <Grid container spacing={3}>
              <Grid item sm={12}>
                <TextField
                  variant="outlined"
                  autoFocus
                  id="agencyName"
                  label="Agency Name"
                  fullWidth
                />
              </Grid>
              <Grid item sm={12}>
                <TextField
                  variant="outlined"
                  id="projectID"
                  label="Project ID"
                  fullWidth
                />
              </Grid>
              <Grid item sm={6}>
                <TextField
                  variant="outlined"
                  id="fundingAmount"
                  label="Funding Amount"
                  type="number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon path={mdiCurrencyUsd} size={1} color="primary"></Icon>
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item sm={6}>
                <TextField
                  variant="outlined"
                  id="findingTimeline"
                  label="Funding Timeline"
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={fundingSourceDialogClose}>
            Add Funding Source
          </Button>
          <Button variant="outlined" color="primary" onClick={fundingSourceDialogClose}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateRestoProjectPage;