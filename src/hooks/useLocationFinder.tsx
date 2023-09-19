import { createContext, PropsWithChildren, ReactNode, useCallback, useContext, useState } from 'react';
import { DEFAULT_CENTER, DEFAULT_ZOOM, Location } from 'src/types';
import { calculateDistance, offsetCenter } from 'src/utils/helpers';

// Helper.

// Context.
interface LocationFinderContextValue {
    zoom: number;
    center: google.maps.LatLng | google.maps.LatLngLiteral;

    // Context.
    map?: google.maps.Map;
    selectedLocation?: Location;
    filteredLocations: Location[];

    // Setters.
    setMap: (map: google.maps.Map) => void;
    setZoom: (zoom: number) => void;
    setCenter: (center: google.maps.LatLng | google.maps.LatLngLiteral) => void;
    setSelectedLocation: (location: Location) => void;

    // Methods.
    onLocationClick: (location: Location) => void;
    onIdle: () => void;
}

const LocationFinderContext = createContext<LocationFinderContextValue>({
    // Default values.
    zoom: DEFAULT_ZOOM,
    center: DEFAULT_CENTER,

    // Context.
    map: undefined,
    selectedLocation: undefined,
    filteredLocations: [],

    // Setters.
    setMap: () => {},
    setZoom: () => {},
    setCenter: () => {},
    setSelectedLocation: () => {},

    // Methods.
    onLocationClick: () => {},
    onIdle: () => {}
});

export interface LocationFinderProps<T extends object> {
    locations: Location<T>[];
}

export const LocationFinder = <T extends object>({ locations, children }: PropsWithChildren<LocationFinderProps<T>>) => {
    // Context.
    const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM);
    const [center, setCenter] = useState<google.maps.LatLng | google.maps.LatLngLiteral>(DEFAULT_CENTER);
    const [selectedLocation, setSelectedLocation] = useState<Location | undefined>(undefined);
    const [filteredLocations, setFilteredLocations] = useState<Location[]>(locations);
    const [map, setMap] = useState<google.maps.Map | undefined>(undefined);

    // State.
    const [pendingRefine, setPendingRefine] = useState<boolean>(false);
    const [previousZoom, setPreviousZoom] = useState<number | undefined>(undefined);
    const [showDistance, setShowDistance] = useState<boolean>(false);

    // Methods.
    const reset = useCallback(() => {
        if (!map) {
            return;
        }

        // if (inputRef.current) {
        //     inputRef.current.value = '';
        // }

        // map.fitBounds(bounds);
        map.setZoom(DEFAULT_ZOOM);

        setShowDistance(false);
        setFilteredLocations(locations);
        // }, [map, inputRef]);
    }, [map]);

    const refine = useCallback(() => {
        if (!map) {
            return;
        }

        const zoom = map.getZoom();
        const bounds = map.getBounds();
        const center = map.getCenter();

        if (!bounds || !center) {
            return;
        }

        const showDistance = zoom ? zoom > 8 : false;
        setShowDistance(showDistance);

        const listLocations = showDistance
            ? locations
                  .filter((location) => bounds.contains(location.position))
                  .map((location) => ({ ...location, distance: calculateDistance(center, location.position) }))
                  .sort((a, b) => a.distance - b.distance)
            : locations.filter((location) => bounds.contains(location.position));

        setFilteredLocations(listLocations);
    }, [map]);

    const handleOnIdle = useCallback(() => {
        if (pendingRefine) {
            setPendingRefine(false);
            refine();
        }
    }, [pendingRefine, setPendingRefine]);

    const handleOnLocationClick = useCallback(
        (location: Location) => {
            if (!map) {
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

    // Render.
    return (
        <LocationFinderContext.Provider
            value={{
                map,
                zoom,
                center,
                selectedLocation,
                filteredLocations,
                setMap,
                setZoom,
                setCenter,
                setSelectedLocation,
                onLocationClick: handleOnLocationClick,
                onIdle: handleOnIdle
            }}
        >
            {children}
        </LocationFinderContext.Provider>
    );
};

const useLocationFinder = () => {
    return useContext(LocationFinderContext);
};

export default useLocationFinder;
