import { createContext, Dispatch, PropsWithChildren, ReactNode, SetStateAction, useContext, useEffect, useState } from 'react';
import { Bounds, Center, DEFAULT_BOUNDS, DEFAULT_CENTER, DEFAULT_ZOOM, Location } from 'src/types';

// Context.
export interface LocationFinderContextValue<T extends object = {}> {
    map?: google.maps.Map;
    defaultZoom: number;
    defaultCenter: Center;
    defaultBounds: Bounds;
    defaultSearch?: string;
    pendingRefine: boolean;
    setPendingRefine: (pendingRefine: boolean) => void;
    currentLocation?: Center;
    // TODO refactor?
    localeCenterMap?: Map<string, Center>;
    locale?: string;

    loading: boolean;
    locations: Location<T>[];
    selectedLocation?: Location<T>;
    listLocations: Location<T>[];

    setDefaultZoom: (zoom: number) => void;
    setDefaultCenter: (center: Center) => void;
    setDefaultBounds: (bounds: Bounds) => void;
    setDefaultSearch: (search: string) => void;
    setListLocations: (locations: Location<T>[]) => void;
    setSelectedLocation: (location: Location<T> | undefined) => void;
    setCurrentLocation: (center: Center) => void;
    setMap: (map: google.maps.Map) => void;

    // Load more functionality.
    page: number;
    setPage: Dispatch<SetStateAction<number>>;
}

const LocationFinderContext = createContext<LocationFinderContextValue>({
    defaultZoom: DEFAULT_ZOOM,
    defaultCenter: DEFAULT_CENTER,
    defaultBounds: DEFAULT_BOUNDS,
    defaultSearch: undefined,
    pendingRefine: true,
    setPendingRefine: () => {},

    currentLocation: undefined,

    loading: true,
    locations: [],
    listLocations: [],
    selectedLocation: undefined,

    setDefaultZoom: () => {},
    setDefaultCenter: () => {},
    setDefaultBounds: () => {},
    setDefaultSearch: () => {},
    setListLocations: () => {},
    setCurrentLocation: () => {},
    setSelectedLocation: () => {},
    setMap: () => {},
    // Load more functionality.
    page: 0,
    setPage: () => {}
});

export interface LocationFinderProps<T extends object = {}> {
    locations: Location<T>[];
    locale?: string;
    localeCenterMap?: Map<string, Center>;
    children?: ReactNode | ((value: LocationFinderContextValue<T>) => ReactNode);
    loading: boolean;
}

export const LocationFinderProvider = <T extends object = {}>({
    locations,
    loading,
    children,
    locale,
    localeCenterMap
}: PropsWithChildren<LocationFinderProps<T>>) => {
    const center = localeCenterMap && locale ? localeCenterMap.get(locale) ?? DEFAULT_CENTER : DEFAULT_CENTER;

    // Context.
    const [map, setMap] = useState<google.maps.Map>();
    const [defaultZoom, setDefaultZoom] = useState<number>(DEFAULT_ZOOM);
    const [defaultCenter, setDefaultCenter] = useState<Center>(center);
    const [defaultBounds, setDefaultBounds] = useState<Bounds>(DEFAULT_BOUNDS);
    const [defaultSearch, setDefaultSearch] = useState<string | undefined>(undefined);
    const [listLocations, setListLocations] = useState<Location[]>(locations);
    const [currentLocation, setCurrentLocation] = useState<Center | undefined>(undefined);
    const [selectedLocation, setSelectedLocation] = useState<Location | undefined>(undefined);
    const [pendingRefine, setPendingRefine] = useState<boolean>(false);

    // - Load more functionality.
    const [page, setPage] = useState<number>(0);

    // - Get user location on first load
    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        });
    }, []);

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
                setCurrentLocation,
                selectedLocation,
                setSelectedLocation,
                pendingRefine,
                setPendingRefine,
                localeCenterMap,
                locale,
                // - Load more functionality.
                page,
                setPage
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
