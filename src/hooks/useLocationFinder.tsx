import { useCallback, useEffect, useState } from 'react';
import { useLocationFinderContext } from 'src/contexts/LocationFinderContext';
import { type Bounds, type Center, type Location, DEFAULT_CENTER, DEFAULT_ZOOM } from 'src/types';
import { calculateDistance, defaultOffsetCenter } from 'src/utils/helpers';
import { useEventListener, useWindowSize } from 'usehooks-ts';

const getBounds = (bounds: Bounds): google.maps.LatLngBounds => {
    if (bounds instanceof google.maps.LatLngBounds) {
        return bounds;
    }

    return new google.maps.LatLngBounds(bounds);
};

export const findLocationsInBounds = <T extends Object>(
    locations: Location<T>[],
    bounds: google.maps.LatLngBounds,
    center?: Center,
    zoom?: number
): Location<T>[] => {
    const listLocations = locations.filter((location) => bounds.contains(location.position));

    if (center && zoom && zoom > 10) {
        const sortedListLocations = listLocations
            .map((location) => ({ ...location, distance: calculateDistance(center, location.position) }))
            .sort((a, b) => a.distance - b.distance);

        return sortedListLocations;
    } else {
        return listLocations;
    }
};

export interface LocationFinderOptions<T extends object> {}

const useLocationFinder = <T extends Object>(options?: LocationFinderOptions<T>) => {
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
        selectedLocation,
        setSelectedLocation,
        listLocations,
        loading,
        map,
        setMap,
        setPage,
        setPendingRefine,
        pendingRefine,
        localeCenterMap,
        locale
    } = useLocationFinderContext<T>();

    const { width } = useWindowSize();

    // State.

    // Methods.
    const handleOnLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
        init(map);
    }, []);

    const handleOnChange = () => {
        setPendingRefine(true);
    };

    const handleOnLocaleChange = (locale: string) => {
        if (!map) {
            return;
        }

        // TODO
        // const center = options?.localeCenterMap?.get(locale) ?? DEFAULT_CENTER;
        // map.setCenter(center);

        // setDefaultCenter(center);
    };

    const handleOnKeyPress = (event: KeyboardEvent) => {
        if (event.key === 'Backspace' && selectedLocation) {
            handleOnBackClick();
        }
    };

    useEventListener('keypress', handleOnKeyPress);

    const refine = (defaultZoom?: number, defaultCenter?: Center) => {
        if (!map) {
            return;
        }

        const bounds = map.getBounds();
        const center = defaultCenter ?? map.getCenter();
        const zoom = defaultZoom ?? map.getZoom();

        if (bounds) {
            const listLocations = findLocationsInBounds(locations, bounds, center, zoom);
            setListLocations(listLocations);
        }
    };

    const init = (map: google.maps.Map) => {
        map.setZoom(defaultZoom);
        map.setCenter(defaultCenter);
        refine(defaultZoom, defaultCenter);
    };

    const reset = useCallback(() => {
        if (!map) {
            return;
        }

        map.setZoom(defaultZoom);
        map.setCenter(defaultCenter);

        setPendingRefine(true);
    }, [map]);

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

            const zoom = map.getZoom();
            const newZoom = zoom ? Math.max(12, zoom + 3) : 12;

            map.setZoom(newZoom);
            map.panTo(defaultOffsetCenter(map, location.position, width, newZoom));

            setSelectedLocation(location);
            setPendingRefine(true);
        },
        [map, width]
    );

    const handleOnCurrentLocationClick = useCallback(
        (lat: number, lng: number) => {
            if (!map) {
                return;
            }

            const newZoom = 12;

            map.setZoom(newZoom);
            map.panTo(defaultOffsetCenter(map, { lat, lng }, width, newZoom));

            setSelectedLocation(undefined);
            setPendingRefine(true);
        },
        [map, width]
    );

    const handleOnBackClick = useCallback(() => {
        if (!map) {
            return;
        }

        const center = localeCenterMap && locale ? localeCenterMap.get(locale) ?? DEFAULT_CENTER : DEFAULT_CENTER;

        map.setZoom(DEFAULT_ZOOM);
        map.panTo(center);

        setDefaultZoom(DEFAULT_ZOOM);
        setDefaultCenter(center);
        setSelectedLocation(undefined);
        setPendingRefine(true);
    }, [map]);

    // Life cycle.
    useEffect(() => {
        if (map) {
            map.setZoom(defaultZoom);
            setPendingRefine(true);
        }
    }, [map, defaultZoom]);

    useEffect(() => {
        if (map) {
            map.panTo(defaultCenter);
            setPendingRefine(true);
        }
    }, [map, defaultCenter]);

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
        reset,
        onIdle: handleOnIdle,
        onLoad: handleOnLoad,
        onChange: handleOnChange,
        onLocationClick: handleOnLocationClick,
        onCurrentLocationClick: handleOnCurrentLocationClick,
        onBackClick: handleOnBackClick,
        onLocaleChange: handleOnLocaleChange,

        setPage,
        pendingRefine,
        setPendingRefine
    };
};

export default useLocationFinder;
