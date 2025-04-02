//@ts-nocheck
import { useCallback, useEffect, useRef } from 'react';
import { useLocationFinderContext } from 'src/contexts/LocationFinderContext';
import { type Center, DEFAULT_CENTER, DEFAULT_ZOOM, type Location } from 'src/types';
import { calculateDistance, defaultOffsetCenter } from 'src/utils/helpers';
import { useEventListener, useWindowSize } from 'usehooks-ts';
import { PAGE_SIZE } from './useLoadMore';
import { debounce } from 'lodash-es';

export const findLocationsInBounds = <T extends Object>(
    map: google.maps.Map,
    width: number,
    locations: Location<T>[],
    bounds: google.maps.LatLngBounds,
    center?: Center,
    zoom?: number
): Location<T>[] => {
    const listLocations = locations
        .filter((location) => bounds.contains(location.position))
        .map((location) => {
            delete location.distance;
            return location;
        });

    return listLocations
        .map((location) => {
            return {
                ...location,
                distance: calculateDistance(center, defaultOffsetCenter(map, location.position, width, zoom))
            };
        })
        .sort((a, b) => a.distance - b.distance);
};

export const expandBounds = (bounds: google.maps.LatLngBounds, factor: number): google.maps.LatLngBounds => {
    const sw = bounds.getSouthWest(); // South-West corner of bounds
    const ne = bounds.getNorthEast(); // North-East corner of bounds

    // Calculate new corners by expanding bounds
    const swLat = sw.lat() - factor * (ne.lat() - sw.lat());
    const swLng = sw.lng() - factor * (ne.lng() - sw.lng());
    const neLat = ne.lat() + factor * (ne.lat() - sw.lat());
    const neLng = ne.lng() + factor * (ne.lng() - sw.lng());

    // Return new bounds
    return new google.maps.LatLngBounds(new google.maps.LatLng(swLat, swLng), new google.maps.LatLng(neLat, neLng));
};

export interface LocationFinderOptions<T extends object> {
    selectLocationAfterPlaceOrPositionChanged?: boolean;
    zoomAfterPlaceOrPostionChanged?: number;
    zoomAfterPlaceOrPostionChangedMobile?: number;
}

