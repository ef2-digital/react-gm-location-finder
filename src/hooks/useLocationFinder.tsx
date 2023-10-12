import { useCallback, useEffect, useState } from 'react';
import { useLocationFinderContext } from 'src/contexts/LocationFinderContext';
import type { Bounds, Center, Location } from 'src/types';
import { offsetCenter } from 'src/utils/helpers';

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
        setDefaultBounds,
        setDefaultCenter,
        setDefaultSearch,
        setDefaultZoom,
        locations,
        loading
    } = useLocationFinderContext<T>();

    // State.
    const [map, setMap] = useState<google.maps.Map>();
    const [listLocations, setListLocations] = useState<Location<T>[]>(locations);
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

    const refine = (bounds?: Bounds) => {
        if (!map) {
            return;
        }

        const newBounds = bounds ?? map.getBounds();

        if (!newBounds) {
            return;
        }

        const listLocations = locations.filter((location) => getBounds(newBounds).contains(location.position));

        setListLocations(listLocations);
    };

    const reset = (map: google.maps.Map) => {
        map.setZoom(defaultZoom);
        map.setCenter(defaultCenter);
        map.fitBounds(defaultBounds);

        refine(defaultBounds);
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
    }, [map, previousZoom]);

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

        defaultBounds,
        defaultCenter,
        defaultZoom,
        defaultSearch,

        setDefaultBounds,
        setDefaultCenter,
        setDefaultSearch,
        setDefaultZoom,

        refine,
        onIdle: handleOnIdle,
        onLoad: handleOnLoad,
        onChange: handleOnChange,
        onLocationClick: handleOnLocationClick,
        onBackClick: handleOnBackClick
    };
};

export default useLocationFinder;
