import { Feature } from 'geojson';
import * as L from 'leaflet';
import React, { ReactElement } from 'react';
import { GeoJSON, Popup, Tooltip } from 'react-leaflet';

export interface IStaticElement {
  id: string | number;
  geoJSON: Feature;
  GeoJSONProps?: Partial<React.ComponentProps<typeof GeoJSON>>;
  popup?: ReactElement;
  PopupProps?: Partial<React.ComponentProps<typeof Popup>>;
  tooltip?: ReactElement;
  TooltipProps?: Partial<React.ComponentProps<typeof Tooltip>>;
}

export interface IStaticFeaturesProps {
  features?: IStaticElement[];
}

const StaticElements: React.FC<IStaticFeaturesProps> = (props) => {
  if (!props.features?.length) {
    return null;
  }

  return (
    <>
      {props.features.map((item, index) => {
        return (
          <GeoJSON
            key={`static-feature-${item.id}-${index}`}
            pointToLayer={(feature, latlng) => {
              if (feature.properties?.radius) {
                return new L.Circle([latlng.lat, latlng.lng], feature.properties.radius);
              }

              return new L.Marker([latlng.lat, latlng.lng]);
            }}
            data={item.geoJSON}
            {...item.GeoJSONProps}>
            {item.tooltip && (
              <Tooltip key={`static-feature-tooltip-${item.id}-${index}`} direction="top" {...item.TooltipProps}>
                {item.tooltip}
              </Tooltip>
            )}
            {item.popup && (
              <Popup
                key={`static-feature-popup-${item.id}-${index}`}
                keepInView={false}
                autoPan={false}
                {...item.PopupProps}>
                {item.popup}
              </Popup>
            )}
          </GeoJSON>
        );
      })}
    </>
  );
};

export default StaticElements;
