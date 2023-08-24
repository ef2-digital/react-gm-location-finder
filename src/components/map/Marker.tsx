import { Marker as GoogleMapsMarker } from '@react-google-maps/api';
import { useOnLocationEvent } from '../../hooks/useOnLocationEvent';
import { LocationProps } from '../../contexts/locationFinderContext';
import { useContext } from 'react';
import { SettingContext } from '../../contexts/settingContext';

const Marker = ({ location }: { location: LocationProps }) => {
    const { onMarkerClick } = useOnLocationEvent();
    const { markerIcon } = useContext(SettingContext);

    return (
        <GoogleMapsMarker
            key={location.id}
            icon={
                markerIcon
                    ? {
                          url: markerIcon.url,
                          scaledSize: new google.maps.Size(markerIcon.width, markerIcon.height)
                      }
                    : undefined
            }
            position={location.position}
            onClick={(marker) => onMarkerClick(location)}
        />
    );
};

export default Marker;
