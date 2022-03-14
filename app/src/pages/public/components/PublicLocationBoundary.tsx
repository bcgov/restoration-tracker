import Box from '@material-ui/core/Box';
import { IStaticLayer, IStaticLayerFeature } from 'components/map/components/StaticLayers';
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

  const [bounds, setBounds] = useState<any[] | undefined>([]);
  const [staticLayers, setStaticLayers] = useState<IStaticLayer[]>([]);

  useEffect(() => {
    const projectLocationFeatures: IStaticLayerFeature[] = location.geometry.map((geom: Feature) => {
      return { geoJSON: geom };
    });

    const allLayers: IStaticLayer[] = [{ layerName: 'Boundary', features: projectLocationFeatures }];

    setBounds(calculateUpdatedMapBounds(location.geometry));

    setStaticLayers(allLayers);
  }, [location.geometry]);

  return (
    <Box width="100%" height="100%" overflow="hidden" data-testid="map_container">
      <MapContainer mapId="project_location_form_map" staticLayers={staticLayers} bounds={bounds} />
    </Box>
  );
};

export default PublicLocationBoundary;
