import { LatLngBoundsExpression } from 'leaflet';
import { useMap } from 'react-leaflet';

export interface IMapBoundsProps {
  bounds?: LatLngBoundsExpression;
}

const MapBounds: React.FC<IMapBoundsProps> = (props) => {
  const map = useMap();

  if (props.bounds) {
    map.fitBounds(props.bounds);
  }

  return null;
};

export default MapBounds;
