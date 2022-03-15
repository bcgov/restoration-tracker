import Box from '@material-ui/core/Box';
import { IStaticLayer, IStaticLayerFeature } from 'components/map/components/StaticLayers';
import MapContainer from 'components/map/MapContainer';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse, IGetProjectTreatment } from 'interfaces/useProjectApi.interface';
import React, { useEffect, useState } from 'react';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';

export interface ILocationBoundaryProps {
  projectForViewData: IGetProjectForViewResponse;
  treatmentList: IGetProjectTreatment[];
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
    projectForViewData: { location },
    treatmentList
  } = props;

  const [bounds, setBounds] = useState<any[] | undefined>([]);
  const [staticLayers, setStaticLayers] = useState<IStaticLayer[]>([]);

  useEffect(() => {
    const projectLocationFeatures: IStaticLayerFeature[] = location.geometry.map((item) => {
      return { geoJSON: item };
    });

    const treatmentFeatures: IStaticLayerFeature[] = [];

    treatmentList.forEach((item) => {
      if (!item.geometry) {
        return;
      }

      treatmentFeatures.push({ geoJSON: item.geometry });
    });

    const allLayers: IStaticLayer[] = [
      { layerName: 'Boundary', features: projectLocationFeatures },
      { layerName: 'Treatments', features: treatmentFeatures }
    ];

    setBounds(
      calculateUpdatedMapBounds([...projectLocationFeatures, ...treatmentFeatures].map((item) => item.geoJSON))
    );

    setStaticLayers(allLayers);
  }, [location.geometry]);

  return (
    <Box width="100%" height="100%" overflow="hidden" data-testid="map_container">
      <MapContainer mapId="project_location_form_map" staticLayers={staticLayers} bounds={bounds} />
    </Box>
  );
};

export default LocationBoundary;
