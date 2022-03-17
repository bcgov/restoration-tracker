import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { mdiMenuDown } from '@mdi/js';
import Icon from '@mdi/react';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetProjectTreatment, TreatmentSearchCriteria } from 'interfaces/useProjectApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

export interface IProjectSpatialUnitsProps {
  treatmentList: IGetProjectTreatment[];
  getTreatments: (forceFetch: boolean, selectedYears?: TreatmentSearchCriteria) => void;
}

/**
 * General information content for a project.
 *
 * @return {*}
 */
const PublicTreatmentSpatialUnits: React.FC<IProjectSpatialUnitsProps> = (props) => {
  const { getTreatments } = props;
  const urlParams = useParams();
  const projectId = urlParams['id'];
  const restorationTrackerApi = useRestorationTrackerApi();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const [isTreatmentLoading, setIsTreatmentLoading] = useState(false);

  const [yearList, setYearList] = useState<{ year: number }[]>([]);
  const [selectedSpatialLayer, setSelectedSpatialLayer] = useState({ boundary: true });

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);

  const handleClose = () => setAnchorEl(null);

  const handleSelectedSwitch = (selectedName: string | number) => {
    setSelectedSpatialLayer({
      ...selectedSpatialLayer,
      [selectedName]: !selectedSpatialLayer[selectedName]
    });

    const selectedArray: TreatmentSearchCriteria = { years: [] };

    Object.keys(selectedSpatialLayer).forEach((key) => {
      //handles async discrepancies for selected years
      if ((selectedSpatialLayer[key] && key !== selectedName) || (key === selectedName && !selectedSpatialLayer[key])) {
        selectedArray.years.push(key);
      }
    });

    getTreatments(true, selectedArray);
  };

  const getTreatmentYears = useCallback(
    async (forceFetch: boolean) => {
      if (yearList.length && !forceFetch) return;

      try {
        const yearsResponse = await restorationTrackerApi.public.project.getProjectTreatmentsYears(projectId);

        if (!yearsResponse) return;

        yearsResponse.sort();

        setYearList(yearsResponse);

        yearsResponse.forEach((year) => {
          selectedSpatialLayer[String(year.year)] = true;
        });
      } catch (error) {
        return error;
      }
    },
    [restorationTrackerApi.public.project, projectId, yearList.length, selectedSpatialLayer]
  );

  useEffect(() => {
    if (!isTreatmentLoading && !yearList.length) {
      getTreatmentYears(true);
      setIsTreatmentLoading(true);
    }
  }, [getTreatmentYears, yearList.length, isTreatmentLoading]);

  return (
    <Box>
      <Toolbar>
        <Grid container alignItems="center" justify="space-between">
          <Grid item>
            <Button
              id={'open-layer-menu'}
              data-testid={'open-layer-menu'}
              variant="text"
              color="primary"
              title={'Open Layer Menu'}
              aria-label={'Open Layer Menu'}
              endIcon={<Icon path={mdiMenuDown} size={1} />}
              onClick={handleClick}>
              <strong>Project Layers ({yearList?.length})</strong>
            </Button>

            <Menu
              id="treatment-menu"
              anchorEl={anchorEl}
              getContentAnchorEl={null}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              open={Boolean(anchorEl)}
              onClose={handleClose}>
              <Box mt={1} width={300}>
                <Box m={2} p={1}>
                  <Typography>
                    <strong>TREATMENT UNIT LAYERS ({yearList?.length})</strong>
                  </Typography>
                </Box>

                {!yearList && <Typography>No Treatment Years Available</Typography>}
                {yearList.length >= 1 &&
                  yearList.map((year) => {
                    return (
                      <MenuItem
                        key={year.year}
                        selected={selectedSpatialLayer[year.year]}
                        onClick={() => handleSelectedSwitch(year.year)}
                        disableGutters>
                        <Checkbox checked={selectedSpatialLayer[year.year]} color="primary" />
                        <Box flexGrow={1}>Treatment Year {year.year}</Box>
                      </MenuItem>
                    );
                  })}
              </Box>
            </Menu>
          </Grid>
        </Grid>
      </Toolbar>
    </Box>
  );
};

export default PublicTreatmentSpatialUnits;
