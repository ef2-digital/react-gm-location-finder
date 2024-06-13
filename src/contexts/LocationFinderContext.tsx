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
    currentPosition?: Center;
    toBeRefinedCenter?: Center;
    toBeRefinedBounds?: google.maps.LatLngBounds;
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
    setCurrentPosition: (center: Center) => void;
    setToBeRefinedCenter: (center: Center | undefined) => void;
    setToBeRefinedBounds: (bounds: google.maps.LatLngBounds) => void;
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

    currentPosition: undefined,

    loading: true,
    locations: [],
    listLocations: [],
    selectedLocation: undefined,

    setDefaultZoom: () => {},
    setDefaultCenter: () => {},
    setDefaultBounds: () => {},
    setDefaultSearch: () => {},
    setListLocations: () => {},
    setCurrentPosition: () => {},
    setSelectedLocation: () => {},
    setToBeRefinedCenter: () => {},
    setToBeRefinedBounds: () => {},
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
    initialCurrentLocation?: Center | undefined;
    useCurrentLocation: boolean;
}

export const LocationFinderProvider = <T extends object = {}>({
    locations,
    loading,
    children,
    locale,
    localeCenterMap,
    initialCurrentLocation,
    // TODO move to options!!
    useCurrentLocation
}: PropsWithChildren<LocationFinderProps<T>>) => {
    const center = localeCenterMap && locale ? localeCenterMap.get(locale) ?? DEFAULT_CENTER : DEFAULT_CENTER;

    // Context.
    const [map, setMap] = useState<google.maps.Map>();
    const [defaultZoom, setDefaultZoom] = useState<number>(DEFAULT_ZOOM);
    const [defaultCenter, setDefaultCenter] = useState<Center>(center);
    const [defaultBounds, setDefaultBounds] = useState<Bounds>(DEFAULT_BOUNDS);
    const [defaultSearch, setDefaultSearch] = useState<string | undefined>(undefined);
    const [listLocations, setListLocations] = useState<Location[]>(locations);
    const [currentPosition, setCurrentPosition] = useState<Center | undefined>(initialCurrentLocation);
    const [selectedLocation, setSelectedLocation] = useState<Location | undefined>(undefined);
    const [pendingRefine, setPendingRefine] = useState<boolean>(false);

    // - Location to refine when the map is loaded.
    const [toBeRefinedCenter, setToBeRefinedCenter] = useState<Center | undefined>(undefined);
    const [toBeRefinedBounds, setToBeRefinedBounds] = useState<google.maps.LatLngBounds | undefined>(undefined);

    // - Load more functionality.
    const [page, setPage] = useState<number>(0);

    // - Get user location on first load
    useEffect(() => {
        if (useCurrentLocation && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setCurrentPosition({ lat: position.coords.latitude, lng: position.coords.longitude });
            });

            if (!toBeRefinedCenter) {
                setToBeRefinedCenter(center);
            }
        }
    }, []);

    // Render.
    return (
        <LocationFinderContext.Provider
            value={{
                defaultBounds,
                defaultCenter,
                defaultZoom,
                defaultSearch,
                toBeRefinedCenter,
                toBeRefinedBounds,
                setDefaultZoom,
                setDefaultBounds,
                setDefaultCenter,
                setDefaultSearch,
                setToBeRefinedCenter,
                setToBeRefinedBounds,
                setMap,
                map,
                loading,
                locations,
                listLocations,
                setListLocations,
                currentPosition,
                setCurrentPosition,
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
