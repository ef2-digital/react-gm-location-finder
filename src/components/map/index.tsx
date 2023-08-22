import { useContext, useEffect } from 'react';
import {
  LocationFinderContext,
  LocationProps,
} from '../../contexts/locationFinderContext';
import Map from './Map';
import Marker from './Marker';
import { useOnLocationEvent } from '../../hooks/useOnLocationEvent';

const LocationFinderMap = () => {
  const { locations } = useContext(LocationFinderContext);
  const urlSearchParams = new URLSearchParams(document.location.search);
  const locationSlug = urlSearchParams.get('location');
  const { handleSelectedLocation } = useOnLocationEvent();

  useEffect(() => {
    if (locationSlug) {
      const result = locations
        .filter(
          location =>
            location.id === parseInt(locationSlug.split(/[- ]+/).pop()!)
        )
        .pop();

      if (result) {
        handleSelectedLocation(result);
      }
    }
  }, [locations]);

  return (
    <Map>
      {locations &&
        locations.map((location: LocationProps) => (
          <Marker key={`marker-${location.id}`} location={location} />
        ))}
    </Map>
  );
};

export default LocationFinderMap;
