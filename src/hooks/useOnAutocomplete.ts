import { ChangeEvent, useCallback, useContext, useState } from 'react';
import { useOnLocationEvent } from './useOnLocationEvent';
import { MapContext } from '../contexts/mapContext';

export const useOnAutocomplete = () => {
  const { reset } = useOnLocationEvent();

  const {
    map,
    currentPosition,
    pendingRefine,
    setPendingRefine,
    setPosition,
    setShowDistance,
    showDistance,
  } = useContext(MapContext);

  const [autocomplete, setAutocomplete] = useState<
    google.maps.places.Autocomplete | undefined
  >();

  const loadAutocomplete = useCallback(
    (autocomplete: google.maps.places.Autocomplete) => {
      setAutocomplete(autocomplete);
    },
    [setAutocomplete, map]
  );

  const onInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      if (value === '') {
        reset();
      }
    },
    [map]
  );

  const onPlaceChange = useCallback(() => {
    if (!autocomplete || !map) {
      return;
    }
    const place = autocomplete.getPlace();
    const geometry = place.geometry;

    if (geometry?.viewport) {
      map.fitBounds(geometry.viewport);
    }

    if (geometry?.location) {
      map.setCenter(geometry.location);
    }

    setShowDistance(true);

    setPendingRefine(true);
  }, [autocomplete, map, showDistance]);

  const getLongAndLat = () => {
    return new Promise(
      (resolve: PositionCallback, reject: PositionErrorCallback) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
    );
  };

  const setCurrentGeoPosition = useCallback(async () => {
    const { coords } = await getLongAndLat();

    setPosition({
      lat: coords.latitude,
      lng: coords.longitude,
    });

    setShowDistance(true);
    setPendingRefine(true);

    map?.setCenter({
      lat: coords.latitude,
      lng: coords.longitude,
    });

    map?.setZoom(11);
  }, [map, currentPosition, pendingRefine, showDistance]);

  return {
    loadAutocomplete,
    autocomplete,
    onInputChange,
    onPlaceChange,
    setCurrentGeoPosition,
  };
};
