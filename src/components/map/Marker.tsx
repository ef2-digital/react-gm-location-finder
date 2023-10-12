import { Marker as GoogleMapMarker, MarkerProps as GoogleMapMarkerProps } from '@react-google-maps/api';
import useLocationFinder from 'src/hooks/useLocationFinder';
import { Location } from 'src/types';

interface MarkerProps extends Omit<GoogleMapMarkerProps, 'position' | 'onClick'> {
    location: Location;
}

const Marker = ({ location, ...props }: MarkerProps) => {
    const { onLocationClick } = useLocationFinder();

    return <GoogleMapMarker position={location.position} onClick={() => onLocationClick(location.id)} {...props} />;
};

export default Marker;
