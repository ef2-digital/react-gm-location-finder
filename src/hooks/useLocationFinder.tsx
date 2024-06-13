import { useCallback, useEffect, useState } from 'react';
import { useLocationFinderContext } from 'src/contexts/LocationFinderContext';
import { type Bounds, type Center, type Location, DEFAULT_CENTER, DEFAULT_ZOOM, DEFAULT_OFFSET_X } from 'src/types';
import { calculateDistance, defaultOffsetCenter, offsetCenter } from 'src/utils/helpers';
import { useEventListener, useWindowSize } from 'usehooks-ts';

const getBounds = (bounds: Bounds): google.maps.LatLngBounds => {
    if (bounds instanceof google.maps.LatLngBounds) {
        return bounds;
    }

    return new google.maps.LatLngBounds(bounds);
};

export const findLocationsInBounds = <T extends Object>(
    map: google.maps.Map,
    width: number,
    locations: Location<T>[],
    bounds: google.maps.LatLngBounds,
    center?: Center,
    zoom?: number
): Location<T>[] => {
    const listLocations = locations.filter((location) => bounds.contains(location.position));

    if (center && map && zoom && zoom > 10) {
        const sortedListLocations = listLocations
            .map((location) => ({
                ...location,
                distance: calculateDistance(center, defaultOffsetCenter(map, location.position, width, zoom))
            }))
            .sort((a, b) => a.distance - b.distance);

        return sortedListLocations;
    } else {
        return listLocations;
    }
};

export interface LocationFinderOptions<T extends object> {
    selectLocationAfterPlaceOrPositionChanged?: boolean;
    zoomAfterPlaceOrPostionChanged?: number;
}

const DEFAULT_ZOOM_AFTER_PLACE_OR_POSITION_CHANGED = 12;

const useLocationFinder = <T extends Object>(options?: LocationFinderOptions<T>) => {
    // Hooks.
    const {
        defaultBounds,
        defaultZoom,
        defaultCenter,
        defaultSearch,
        currentPosition,
        setDefaultBounds,
        setDefaultCenter,
        setDefaultSearch,
        setDefaultZoom,
        setListLocations,
        setCurrentPosition,
        setToBeRefinedBounds,
        setToBeRefinedCenter,
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
        toBeRefinedBounds,
        toBeRefinedCenter,
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
            const listLocations = findLocationsInBounds(map, width, locations, bounds, center, zoom);
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

    const updateMapAfterPlaceChanged = (map: google.maps.Map) => {
        if (!toBeRefinedCenter) {
            return;
        }

        const newZoom = options?.zoomAfterPlaceOrPostionChanged ?? DEFAULT_ZOOM_AFTER_PLACE_OR_POSITION_CHANGED;

        // Select location after place or position changed when option is enabled.
        if (toBeRefinedBounds && options?.selectLocationAfterPlaceOrPositionChanged) {
            const listLocations = findLocationsInBounds(map, width, locations, toBeRefinedBounds, toBeRefinedCenter, newZoom);

            if (Boolean(listLocations.length)) {
                const firstLocation = listLocations[0];
                const newCenter = firstLocation.position;
                const newCenterOffset = defaultOffsetCenter(map, newCenter, width, newZoom);

                map.setCenter(newCenterOffset);
                map.setZoom(newZoom);

                setDefaultCenter(newCenterOffset);
                setSelectedLocation(firstLocation);
                setDefaultZoom(newZoom);
                setToBeRefinedCenter(undefined);

                return;
            }
        }

        const newCenter = toBeRefinedCenter;
        const newCenterOffset = defaultOffsetCenter(map, newCenter, width, newZoom);

        map.setCenter(newCenterOffset);
        map.setZoom(newZoom);

        setDefaultCenter(newCenterOffset);
        setDefaultZoom(newZoom);
        setToBeRefinedCenter(undefined);
        refine();
    };

    useEffect(() => {
        if (map && toBeRefinedCenter) {
            // Rename.
            updateMapAfterPlaceChanged(map);
        }
    }, [toBeRefinedBounds, toBeRefinedCenter, map]);

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
                if (!toBeRefinedCenter) {
                    setToBeRefinedCenter({ lat, lng });
                }

                return;
            }

            const newZoom = 12;

            map.setZoom(newZoom);
            map.panTo(defaultOffsetCenter(map, { lat, lng }, width, newZoom));

            setSelectedLocation(undefined);
            setPendingRefine(true);
        },
        [map, width, toBeRefinedCenter]
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
        currentPosition,

        defaultBounds,
        defaultCenter,
        defaultZoom,
        defaultSearch,

        setDefaultBounds,
        setDefaultCenter,
        setDefaultSearch,
        setDefaultZoom,
        setCurrentPosition,

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
