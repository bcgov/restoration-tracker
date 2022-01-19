
import React from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import Link from '@material-ui/core/Link';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { mdiArrowLeft } from '@mdi/js';
import Icon from '@mdi/react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    projectDetailDrawer: {
     '& .MuiDrawer-paper': {
       position: 'relative',
       overflow: 'hidden'
     }
    },
    projectDetailMain: {
      background: '#ffffff'
    },
    projectTitle: {
      margin: 0,
      fontSize: '1.5rem',
      fontWeight: 400
    },
    contentTitle: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      fontSize: '2rem'
    },
    projectMetadata: {
      overflowY: 'auto',
      backgroundColor: '#f5f5f5',

      // Metadata Definition Lists
      '& dl div + div': {
        marginTop: theme.spacing(0.25)
      },
      '& dd, dt': {
        display: 'inline-block',
        width: '50%',
      },

      '& h3': {
        // textTransform: 'uppercase',
        fontWeight: 700
      },
      '& section + hr': {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3)
      }
    },
    projectContactList: {
      marginLeft: 0,
      marginRight: 0,
      padding: 0,
      listStyleType: 'none',
      '& li + li': {
        marginTop: theme.spacing(1.5)
      }
    },
    treatmentsContainer: {
      display: 'none'
    }
  }),
);