const DEFAULT_ZOOM_AFTER_PLACE_OR_POSITION_CHANGED = 14;
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

    useEffect(() => {
        if (!map || !listLocations || listLocations.length === 0) {
            console.log('Map or listLocations is not ready yet.');
            return;
        }

        // Automatically center on the closest pin in bounds when listLocations updates
        centerOnClosestPin();

        // Optionally: Zoom out to include all or nearest items that may not be in bounds
        zoomOutToNearestLocation();
    }, [map, listLocations]); // Trigger this effect whenever `map` or `listLocations`

    // Define a ref to store the previous state
    const previousStateRef = useRef({
        frozenCenter: null as google.maps.LatLng | null,
        frozenZoom: null as number | null,
        lastBounds: null as google.maps.LatLngBounds | null
    });

    // Define a helper function to set the previous state
    const setPreviousState = (newState: {
        frozenCenter: google.maps.LatLng | Center | null;
        frozenZoom: number | null;
        lastBounds: google.maps.LatLngBounds | null;
    }) => {
        previousStateRef.current = newState;
    };

    const { width } = useWindowSize();

    // State.

    // Methods.
    const handleOnLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
        init(map);
    }, []);

    const handleOnChange = useCallback(
        debounce(() => {
            setPendingRefine(true);
        }, 200),
        []
    );

    const handleOnLocaleChange = (locale: string) => {
        if (!map) {
            return;
        }
    };

    const handleOnKeyPress = (event: KeyboardEvent) => {
        if (event.key === 'Backspace' && selectedLocation) {
            handleOnBackClick();
        }
    };

    useEventListener('keypress', handleOnKeyPress);

    const centerOnClosestPin = <T extends Object>() => {
        // Ensure the map and location data exist
        if (!map || !locations.length) {
            return;
        }

        const currentBounds = map.getBounds(); // Get the current visible bounds

        if (!currentBounds) {
            return;
        }

        // Use the existing helper `findLocationsInBounds`
        const inBoundsLocations = findLocationsInBounds(
            map, // Current map object
            width, // Current window width
            locations, // All available locations
            currentBounds, // Current visible bounds
            map.getCenter(), // Current center
            map.getZoom() // Current zoom level
        );

        // If there are no locations in bounds, do nothing
        if (!inBoundsLocations.length) return;

        // The first location is the closest since `findLocationsInBounds` already sorts them by distance
        const closestLocation = inBoundsLocations[0];

        // Center the map to the closest pin
        map.setCenter(closestLocation.position);
    };

    const zoomOutToNearestLocation = <T extends Object>() => {
        if (!map || !locations.length) {
            return;
        }

        // Get the current bounds of the map
        const currentBounds = map.getBounds();
        if (!currentBounds) {
            return;
        }

        // Find locations outside of the current bounds
        const outOfBoundsLocations = locations.filter((location) => !currentBounds.contains(location.position));
        const inBoundsLocations = locations.filter((location) => currentBounds.contains(location.position));

        if (!outOfBoundsLocations.length || inBoundsLocations.length > 0) {
            return;
        }

        // Find the nearest location outside of bounds
        const nearestLocation = outOfBoundsLocations.reduce(
            (nearest, location) => {
                const distance = calculateDistance(map.getCenter(), location.position);
                return distance < nearest.distance ? { location, distance } : nearest;
            },
            { location: null, distance: Infinity }
        ).location;

        if (nearestLocation) {
            // Expand bounds to include the nearest location
            const expandedBounds = expandBounds(currentBounds, 0.5); // The factor 0.5 is adjustable
            expandedBounds.extend(nearestLocation.position);

            // Refit map bounds
            map.fitBounds(expandedBounds);

            // Optionally, set a minimal zoom level to prevent over-zooming out
            if (map.getZoom() < Math.min(DEFAULT_ZOOM_AFTER_PLACE_OR_POSITION_CHANGED, 5)) {
                map.setZoom(10); // Or any value that fits your UX constraints
            }
        }
    };

    const refine = useCallback(
        debounce((defaultZoom?: number, defaultCenter?: Center) => {
            if (!map) {
                return;
            }

            let bounds = map.getBounds();
            const center = frozenCenter ?? defaultCenter ?? map.getCenter();
            const zoom = defaultZoom ?? map.getZoom();

            // Compare with the previous state to decide if refinement is necessary
            const isSameBounds =
                previousStateRef.current.frozenCenter?.equals(center) &&
                previousStateRef.current.frozenZoom === zoom &&
                previousStateRef.current.lastBounds?.equals(bounds);

            if (isSameBounds) {
                return; // Skip refine if nothing has changed
            }

            // Update the previous state
            setPreviousState({
                frozenCenter: center,
                frozenZoom: zoom,
                lastBounds: bounds
            });

            if (bounds) {
                let listLocations = findLocationsInBounds(map, width, locations, bounds, center, zoom);

                // Dynamically widen bounds if fewer than PAGE_SIZE
                let factor = 0.1; // Widen factor (10%)
                while (listLocations.length < PAGE_SIZE && factor < 1) {
                    bounds = expandBounds(bounds, factor);
                    listLocations = findLocationsInBounds(map, width, locations, bounds, center, zoom);
                    factor += 0.1; // Increment widen factor
                }
                return setListLocations(listLocations);
            }

            // No locations inside bounds, set the flag and find nearest locations
            setNoResultsBounds(true);
            const nearestLocations = findNearestLocations(center as google.maps.LatLng, locations, PAGE_SIZE);

            //@ts-ignore
            return setListLocations(nearestLocations);
        }, 200),
        [map, width, locations, frozenCenter, setListLocations]
    );

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

        const newCenterOffset = defaultOffsetCenter(map, toBeRefinedCenter, width, newZoom);

        map.setCenter(newCenterOffset);
        map.setZoom(newZoom);

        setFrozenCenter(null);
        setDefaultCenter(newCenterOffset);
        setDefaultZoom(newZoom);
        refine();
        zoomOutToNearestLocation();
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

            console.log('Current location clicked:', lat, lng, map);

            setSelectedLocation(undefined);
            setPendingRefine(true);
            refine();
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
