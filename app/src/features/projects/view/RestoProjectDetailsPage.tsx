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
    }
  })
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

  return (
    <>
      <Box display="flex" height="100%">
        <Drawer variant="permanent" className={classes.projectDetailDrawer}>
          <Box display="flex" flexDirection="column" overflow="hidden" width="30rem" height="100%">
            <Box flex="0 auto" p={3}>
              <Box mb={2}>
                <Button href="/projects" size="small" startIcon={<Icon path={mdiArrowLeft} size={0.875}></Icon>}>
                  Back to Projects
                </Button>
              </Box>
              <h1 className={classes.projectTitle}>
                <b>Project -</b> My Project Name
              </h1>
            </Box>
            <Divider></Divider>
            <Box flex="1 auto" p={3}>
              <Typography variant="body1" color="textSecondary">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                deserunt mollit anim id est laborum.
              </Typography>
            </Box>
          </Box>
        </Drawer>
        <Box flex="1 1 auto" className={classes.projectDetailMain}>
          <Container maxWidth="xl">
            <Box p={3}>
              <Box mb={1} display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h2" className={classes.contentTitle}>
                  Treatment Units
                </Typography>
                <Button size="large" variant="contained" color="primary" onClick={fundingSourceDialogOpen}>
                  Add Treatment Unit
                </Button>
              </Box>
              <Box mb={5}>
                <Typography variant="body1" color="textSecondary">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                  dolore magna aliqua.
                </Typography>
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
                  <TextField fullWidth variant="outlined" label="ID"></TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="linear-feature-type">Linear Feature Type</InputLabel>
                    <Select labelId="linear-feature-type" label="Linear Feature Type" id="linear-feature-type-select">
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
                    rows={4}></TextField>
                </Grid>
              </Grid>
            </Box>
            <Box mb={3}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Was reconnaissance conducted for this treatment unit?</FormLabel>
                <Box mt={2}>
                  <RadioGroup aria-label="gender" name="priorityArea" value={reconValue} onChange={handleReconValue}>
                    <FormControlLabel value="priorityAreaYes" control={<Radio color="primary" />} label="Yes" />
                    <FormControlLabel value="priorityAreaNo" control={<Radio color="primary" />} label="No" />
                  </RadioGroup>
                </Box>
              </FormControl>
            </Box>
            <Box>
              <FormControl component="fieldset">
                <FormLabel component="legend">Leave treatment unit for natural recovery?</FormLabel>
                <Box mt={2}>
                  <RadioGroup
                    aria-label="gender"
                    name="priorityArea"
                    value={treatmentValue}
                    onChange={handleTreatmentValue}>
                    <FormControlLabel value="priorityAreaYes" control={<Radio color="primary" />} label="Yes" />
                    <FormControlLabel value="priorityAreaNo" control={<Radio color="primary" />} label="No" />
                  </RadioGroup>
                </Box>
              </FormControl>
            </Box>
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
