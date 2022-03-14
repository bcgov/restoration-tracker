import Box from '@material-ui/core/Box';
import { IStaticElement } from 'components/map/components/StaticElements';
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

  const [bounds, setBounds] = useState<any[] | undefined>([]);
  const [nonEditableGeometries, setNonEditableGeometries] = useState<IStaticElement[]>([]);

  useEffect(() => {
    const nonEditableGeometriesResult = location.geometry.map((geom: Feature) => {
      return { geoJSON: geom };
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

export default LocationBoundary;
