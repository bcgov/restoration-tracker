import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import InferredLocationDetails, { IInferredLayers } from 'components/boundary/InferredLocationDetails';
import MapContainer from 'components/map/MapContainer';
import { Feature } from 'geojson';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useEffect, useState } from 'react';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';

export interface IPublicLocationBoundaryProps {
  projectForViewData: IGetProjectForViewResponse;
  refresh: () => void;
}

/**
 * Location boundary content for a public (published) project.
 *
 * @return {*}
 */
const PublicLocationBoundary: React.FC<IPublicLocationBoundaryProps> = (props) => {
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

  useEffect(() => {
    const nonEditableGeometriesResult = location.geometry.map((geom: Feature) => {
      return { feature: geom };
    });

    setBounds(calculateUpdatedMapBounds(location.geometry));
    setNonEditableGeometries(nonEditableGeometriesResult);
  }, [location.geometry]);

  return (
    <Box>
      <Box mb={2}>
        <Typography variant="h3">Project Location</Typography>
      </Box>
      <Box mt={4} mb={4} height={500}>
        <MapContainer
          mapId="project_location_form_map"
          hideDrawControls={true}
          nonEditableGeometries={nonEditableGeometries}
          bounds={bounds}
          setInferredLayersInfo={setInferredLayersInfo}
        />
      </Box>
      <InferredLocationDetails layers={inferredLayersInfo} />
    </Box>
  );
};

export default PublicLocationBoundary;
