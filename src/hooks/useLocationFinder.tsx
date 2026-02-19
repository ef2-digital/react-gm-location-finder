//@ts-nocheck
import { useCallback, useEffect, useRef } from 'react';
import { useLocationFinderContext } from 'src/contexts/LocationFinderContext';
import { type Center, DEFAULT_CENTER, DEFAULT_ZOOM, type Location } from 'src/types';
import {
    calculateDistance,
    defaultOffsetCenter,
    setLatLngSearchParams,
    getLatLngSearchParams,
    clearLatLngSearchParams,
    getCenterCoordinates
} from 'src/utils/helpers';
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
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    const swLat = sw.lat() - factor * (ne.lat() - sw.lat());
    const swLng = sw.lng() - factor * (ne.lng() - sw.lng());
    const neLat = ne.lat() + factor * (ne.lat() - sw.lat());
    const neLng = ne.lng() + factor * (ne.lng() - sw.lng());

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

    // Define a ref to store the previous state
    const previousStateRef = useRef({
        frozenCenter: null as Center | null,
        frozenZoom: null as number | null,
        lastBounds: null as google.maps.LatLngBounds | null
    });

    // Helper function to compare two centers (handles both LatLng objects and plain literals)
    const centersAreEqual = useCallback((a: Center | null | undefined, b: Center | null | undefined): boolean => {
        if (!a || !b) return false;
        const coordsA = getCenterCoordinates(a);
        const coordsB = getCenterCoordinates(b);
        return coordsA.lat === coordsB.lat && coordsA.lng === coordsB.lng;
    }, []);

    // Helper function to compare two bounds
    const boundsAreEqual = useCallback(
        (a: google.maps.LatLngBounds | null | undefined, b: google.maps.LatLngBounds | null | undefined): boolean => {
            if (!a || !b) return false;
            return a.equals(b);
        },
        []
    );

    // Define a helper function to set the previous state
    const setPreviousState = useCallback(
        (newState: { frozenCenter: Center | null; frozenZoom: number | null; lastBounds: google.maps.LatLngBounds | null }) => {
            previousStateRef.current = newState;
        },
        []
    );

    // Helper functions
    const centerOnClosestPin = useCallback(() => {
        if (!map || !locations.length) {
            return;
        }

        const currentBounds = map.getBounds();
        if (!currentBounds) {
            return;
        }

        const inBoundsLocations = findLocationsInBounds(map, width, locations, currentBounds, map.getCenter(), map.getZoom());

        if (!inBoundsLocations.length) return;

        const closestLocation = inBoundsLocations[0];
        const currentCenter = map.getCenter();
        if (currentCenter) {
            const distance = calculateDistance(currentCenter, closestLocation.position);
            // Only auto-center if within 50km to avoid jarring jumps
            if (distance < 50) {
                map.panTo(closestLocation.position);
            }
        }
    }, [map, locations, width]);

    const findNearestLocations = useCallback((center: google.maps.LatLng, locations: Location[], maxResults: number) => {
        return locations
            .map((location) => ({
                ...location,
                distance: calculateDistance(center, location.position)
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, maxResults);
    }, []);

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
                centersAreEqual(previousStateRef.current.frozenCenter, center) &&
                previousStateRef.current.frozenZoom === zoom &&
                boundsAreEqual(previousStateRef.current.lastBounds, bounds);

            if (isSameBounds) {
                return;
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
                let factor = 0.1;
                while (listLocations.length < PAGE_SIZE && factor < 1) {
                    bounds = expandBounds(bounds, factor);
                    listLocations = findLocationsInBounds(map, width, locations, bounds, center, zoom);
                    factor += 0.1;
                }
                return setListLocations(listLocations);
            }

            // No locations inside bounds
            setNoResultsBounds(true);
            const nearestLocations = findNearestLocations(center as google.maps.LatLng, locations, PAGE_SIZE);
            //@ts-ignore
            return setListLocations(nearestLocations);
        }, 300), // Increased from 200ms to 300ms
        [
            map,
            width,
            locations,
            frozenCenter,
            centersAreEqual,
            boundsAreEqual,
            setPreviousState,
            findNearestLocations,
            setListLocations,
            setNoResultsBounds
        ]
    );

    const init = useCallback(
        (map: google.maps.Map) => {
            map.setZoom(defaultZoom);
            map.setCenter(defaultCenter);
            refine(defaultZoom, defaultCenter);
        },
        [defaultZoom, defaultCenter, refine]
    );

    const reset = useCallback(() => {
        if (!map) {
            return;
        }

        map.setZoom(defaultZoom);
        map.setCenter(defaultCenter);
        setPendingRefine(true);
    }, [map, defaultZoom, defaultCenter, setPendingRefine]);

    // Event handlers - properly memoized
    const handleOnLoad = useCallback(
        (map: google.maps.Map) => {
            setMap(map);
            init(map);
        },
        [setMap, init]
    );

    const handleOnChange = useCallback(
        debounce(() => {
            setPendingRefine(true);
        }, 300),
        [setPendingRefine]
    );

    const handleOnIdle = useCallback(() => {
        if (pendingRefine) {
            setPendingRefine(false);
            refine();
        }
    }, [pendingRefine, refine, setPendingRefine]);

    const handleOnKeyPress = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === 'Backspace' && selectedLocation) {
                handleOnBackClick();
            }
        },
        [selectedLocation]
    );

    useEventListener('keypress', handleOnKeyPress);

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
        [map, width, locations, setSelectedLocation, setPendingRefine]
    );

    const handleOnCurrentLocationClick = useCallback(
        (lat: number, lng: number) => {
            setLatLngSearchParams(lat, lng);

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
            refine();
        },
        [map, width, toBeRefinedCenter, setFrozenCenter, setToBeRefinedCenter, setSelectedLocation, setPendingRefine, refine]
    );

    const handleOnBackClick = useCallback(() => {
        clearLatLngSearchParams();

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
    }, [map, localeCenterMap, locale, setDefaultZoom, setDefaultCenter, setFrozenCenter, setSelectedLocation, setPendingRefine]);

    const handleOnLocaleChange = useCallback(
        (locale: string) => {
            if (!map) {
                return;
            }
        },
        [map]
    );

    // Effects
    useEffect(() => {
        if (!map || !listLocations || listLocations.length === 0) {
            return;
        }

        if (!selectedLocation) {
            centerOnClosestPin();
        }
    }, [map, listLocations.length, selectedLocation, centerOnClosestPin]);

    useEffect(() => {
        if (!map || !toBeRefinedCenter) {
            return;
        }

        const centerToProcess = toBeRefinedCenter;
        const coords = getCenterCoordinates(centerToProcess);

        const existingParams = getLatLngSearchParams();
        const isDefaultCenter = coords.lat === DEFAULT_CENTER.lat && coords.lng === DEFAULT_CENTER.lng;

        const newZoom =
            width > 768
                ? options?.zoomAfterPlaceOrPostionChanged ?? DEFAULT_ZOOM_AFTER_PLACE_OR_POSITION_CHANGED
                : options?.zoomAfterPlaceOrPostionChangedMobile ?? DEFAULT_ZOOM_AFTER_PLACE_OR_POSITION_CHANGED_MOBILE;

        // Always update URL with zoom when user searches
        if (existingParams || !isDefaultCenter) {
            setLatLngSearchParams(coords.lat, coords.lng, newZoom);
        }

        const newCenterOffset = defaultOffsetCenter(map, centerToProcess, width, newZoom);
        const newCenterLiteral = getCenterCoordinates(newCenterOffset);

        map.setCenter(newCenterLiteral);
        map.setZoom(newZoom);

        setFrozenCenter(null);
        setDefaultCenter(newCenterLiteral);
        setDefaultZoom(newZoom);
        setToBeRefinedCenter(undefined);
        setPendingRefine(true);
    }, [
        toBeRefinedCenter,
        map,
        width,
        options?.zoomAfterPlaceOrPostionChanged,
        options?.zoomAfterPlaceOrPostionChangedMobile,
        setFrozenCenter,
        setDefaultCenter,
        setDefaultZoom,
        setToBeRefinedCenter,
        setPendingRefine
    ]);

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
