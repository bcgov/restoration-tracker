import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { mdiChevronRight } from '@mdi/js';
import Icon from '@mdi/react';
import FullScreenViewMapDialog from 'components/boundary/FullScreenViewMapDialog';
import InferredLocationDetails, { IInferredLayers } from 'components/boundary/InferredLocationDetails';
import MapContainer from 'components/map/MapContainer';
import { Feature } from 'geojson';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useEffect, useState } from 'react';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';

export interface ILocationBoundaryProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * Location boundary content for a project.
 *
 * @return {*}
 */
const LocationBoundary: React.FC<ILocationBoundaryProps> = (props) => {
  const {
    projectForViewData: { location }
  } = props;

  const [inferredLayersInfo, setInferredLayersInfo] = useState<IInferredLayers>({
    parks: [],
    nrm: [],
    env: [],
    wmu: []
  });
  const [bounds, setBounds] = useState<any[] | undefined>([]);
  const [nonEditableGeometries, setNonEditableGeometries] = useState<any[]>([]);
  const [showFullScreenViewMapDialog, setShowFullScreenViewMapDialog] = useState<boolean>(false);

  useEffect(() => {
    const nonEditableGeometriesResult = location.geometry.map((geom: Feature) => {
      return { feature: geom };
    });

    setBounds(calculateUpdatedMapBounds(location.geometry));
    setNonEditableGeometries(nonEditableGeometriesResult);
  }, [location.geometry]);

  const handleDialogViewOpen = () => {
    setShowFullScreenViewMapDialog(true);
  };

  const handleClose = () => {
    setShowFullScreenViewMapDialog(false);
  };

  return (
    <>
      <FullScreenViewMapDialog
        open={showFullScreenViewMapDialog}
        onClose={handleClose}
        map={
          <MapContainer
            mapId="project_location_form_map"
            hideDrawControls={true}
            scrollWheelZoom={true}
            data-testid="LargeMapContainer"
            nonEditableGeometries={nonEditableGeometries}
            bounds={bounds}
            setInferredLayersInfo={setInferredLayersInfo}
          />
        }
        layers={<InferredLocationDetails layers={inferredLayersInfo} />}
        backButtonTitle={'Back To Project'}
        mapTitle={'Project Location'}
      />

      <Box width="100%" height="100%" overflow="hidden" data-testid="mapContainer">
        <MapContainer
          mapId="project_location_form_map"
          hideDrawControls={true}
          nonEditableGeometries={nonEditableGeometries}
          bounds={bounds}
          setInferredLayersInfo={setInferredLayersInfo}
        />
      </Box>

      <Box hidden>
        <InferredLocationDetails layers={inferredLayersInfo} />
        <Button
          variant="text"
          color="primary"
          className="sectionHeaderButton"
          onClick={() => handleDialogViewOpen()}
          title="Expand Location"
          aria-label="Show Expanded Location"
          endIcon={<Icon path={mdiChevronRight} size={0.875} />}>
          Show More
        </Button>
      </Box>

    </>
  );
};

export default LocationBoundary;
