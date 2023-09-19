import { GoogleMap, GoogleMapProps } from '@react-google-maps/api';
import { PropsWithChildren } from 'react';
import useLocationFinder from 'src/hooks/useLocationFinder';

interface MapProps extends Omit<GoogleMapProps, 'onLoad' | 'zoom' | 'center' | 'onIdle'> {}

const Map = ({ children, ...props }: PropsWithChildren<MapProps>) => {
    const { setMap, zoom, center, onIdle } = useLocationFinder();

    return (
        <GoogleMap onLoad={setMap} zoom={zoom} center={center} onIdle={onIdle} {...props}>
            {children}
        </GoogleMap>
    );
};

export default Map;
