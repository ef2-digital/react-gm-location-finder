import { useCallback, useContext } from 'react';
import { LocationFinderContext } from '../contexts/locationFinderContext';
import { useLocations } from './useLocations';
import { MapContext } from '../contexts/mapContext';

export const useGoogleMapApi = () => {
  const { locations, refinedLocations } = useContext(LocationFinderContext);

  const { map, setMap, setPendingRefine, pendingRefine } = useContext(
    MapContext
  );

  const { formatListLocations } = useLocations();

  const loadMap = useCallback(
    (map: google.maps.Map) => {
      setMap(map);
    },
    [map]
  );

  const handleOnMapIdle = useCallback(() => {
    if (pendingRefine) {
      setPendingRefine(false);
      formatListLocations();
    }
  }, [pendingRefine, setPendingRefine, locations, refinedLocations]);

  return { loadMap, handleOnMapIdle };
};
