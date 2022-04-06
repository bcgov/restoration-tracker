import Box from '@material-ui/core/Box';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { IStaticLayer, IStaticLayerFeature } from 'components/map/components/StaticLayers';
import MapContainer from 'components/map/MapContainer';
import { IGetProjectForViewResponse, IGetProjectTreatment } from 'interfaces/useProjectApi.interface';
import React, { useEffect, useState } from 'react';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';
import { getFormattedTreatmentStringsByYear, groupTreatmentsByYear } from 'utils/treatments';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    mapContainer: {
      '& dl': {
        marginBottom: 0
      },
      '& dl div + div': {
        marginTop: theme.spacing(0.75)
      },
      '& dd, dt': {
        display: 'inline-block',
        verticalAlign: 'top'
      },
      '& dt': {
        width: '40%'
      },
      '& dd': {
        width: '60%'
      },
      '& dd span': {
        display: 'inline'
      },
      '& ul': {
        border: '1px solid #ccccccc',
        borderRadius: '4px'
      }
    }
  })
);

export interface ILocationBoundaryProps {
  projectForViewData: IGetProjectForViewResponse;
  treatmentList: IGetProjectTreatment[];
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

  const classes = useStyles();

  const [bounds, setBounds] = useState<any[] | undefined>([]);
  const [staticLayers, setStaticLayers] = useState<IStaticLayer[]>([]);

  useEffect(() => {
    const projectLocationFeatures: IStaticLayerFeature[] = location.geometry.map((item) => {
      return { geoJSON: item, GeoJSONProps: { style: { fillOpacity: 0.05, weight: 1 } } };
    });

    const treatmentFeatures: IStaticLayerFeature[] = [];

    treatmentList.forEach((item) => {
      if (!item.geometry) {
        return;
      }

      treatmentFeatures.push({
        key: item.id,
        geoJSON: item.geometry,
        GeoJSONProps: { style: { weight: 3 } },
        tooltip: <p>{`Treatment Unit ID: ${item.id}`}</p>,
        popup: <TreatmentPopup treatment={item} />
      });
    });

    const allLayers: IStaticLayer[] = [
      { layerName: 'Boundary', features: projectLocationFeatures },
      { layerName: 'Treatments', features: treatmentFeatures }
    ];

    setBounds(
      calculateUpdatedMapBounds([...projectLocationFeatures, ...treatmentFeatures].map((item) => item.geoJSON))
    );

    setStaticLayers(allLayers);
  }, [location.geometry, treatmentList]);

  return (
    <Box width="100%" height="100%" overflow="hidden" data-testid="map_container" className={classes.mapContainer}>
      <MapContainer
        mapId="project_location_form_map"
        staticLayers={staticLayers}
        bounds={bounds}
        scrollWheelZoom={false}
      />
    </Box>
  );
};

export default LocationBoundary;

const TreatmentPopup: React.FC<{ treatment: IGetProjectTreatment }> = (props) => {
  const { treatment } = props;

  const treatmentStrings = getFormattedTreatmentStringsByYear(groupTreatmentsByYear(treatment.treatments));

  return (
    <Box component="dl">
      <div>
        <Typography variant="body2" component="dt" color="textSecondary">
          ID
        </Typography>
        <Typography variant="body2" component="dd">
          {treatment.id}
        </Typography>
      </div>
      <div>
        <Typography variant="body2" component="dt" color="textSecondary">
          Type
        </Typography>
        <Typography variant="body2" component="dd">
          {treatment.type}
        </Typography>
      </div>
      <div>
        <Typography variant="body2" component="dt" color="textSecondary">
          Width (m)
        </Typography>
        <Typography variant="body2" component="dd">
          {treatment.width}
        </Typography>
      </div>
      <div>
        <Typography variant="body2" component="dt" color="textSecondary">
          Length (m)
        </Typography>
        <Typography variant="body2" component="dd">
          {treatment.length}
        </Typography>
      </div>
      <div>
        <Typography variant="body2" component="dt" color="textSecondary">
          Area (ha)
        </Typography>
        <Typography variant="body2" component="dd">
          {treatment.area}
        </Typography>
      </div>
      <div>
        <Typography variant="body2" component="dt" color="textSecondary">
          Treatments
        </Typography>
        <Typography variant="body2" component="dd">
          {(treatmentStrings.length > 1 && (
            <Box component="ul" pl={2} m={0}>
              {treatmentStrings.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </Box>
          )) ||
            treatmentStrings}
        </Typography>
      </div>
      <div>
        <Typography variant="body2" component="dt" color="textSecondary">
          Description
        </Typography>
        <Typography variant="body2" component="dd">
          {treatment.description}
        </Typography>
      </div>
      <div>
        <Typography variant="body2" component="dt" color="textSecondary">
          Comments
        </Typography>
        <Typography variant="body2" component="dd">
          {treatment.comments}
        </Typography>
      </div>
    </Box>
  );
};
