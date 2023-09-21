import { set } from 'date-fns';
import { createContext, PropsWithChildren, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
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
    locations: Location[];
    filteredLocations: Location[];
    showDistance: boolean;
    inputRef?: React.RefObject<HTMLInputElement>;

    // Setters.
    setMap: (map: google.maps.Map) => void;
    setZoom: (zoom: number) => void;
    setCenter: (center: google.maps.LatLng | google.maps.LatLngLiteral) => void;
    setSelectedLocation: (location: Location) => void;
    setShowDistance: (showDistance: boolean) => void;

    // Methods.
    onIdle: () => void;
    onChange: () => void;
    onLocationClick: (location: Location) => void;
    onAutocompleteLoad: (autocomplete: google.maps.places.Autocomplete) => void;
    onPlaceChanged: () => void;
}

const LocationFinderContext = createContext<LocationFinderContextValue>({
    // Default values.
    zoom: DEFAULT_ZOOM,
    center: DEFAULT_CENTER,

    // Context.
    map: undefined,
    selectedLocation: undefined,
    locations: [],
    filteredLocations: [],
    showDistance: false,
    inputRef: undefined,

    // Setters.
    setMap: () => {},
    setZoom: () => {},
    setCenter: () => {},
    setSelectedLocation: () => {},
    setShowDistance: () => {},

    // Methods.
    onIdle: () => {},
    onChange: () => {},
    onPlaceChanged: () => {},
    onLocationClick: () => {},
    onAutocompleteLoad: () => {}
});

export interface LocationFinderProps<T extends object> {
    locations: Location<T>[];
    children?: ReactNode | ((value: LocationFinderContextValue) => ReactNode);
}

export const LocationFinderProvider = <T extends object>({ locations, children }: LocationFinderProps<T>) => {
    // Context.
    const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM);
    const [center, setCenter] = useState<google.maps.LatLng | google.maps.LatLngLiteral>(DEFAULT_CENTER);
    const [selectedLocation, setSelectedLocation] = useState<Location | undefined>(undefined);
    const [filteredLocations, setFilteredLocations] = useState<Location[]>(locations);
    const [map, setMap] = useState<google.maps.Map | undefined>(undefined);
    const [showDistance, setShowDistance] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // State.
    const [pendingRefine, setPendingRefine] = useState<boolean>(false);
    const [previousZoom, setPreviousZoom] = useState<number | undefined>(undefined);
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | undefined>(undefined);

    // Methods.
    const reset = useCallback(() => {
        if (!map) {
            return;
        }

        if (inputRef.current) {
            inputRef.current.value = '';
        }

        // map.fitBounds(bounds);
        map.setZoom(DEFAULT_ZOOM);

        setShowDistance(false);
        setFilteredLocations(locations);
    }, [map, inputRef, locations]);

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

    const handleOnChange = useCallback(() => {
        if (!map) {
            return;
        }

        setPendingRefine(true);
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

    const handeOnAutocompleteLoad = useCallback(
        (autocomplete: google.maps.places.Autocomplete) => {
            setAutocomplete(autocomplete);
        },
        [setAutocomplete]
    );

    const handleOnPlaceChanged = useCallback(() => {
        if (!autocomplete || !map) {
            return;
        }

        const place = autocomplete.getPlace();
        const geometry = place.geometry;

        if (geometry?.viewport) {
            map.fitBounds(geometry.viewport);
        }

        if (geometry?.location) {
            map.setCenter(offsetCenter(map, geometry.location));
        }

        setPendingRefine(true);
    }, [autocomplete, map]);

    // Life cycle.
    useEffect(() => {
        if (!map) {
            return setFilteredLocations(locations);
        }

        reset();
    }, [locations]);

    // Render.
    const value: LocationFinderContextValue = {
        map,
        zoom,
        center,
        inputRef,
        locations,
        showDistance,
        selectedLocation,
        filteredLocations,
        setMap,
        setZoom,
        setCenter,
        setShowDistance,
        setSelectedLocation,
        onIdle: handleOnIdle,
        onChange: handleOnChange,
        onPlaceChanged: handleOnPlaceChanged,
        onLocationClick: handleOnLocationClick,
        onAutocompleteLoad: handeOnAutocompleteLoad,
    };

    return (
        <LocationFinderContext.Provider value={value}>
            {typeof children === 'function' ? children(value) : children}
        </LocationFinderContext.Provider>
    );
};

const useLocationFinder = () => {
    return useContext(LocationFinderContext);
};

export default useLocationFinder;
