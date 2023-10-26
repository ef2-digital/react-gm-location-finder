import { useCallback, useEffect, useState } from 'react';
import { useLocationFinderContext } from 'src/contexts/LocationFinderContext';
import type { Bounds, Location } from 'src/types';
import { calculateDistance, offsetCenter } from 'src/utils/helpers';

const getBounds = (bounds: Bounds): google.maps.LatLngBounds => {
    if (bounds instanceof google.maps.LatLngBounds) {
        return bounds;
    }

    return new google.maps.LatLngBounds(bounds);
};

const useLocationFinder = <T extends Object>() => {
    // Hooks.
    const {
        defaultBounds,
        defaultZoom,
        defaultCenter,
        defaultSearch,
        currentLocation,
        setDefaultBounds,
        setDefaultCenter,
        setDefaultSearch,
        setDefaultZoom,
        setListLocations,
        setCurrentLocation,
        locations,
        listLocations,
        loading,
        map,
        setMap
    } = useLocationFinderContext<T>();

    // State.

    const [pendingRefine, setPendingRefine] = useState<boolean>(false);
    const [previousZoom, setPreviousZoom] = useState<number>(defaultZoom);
    const [selectedLocation, setSelectedLocation] = useState<Location<T> | undefined>(undefined);

    // Methods.
    const handleOnLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
        reset(map);
    }, []);

    const handleOnChange = () => {
        setPendingRefine(true);
    };

    const refine = () => {
        if (!map) {
            return;
        }

        const bounds = map.getBounds();
        const center = map.getCenter();
        const zoom = map.getZoom();

        if (bounds) {
            const listLocations = locations.filter((location) => bounds.contains(location.position));

            if (center && zoom && zoom > 10) {
                const sortedListLocations = listLocations
                    .map((location) => ({ ...location, distance: calculateDistance(center, location.position) }))
                    .sort((a, b) => a.distance - b.distance);

                setListLocations(sortedListLocations);
            } else {
                setListLocations(listLocations);
            }
        }

        if (center) {
            setDefaultCenter(center);
        }

        if (zoom) {
            setDefaultZoom(zoom);
        }
    };

    const reset = (map: google.maps.Map) => {
        map.setZoom(defaultZoom);
        map.setCenter(defaultCenter);

        refine();
    };

    const handleOnIdle = () => {
        if (pendingRefine) {
            setPendingRefine(false);
            refine();
        }
    };

    const handleOnLocationClick = useCallback(
        (id: Location<T>['id']) => {
            if (!map) {
                return;
            }

            const location = locations.find((location) => location.id === id);

            if (!location) {
                return;
            }

            const previousZoom = map.getZoom();

            if (previousZoom) {
                setPreviousZoom(previousZoom);
            }

            map.setZoom(12);
            map.setCenter(offsetCenter(map, location.position));

            setPendingRefine(true);
            setSelectedLocation(location);
        },
        [map]
    );

    const handleOnBackClick = useCallback(() => {
        if (!map || !previousZoom) {
            return;
        }

        map.setZoom(previousZoom);

        setSelectedLocation(undefined);
        setPendingRefine(true);
    }, [map, previousZoom, setSelectedLocation, setPendingRefine]);

    // Life cycle.
    useEffect(() => {
        if (map) {
            map.setZoom(defaultZoom);
            setPendingRefine(true);
        }
    }, [map, defaultZoom]);

    useEffect(() => {
        if (map) {
            map.setCenter(defaultCenter);
            setPendingRefine(true);
        }
    }, [map, defaultCenter]);

    useEffect(() => {
        if (map) {
            map.fitBounds(defaultBounds);
            setPendingRefine(true);
        }
    }, [map, defaultBounds]);

    return {
        map,
        loading,
        locations,
        listLocations,
        selectedLocation,
        setSelectedLocation,
        currentLocation,

        defaultBounds,
        defaultCenter,
        defaultZoom,
        defaultSearch,

        setDefaultBounds,
        setDefaultCenter,
        setDefaultSearch,
        setDefaultZoom,
        setCurrentLocation,

        refine,
        onIdle: handleOnIdle,
        onLoad: handleOnLoad,
        onChange: handleOnChange,
        onLocationClick: handleOnLocationClick,
        onBackClick: handleOnBackClick
    };
};

export default useLocationFinder;