/**
 * Project details content for a project.
 *
 * @return {*}
 */
 const RestoProjectDetailsPage: React.FC = () => {
  const classes = useStyles();

  // Funding Source Dialog Prototype
  const [openDialog, setOpenDialog] = React.useState(false);

  const fundingSourceDialogOpen = () => {
    setOpenDialog(true);
  };

  const fundingSourceDialogClose = () => {
    setOpenDialog(false);
  };

  // Radio Group Prototype
  const [reconValue, setReconValue] = React.useState('No');
  const handleReconValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReconValue((event.target as HTMLInputElement).value);
  };

  // Treatments
  const [treatmentValue, setTreatmentValue] = React.useState('No');
  const handleTreatmentValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTreatmentValue((event.target as HTMLInputElement).value);
  };

  // Treatments
  const [treatmentImplementedValue, setTreatmentImplementedValue] = React.useState('No');
  const handleTreatmentImplementedValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTreatmentImplementedValue((event.target as HTMLInputElement).value);
  };

  return (
    <>
      <Box display="flex" position="absolute" width="100%" height="100%" overflow="hidden">
        <Drawer variant="permanent" className={classes.projectDetailDrawer}>
          <Box display="flex" flexDirection="column" overflow="hidden" width="30rem" height="100%">
            <Box flex="0 auto" p={3}>
              <Box mb={2}>
                <Button
                  href="/projects"
                  size="small"
                  startIcon={<Icon path={mdiArrowLeft} size={0.875}></Icon>}
                >
                  Back to Projects
                </Button>
              </Box>
              <h1 className={classes.projectTitle}><b>Project -</b> My Project Name</h1>
            </Box>

            {/* Project Metadata */}
            <Box flex="1 auto" p={3} className={classes.projectMetadata}>

              <Box component="section">
                <Typography variant="body1" component={'h3'}>Objectives</Typography>
                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</Typography>
                </Box>
              </Box>

              <Divider></Divider>

              <Box component="section">
                <Typography variant="body1" component={'h3'} >General Information</Typography>
                <dl>
                  <div>
                    <Typography variant="body2" component="dd" color="textSecondary">Project Type:</Typography>
                    <Typography variant="body2" component="dt">Project Type</Typography>
                  </div>
                  <div>
                    <Typography variant="body2" component="dd" color="textSecondary">Start Date:</Typography>
                    <Typography variant="body2" component="dt">MMM DD, YYYY</Typography>
                  </div>
                  <div>
                    <Typography variant="body2" component="dd" color="textSecondary">Completion Date:</Typography>
                    <Typography variant="body2" component="dt">MMM DD, YYYY</Typography>
                  </div>
                </dl>
              </Box>

              <Divider></Divider>

              <Box component="section">
                <Typography variant="body1" component={'h3'} >Project Contacts</Typography>
                <ul className={classes.projectContactList}>
                  <li>
                    <div><strong>Contact Name</strong></div>
                    <div><Link href="#">email@email.com</Link></div>
                    <div>Agency Name</div>
                  </li>
                  <li>
                    <div><strong>Contact Name</strong></div>
                    <div><Link href="#">email@email.com</Link></div>
                    <div>Agency Name</div>
                  </li>
                </ul>
              </Box>

              <Divider></Divider>

              <Box component="section">
                <Typography variant="body1" component={'h3'} >IUCN Conservation Actions Classifications</Typography>
                <Box component='ul' pl={3}>
                  <li>
                    Classification &gt; Sub-classification &gt; Sub-classification
                  </li>
                  <li>
                    Classification &gt; Sub-classification &gt; Sub-classification
                  </li>
                </Box>
              </Box>

              <Divider></Divider>

              <Box component="section">
                <Typography variant="body1" component={'h3'} >Project Permits</Typography>
                <Box component='ul' pl={3}>
                  <li>
                    1234567890 (Wildlife Permit - General)
                  </li>
                  <li>
                    1234567890 (Wildlife Permit - General)
                  </li>
                </Box>
              </Box>

              <Divider></Divider>

              <Box component="section">
                <Typography variant="body1" component={'h3'} >Funding Sources</Typography>
                <ul className={classes.projectContactList}>
                  <li>
                    <div><strong>Funding Source Agency</strong></div>
                    <Box component="dl" mt={0.5} mb={0}>
                      <div>
                        <Typography variant="body2" component="dd" color="textSecondary">Amount:</Typography>
                        <Typography variant="body2" component="dt">$1,000,000</Typography>
                      </div>
                      <div>
                        <Typography variant="body2" component="dd" color="textSecondary">Project ID:</Typography>
                        <Typography variant="body2" component="dt">1234567890</Typography>
                      </div>
                      <div>
                        <Typography variant="body2" component="dd" color="textSecondary">Start Date:</Typography>
                        <Typography variant="body2" component="dt">MMM DD, YYYY</Typography>
                      </div>
                      <div>
                        <Typography variant="body2" component="dd" color="textSecondary">End Date:</Typography>
                        <Typography variant="body2" component="dt">MMM DD, YYYY</Typography>
                      </div>
                    </Box>
                  </li>
                  <li>
                    <div><strong>Funding Source Agency</strong></div>
                    <Box component="dl" mt={0.5} mb={0}>
                      <div>
                        <Typography variant="body2" component="dd" color="textSecondary">Amount:</Typography>
                        <Typography variant="body2" component="dt">$1,000,000</Typography>
                      </div>
                      <div>
                        <Typography variant="body2" component="dd" color="textSecondary">Project ID:</Typography>
                        <Typography variant="body2" component="dt">1234567890</Typography>
                      </div>
                      <div>
                        <Typography variant="body2" component="dd" color="textSecondary">Start Date:</Typography>
                        <Typography variant="body2" component="dt">MMM DD, YYYY</Typography>
                      </div>
                      <div>
                        <Typography variant="body2" component="dd" color="textSecondary">End Date:</Typography>
                        <Typography variant="body2" component="dt">MMM DD, YYYY</Typography>
                      </div>
                    </Box>
                  </li>
                </ul>
              </Box>

            </Box>
          </Box>
        </Drawer>

        <Box display="flex" flex="1 1 auto" alignItems="center" justifyContent="center" className={classes.projectDetailMain}>

          <div>Project Boundary Map</div>
          
          <Container maxWidth="xl" className={classes.treatmentsContainer}>
            <Box p={3}>
              <Box mb={1} display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h2" className={classes.contentTitle}>
                  Treatment Units
                </Typography>
                <Button
                  size="large"
                  variant="contained"
                  color="primary"
                  onClick={fundingSourceDialogOpen}
                >
                    Add Treatment Unit
                </Button>
              </Box>
              <Box mb={5}>
                <Typography variant="body1" color="textSecondary">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Typography>
              </Box>
              <Box>
                <Paper variant="outlined">
                  <Box p={3}></Box>
                </Paper>
              </Box>
            </Box>
          </Container>

        </Box>
      </Box>

      <Dialog open={openDialog} fullWidth aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Add Treatment Unit</DialogTitle>
        <DialogContent>
          <Box py={1}>
            <Box mb={4}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="ID"
                  >
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl 
                    fullWidth
                    variant="outlined">
                    <InputLabel id="linear-feature-type">Linear Feature Type</InputLabel>
                    <Select
                      labelId="linear-feature-type"
                      label="Linear Feature Type"
                      id="linear-feature-type-select"
                    >
                      <MenuItem value={1}>Pipeline</MenuItem>
                      <MenuItem value={2}>Railway</MenuItem>
                      <MenuItem value={3}>Roads</MenuItem>
                      <MenuItem value={4}>Seismic Lines</MenuItem>
                      <MenuItem value={5}>Trail</MenuItem>
                      <MenuItem value={6}>Transmission Line</MenuItem>
                      <MenuItem value={7}>Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Description of Treatment Unit"
                    multiline
                    rows={3}
                  >
                  </TextField>
                </Grid>
              </Grid>
            </Box>
            <Box mb={3}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Was reconnaissance conducted for this treatment unit?</FormLabel>
                <Box mt={2}>
                <RadioGroup aria-label="gender" name="priorityArea" value={reconValue} onChange={handleReconValue}>
                  <FormControlLabel value="priorityAreaYes" control={<Radio color="primary" />}  label="Yes" />
                  <FormControlLabel value="priorityAreaNo" control={<Radio color="primary" />} label="No" />
                </RadioGroup>
                </Box>
              </FormControl>
            </Box>
            <Box mb={3}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Leave treatment unit for natural recovery?</FormLabel>
                <Box mt={2}>
                <RadioGroup aria-label="gender" name="priorityArea" value={treatmentValue} onChange={handleTreatmentValue}>
                  <FormControlLabel value="treatmentNaturalRecoveryYes" control={<Radio color="primary" />}  label="Yes" />
                  <FormControlLabel value="treatmentNaturalRecoveryNo" control={<Radio color="primary" />} label="No" />
                </RadioGroup>
                </Box>
              </FormControl>
            </Box>

            <Box mb={3}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Was treatment implemented?</FormLabel>
                <Box mt={2}>
                <RadioGroup aria-label="gender" name="treatmentImplemented" value={treatmentImplementedValue} onChange={handleTreatmentImplementedValue}>
                  <FormControlLabel value="treatmentImplementedYes" control={<Radio color="primary" />}  label="Yes" />
                  <FormControlLabel value="treatmentImplementedNo" control={<Radio color="primary" />} label="No" />
                </RadioGroup>
                </Box>
              </FormControl>
            </Box>

            {treatmentImplementedValue === 'treatmentImplementedYes' && (
              <Box>
                <Box mb={2}>
                  <Typography variant="body1" color="textSecondary">Specify treatments applied to this unit</Typography>
                </Box>
                <FormControl 
                  fullWidth
                  variant="outlined">
                  <InputLabel id="treatments-label">Treatments</InputLabel>
                  <Select
                    labelId="treatments-label"
                    label="Treatments"
                    id="treatment-type-select"
                  >
                    <MenuItem value={1}>Debris rollback</MenuItem>
                    <MenuItem value={2}>Hummock placing</MenuItem>
                    <MenuItem value={3}>Screef</MenuItem>
                    <MenuItem value={4}>Seeding</MenuItem>
                    <MenuItem value={5}>Seedling Planting</MenuItem>
                    <MenuItem value={6}>Tree Bending</MenuItem>
                    <MenuItem value={7}>Tree Felling</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}

          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={fundingSourceDialogClose}>
            Add
          </Button>
          <Button variant="outlined" color="primary" onClick={fundingSourceDialogClose}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RestoProjectDetailsPage;
