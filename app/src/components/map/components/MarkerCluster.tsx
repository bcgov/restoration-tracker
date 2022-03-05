import { LatLngExpression } from 'leaflet';
import React, { ReactElement } from 'react';
import { Marker } from 'react-leaflet';
import { default as ReactLeafletMarkerClusterGroup } from 'react-leaflet-cluster';

export interface IMarker {
  position: LatLngExpression;
  popup?: ReactElement;
}

export interface IMarkerClusterProps {
  markers?: IMarker[];
}

const MarkerClusterGroup: React.FC<IMarkerClusterProps> = (props) => {
  if (!props.markers?.length) {
    return null;
  }

  return (
    <ReactLeafletMarkerClusterGroup chunkedLoading>
      {props.markers.map((item, index: number) => (
        <Marker key={index} position={item.position}>
          {item.popup}
        </Marker>
      ))}
    </ReactLeafletMarkerClusterGroup>
  );
};

export default MarkerClusterGroup;
