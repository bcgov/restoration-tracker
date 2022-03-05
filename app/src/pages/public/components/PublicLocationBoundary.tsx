import Box from '@material-ui/core/Box';
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
  const [nonEditableGeometries, setNonEditableGeometries] = useState<any[]>([]);

  useEffect(() => {
    const nonEditableGeometriesResult = location.geometry.map((geom: Feature, index) => {
      return { id: index, feature: geom };
    });

    setBounds(calculateUpdatedMapBounds(location.geometry));
    setNonEditableGeometries(nonEditableGeometriesResult);
  }, [location.geometry]);

  return (
    <Box width="100%" height="100%" overflow="hidden" data-testid="map_container">
      <MapContainer mapId="project_location_form_map" staticElements={nonEditableGeometries} bounds={bounds} />
    </Box>
  );
};

export default PublicLocationBoundary;
