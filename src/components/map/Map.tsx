import { GoogleMap, GoogleMapProps } from '@react-google-maps/api';
import { PropsWithChildren, useCallback } from 'react';
import useLocationFinder from 'src/hooks/useLocationFinder';
import Marker from './Marker';
import MapContent from './MapContent';
import { classNamesTailwind } from 'src/utils/helpers';
import { DEFAULT_ZOOM } from 'src/types';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { set } from 'date-fns';

export interface MapProps extends Omit<GoogleMapProps, 'onLoad' | 'zoom' | 'onZoomChanged' | 'onDragEnd' | 'center' | 'onIdle'> {}

const Map = ({ children, mapContainerClassName, ...props }: PropsWithChildren<MapProps>) => {
    const { setMap, map, onChange, zoom, setZoom, center, onIdle, loading } = useLocationFinder();

    if (loading) {
        // TODO Add loading component.
        return null;
    }

    return (
        <GoogleMap
            onLoad={setMap}
            zoom={zoom}
            onZoomChanged={onChange}
            onDragEnd={onChange}
            center={center}
            onIdle={onIdle}
            mapContainerClassName={classNamesTailwind('w-full relative z-0 h-[60vh] min-h-[25rem] md:h-screen', mapContainerClassName)}
            {...props}
        >
            {children}
        </GoogleMap>
    );
};

Map.Marker = Marker;
Map.Content = MapContent;

export default Map;
