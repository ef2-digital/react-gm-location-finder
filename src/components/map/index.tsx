import { useContext } from 'react';
import { LocationFinderContext, LocationProps } from '../../contexts/locationFinderContext';
import Map from './Map';
import Marker from './Marker';

const LocationFinderMap = () => {
    const { locations } = useContext(LocationFinderContext);

    return (
        <Map>{locations && locations.map((location: LocationProps) => <Marker key={`marker-${location.id}`} location={location} />)}</Map>
    );
};

export default LocationFinderMap;
