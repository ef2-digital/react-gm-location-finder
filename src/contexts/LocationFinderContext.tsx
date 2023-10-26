import { createContext, PropsWithChildren, ReactNode, useContext, useEffect, useState } from 'react';
import { Bounds, Center, DEFAULT_BOUNDS, DEFAULT_CENTER, DEFAULT_ZOOM, Location } from 'src/types';

// Context.
export interface LocationFinderContextValue<T extends object = {}> {
    map?: google.maps.Map;
    defaultZoom: number;
    defaultCenter: Center;
    defaultBounds: Bounds;
    defaultSearch?: string;

    currentLocation?: Center;

    loading: boolean;
    locations: Location<T>[];
    listLocations: Location<T>[];

    setDefaultZoom: (zoom: number) => void;
    setDefaultCenter: (center: Center) => void;
    setDefaultBounds: (bounds: Bounds) => void;
    setDefaultSearch: (search: string) => void;
    setListLocations: (locations: Location<T>[]) => void;
    setCurrentLocation: (center: Center) => void;
    setMap: (map: google.maps.Map) => void;
}

const LocationFinderContext = createContext<LocationFinderContextValue>({
    defaultZoom: DEFAULT_ZOOM,
    defaultCenter: DEFAULT_CENTER,
    defaultBounds: DEFAULT_BOUNDS,
    defaultSearch: undefined,

    currentLocation: undefined,

    loading: true,
    locations: [],
    listLocations: [],

    setDefaultZoom: () => {},
    setDefaultCenter: () => {},
    setDefaultBounds: () => {},
    setDefaultSearch: () => {},
    setListLocations: () => {},
    setCurrentLocation: () => {},
    setMap: () => {}
});

export interface LocationFinderProps<T extends object = {}> {
    locations: Location<T>[];
    children?: ReactNode | ((value: LocationFinderContextValue<T>) => ReactNode);
    loading: boolean;
}

export const LocationFinderProvider = <T extends object = {}>({
    locations,
    loading,
    children
}: PropsWithChildren<LocationFinderProps<T>>) => {
    // Context.
    const [map, setMap] = useState<google.maps.Map>();
    const [defaultZoom, setDefaultZoom] = useState<number>(DEFAULT_ZOOM);
    const [defaultCenter, setDefaultCenter] = useState<Center>(DEFAULT_CENTER);
    const [defaultBounds, setDefaultBounds] = useState<Bounds>(DEFAULT_BOUNDS);
    const [defaultSearch, setDefaultSearch] = useState<string | undefined>(undefined);
    const [listLocations, setListLocations] = useState<Location[]>(locations);
    const [currentLocation, setCurrentLocation] = useState<Center | undefined>(undefined);

    // TODO make code optional with options.
    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position: GeolocationPosition) => {
            setCurrentLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            });
        });
    }, [map, navigator, setCurrentLocation]);

    // Render.
    return (
        <LocationFinderContext.Provider
            value={{
                defaultBounds,
                defaultCenter,
                defaultZoom,
                defaultSearch,
                setDefaultZoom,
                setDefaultBounds,
                setDefaultCenter,
                setDefaultSearch,
                setMap,
                map,
                loading,
                locations,
                listLocations,
                setListLocations,
                currentLocation,
                setCurrentLocation
            }}
        >
            {children}
        </LocationFinderContext.Provider>
    );
};

export const useLocationFinderContext = <T extends object = {}>(): LocationFinderContextValue<T> => {
    return useContext(LocationFinderContext) as unknown as LocationFinderContextValue<T>;
};

export default LocationFinderContext;
