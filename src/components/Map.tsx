import { GoogleMap, GoogleMapProps } from '@react-google-maps/api';
import { PropsWithChildren } from 'react';
import useLocationFinder from 'src/hooks/useLocationFinder';
import Marker from './Marker';
import Content from './Content';
import { classNamesTailwind } from 'src/utils/helpers';

interface MapProps extends Omit<GoogleMapProps, 'onLoad' | 'zoom' | 'onZoomChanged' | 'onDragEnd' | 'center' | 'onIdle'> {}

const Map = ({ children, mapContainerClassName, ...props }: PropsWithChildren<MapProps>) => {
    const { setMap, onChange, zoom, center, onIdle } = useLocationFinder();

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
Map.Content = Content;

export default Map;
