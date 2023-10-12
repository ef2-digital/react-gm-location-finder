import { useCallback, useEffect, useState } from 'react';
import { useLocationFinderContext } from 'src/contexts/LocationFinderContext';
import type { Bounds, Center, Location } from 'src/types';
import { offsetCenter } from 'src/utils/helpers';
import usePagination from './usePagination';
import { get } from 'http';

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
        setListLocations,
        locations,
        listLocations,
        loading
    } = useLocationFinderContext<T>();

    // State.
    const [map, setMap] = useState<google.maps.Map>();
    const [pendingRefine, setPendingRefine] = useState<boolean>(false);
    const [previousZoom, setPreviousZoom] = useState<number>(defaultZoom);
    const [selectedLocation, setSelectedLocation] = useState<Location<T> | undefined>(undefined);
    const { getPage, loadMore } = usePagination<T>();

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

        if (bounds) {
            setListLocations(getPage(locations, getBounds(bounds)));
        }
    };

    const handleLoadMoreListLocations = () => {
        loadMore();
        refine();
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
        onBackClick: handleOnBackClick,
        loadMoreListLocations: handleLoadMoreListLocations
    };
};

export default useLocationFinder;
