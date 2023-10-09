import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { DEFAULT_CENTER, DEFAULT_ZOOM, Location } from 'src/types';
import { calculateDistance, offsetCenter } from 'src/utils/helpers';

// Context.
interface LocationFinderContextValue<T extends object> {
    zoom: number;
    center: google.maps.LatLng | google.maps.LatLngLiteral;

    // Context.
    map?: google.maps.Map;
    bounds?: google.maps.LatLngBounds;
    autocomplete?: google.maps.places.Autocomplete;
    selectedLocation?: Location;
    locations: Location[];
    filteredLocations: Location[];
    showDistance: boolean;
    inputRef?: React.RefObject<HTMLInputElement>;
    defaultSearch?: string;
    loading: boolean;

    // Setters.
    setMap: (map: google.maps.Map) => void;
    setZoom: (zoom: number) => void;
    setBounds: (bounds: google.maps.LatLngBounds) => void;
    setCenter: (center: google.maps.LatLng | google.maps.LatLngLiteral) => void;
    setSelectedLocation: (location: Location) => void;
    setShowDistance: (showDistance: boolean) => void;
    setDefaultSearch?: (search: string) => void;

    // Methods.
    onIdle: () => void;
    onChange: () => void;
    onLocationClick: (location: Location) => void;
    onAutocompleteLoad: (autocomplete: google.maps.places.Autocomplete) => void;
    onPlaceChanged: () => void;
    onBackClick: () => void;
}

const createLocationFinderContext = <T extends object = {}>() => {
    return createContext<LocationFinderContextValue<T>>({
        // Default values.
        zoom: DEFAULT_ZOOM,
        center: DEFAULT_CENTER,

        // Context.
        map: undefined,
        bounds: undefined,
        autocomplete: undefined,
        selectedLocation: undefined,
        locations: [],
        filteredLocations: [],
        showDistance: false,
        inputRef: undefined,
        defaultSearch: undefined,
        loading: true,

        // Setters.
        setMap: () => {},
        setZoom: () => {},
        setBounds: () => {},
        setCenter: () => {},
        setSelectedLocation: () => {},
        setShowDistance: () => {},

        // Methods.
        onIdle: () => {},
        onChange: () => {},
        onPlaceChanged: () => {},
        onLocationClick: () => {},
        onAutocompleteLoad: () => {},
        onBackClick: () => {}
    });
};

export interface LocationFinderProps<T extends object> {
    locations: Location<T>[];
    children?: ReactNode | ((value: LocationFinderContextValue<T>) => ReactNode);
    loading: boolean;
    afterRefine?: (zoom?: number, bounds?: google.maps.LatLngBounds, center?: google.maps.LatLng) => void;
}

export const LocationFinderProvider = <T extends object>({ locations, loading, children, afterRefine }: LocationFinderProps<T>) => {
    // Context.
    const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM);
    const [center, setCenter] = useState<google.maps.LatLng | google.maps.LatLngLiteral>(DEFAULT_CENTER);
    const [selectedLocation, setSelectedLocation] = useState<Location | undefined>(undefined);
    const [filteredLocations, setFilteredLocations] = useState<Location[]>(locations);
    const [map, setMap] = useState<google.maps.Map | undefined>(undefined);
    const [showDistance, setShowDistance] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | undefined>(undefined);
    const [defaultSearch, setDefaultSearch] = useState<string | undefined>(undefined);
    const [bounds, setBounds] = useState<google.maps.LatLngBounds | undefined>(undefined);

    // State.
    const [pendingRefine, setPendingRefine] = useState<boolean>(false);
    const [previousZoom, setPreviousZoom] = useState<number | undefined>(undefined);

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
        setCenter(center);
        setBounds(bounds);

        if (zoom) {
            setZoom(zoom);
        }

        const listLocations = showDistance
            ? locations
                  .filter((location) => bounds.contains(location.position))
                  .map((location) => ({ ...location, distance: calculateDistance(center, location.position) }))
                  .sort((a, b) => a.distance - b.distance)
            : locations.filter((location) => bounds.contains(location.position));

        setFilteredLocations(listLocations);
        afterRefine && afterRefine(zoom, bounds, center);
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

    const handleOnBackClick = useCallback(() => {
        if (!map || !previousZoom) {
            return;
        }

        map.setZoom(previousZoom);

        setSelectedLocation(undefined);
        // onSelectedLocationChange({ location: undefined });
    }, [map, previousZoom]);

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
    const LocationFinderContext = createLocationFinderContext<T>();
    const value: LocationFinderContextValue<T> = {
        map,
        zoom,
        center,
        bounds,
        loading,
        inputRef,
        locations,
        autocomplete,
        showDistance,
        defaultSearch,
        selectedLocation,
        filteredLocations,
        setMap,
        setZoom,
        setBounds,
        setCenter,
        setShowDistance,
        setDefaultSearch,
        setSelectedLocation,
        onIdle: handleOnIdle,
        onChange: handleOnChange,
        onBackClick: handleOnBackClick,
        onPlaceChanged: handleOnPlaceChanged,
        onLocationClick: handleOnLocationClick,
        onAutocompleteLoad: handeOnAutocompleteLoad
    };

    return (
        <LocationFinderContext.Provider value={value}>
            {typeof children === 'function' ? children(value) : children}
        </LocationFinderContext.Provider>
    );
};

const useLocationFinder = <T extends object>() => {
    return useContext(createLocationFinderContext<T>());
};

export default useLocationFinder;
