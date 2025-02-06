import { useCallback, useEffect, useState } from 'react';
import { useLocationFinderContext } from 'src/contexts/LocationFinderContext';
import { type Bounds, type Center, type Location, DEFAULT_CENTER, DEFAULT_ZOOM, DEFAULT_OFFSET_X } from 'src/types';
import { calculateDistance, defaultOffsetCenter, offsetCenter } from 'src/utils/helpers';
import { useEventListener, useWindowSize } from 'usehooks-ts';
import { PAGE_SIZE } from './useLoadMore';

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

    if (center && map && zoom && zoom > 9) {
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
    zoomAfterPlaceOrPostionChangedMobile?: number;
}

const DEFAULT_ZOOM_AFTER_PLACE_OR_POSITION_CHANGED = 12;
const DEFAULT_ZOOM_AFTER_PLACE_OR_POSITION_CHANGED_MOBILE = 10;

const useLocationFinder = <T extends Object>(options?: LocationFinderOptions<T>) => {
    // Hooks.
    const {
        frozenCenter,
        setFrozenCenter,
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
        locale,
        setNoResultsBounds
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
        const center = frozenCenter ?? defaultCenter ?? map.getCenter();
        const zoom = defaultZoom ?? map.getZoom();

        if (bounds) {
            // Find locations inside the bounds
            const listLocations = findLocationsInBounds(map, width, locations, bounds, center, zoom);

            if (listLocations.length > 0) {
                setNoResultsBounds(false);

                // Add nearest locations if list is smaller than PAGE_SIZE
                if (listLocations.length < PAGE_SIZE) {
                    const remainingSlots = PAGE_SIZE - listLocations.length;
                    const nearestLocations = findNearestLocations(center as google.maps.LatLng, locations, remainingSlots);
                    const mergedLocations = [...listLocations, ...nearestLocations];

                    //@ts-ignore
                    return setListLocations(mergedLocations);
                }

                return setListLocations(listLocations);
            }

            // No locations inside bounds, set the flag and find nearest locations
            setNoResultsBounds(true);
            const nearestLocations = findNearestLocations(center as google.maps.LatLng, locations, PAGE_SIZE);

            //@ts-ignore
            return setListLocations(nearestLocations);
        }
    };

    const findNearestLocations = (center: google.maps.LatLng, locations: Location[], maxResults: number) => {
        return locations
            .map((location) => ({
                ...location,
                distance: getDistance(center.lat(), center.lng(), location.position.lat, location.position.lng)
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, maxResults);
    };

    const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLng = (lng2 - lng1) * (Math.PI / 180);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
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

        const newZoom =
            width > 768
                ? options?.zoomAfterPlaceOrPostionChanged ?? DEFAULT_ZOOM_AFTER_PLACE_OR_POSITION_CHANGED
                : options?.zoomAfterPlaceOrPostionChangedMobile ?? DEFAULT_ZOOM_AFTER_PLACE_OR_POSITION_CHANGED_MOBILE;

        // Select location after place or position changed when option is enabled.
        if (toBeRefinedBounds && options?.selectLocationAfterPlaceOrPositionChanged) {
            const listLocations = findLocationsInBounds(map, width, locations, toBeRefinedBounds, toBeRefinedCenter, newZoom);

            if (Boolean(listLocations.length)) {
                const firstLocation = listLocations[0];
                const newCenter = firstLocation.position;
                const newCenterOffset = defaultOffsetCenter(map, newCenter, width, newZoom);
                setFrozenCenter(newCenter);

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
        setFrozenCenter(newCenter);

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
            const desktop = width > 768;

            if (!location) {
                return;
            }

            const zoom = map.getZoom();
            const baseZoom = desktop ? 12 : 10;
            const newZoom = zoom ? Math.max(baseZoom, zoom + 3) : baseZoom;

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
                setFrozenCenter({ lat, lng });
                if (!toBeRefinedCenter) {
                    setToBeRefinedCenter({ lat, lng });
                }

                return;
            }

            const desktop = width > 768;
            const newZoom = desktop ? 12 : 10;

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
        setFrozenCenter(null);
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
