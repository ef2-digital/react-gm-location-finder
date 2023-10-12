import { GoogleMap, GoogleMapProps } from '@react-google-maps/api';
import { PropsWithChildren, useCallback, useMemo } from 'react';
import useLocationFinder from 'src/hooks/useLocationFinder';
import Marker from './Marker';
import MapContent from './MapContent';
import { classNamesTailwind } from 'src/utils/helpers';

export interface MapProps extends GoogleMapProps {}

const CONTAINER_CLASS_NAME = 'w-full relative z-0 h-[60vh] min-h-[25rem] md:h-screen';

const Map = ({ children, mapContainerClassName, onLoad, onIdle, onDragEnd, onZoomChanged, ...props }: PropsWithChildren<MapProps>) => {
    const {
        onChange,
        defaultCenter,
        defaultZoom,
        onIdle: onIdleLocationFinder,
        onLoad: onLoadLocationFinder,
        loading
    } = useLocationFinder();

    const className = useMemo(() => classNamesTailwind(CONTAINER_CLASS_NAME, mapContainerClassName), [mapContainerClassName]);

    // Methods.
    const handleOnLoad = (map: google.maps.Map) => {
        onLoad?.(map);
        onLoadLocationFinder(map);
    };

    const handleOnIdle = () => {
        onIdle?.();
        onIdleLocationFinder();
    };

    const handleOnDragEnd = () => {
        onDragEnd?.();
        onChange();
    };

    const handleOnZoomChanged = () => {
        onZoomChanged?.();
        onChange();
    };

    if (loading) {
        return <div className={className}>{children}</div>;
    }

    return (
        <GoogleMap
            mapContainerClassName={className}
            onLoad={handleOnLoad}
            // Defaults.
            zoom={defaultZoom}
            center={defaultCenter}
            // Events.
            onZoomChanged={handleOnZoomChanged}
            onDragEnd={handleOnDragEnd}
            onIdle={handleOnIdle}
            {...props}
        >
            {children}
        </GoogleMap>
    );
};

Map.Marker = Marker;
Map.Content = MapContent;

export default Map;
