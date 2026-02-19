import {
    createContext,
    Dispatch,
    PropsWithChildren,
    ReactNode,
    SetStateAction,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react';
import { Bounds, Center, DEFAULT_BOUNDS, DEFAULT_CENTER, DEFAULT_ZOOM, Location } from 'src/types';
import { getLatLngSearchParams } from 'src/utils/helpers';

// Context.
export interface LocationFinderContextValue<T extends object = {}> {
    frozenCenter: Center | null;
    setFrozenCenter: (center: Center | null) => void;
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
    localeCenterMap?: Map<string, Center>;
    locale?: string;
    noResultsBounds: boolean;
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
    setNoResultsBounds: (noResults: boolean) => void;
    page: number;
    setPage: Dispatch<SetStateAction<number>>;
}

const LocationFinderContext = createContext<LocationFinderContextValue>({
    frozenCenter: null,
    setFrozenCenter: () => {},
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
    setNoResultsBounds: () => {},
    noResultsBounds: false,
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
    defaultCenter?: Center;
    defaultZoom?: number;
}

export const LocationFinderProvider = <T extends object = {}>({
    locations,
    loading,
    children,
    locale,
    localeCenterMap,
    initialCurrentLocation,
    useCurrentLocation,
    defaultCenter: initialDefaultCenter,
    defaultZoom: initialDefaultZoom
}: PropsWithChildren<LocationFinderProps<T>>) => {
    const searchParamsCenter = getLatLngSearchParams();
    const center =
        searchParamsCenter ??
        initialDefaultCenter ??
        (localeCenterMap && locale ? localeCenterMap.get(locale) ?? DEFAULT_CENTER : DEFAULT_CENTER);

    // If URL has zoom param, use it; otherwise use prop or default
    const initialZoom = searchParamsCenter?.zoom ?? initialDefaultZoom ?? DEFAULT_ZOOM;

    // Context.
    const [map, setMap] = useState<google.maps.Map>();
    const [defaultZoom, setDefaultZoom] = useState<number>(initialZoom);
    const [defaultCenter, setDefaultCenter] = useState<Center>(center);
    const [defaultBounds, setDefaultBounds] = useState<Bounds>(DEFAULT_BOUNDS);
    const [defaultSearch, setDefaultSearch] = useState<string | undefined>(undefined);
    const [listLocations, setListLocations] = useState<Location[]>(locations);
    const [currentPosition, setCurrentPosition] = useState<Center | undefined>(initialCurrentLocation);
    const [selectedLocation, setSelectedLocation] = useState<Location | undefined>(undefined);
    const [pendingRefine, setPendingRefine] = useState<boolean>(false);
    const [noResultsBounds, setNoResultsBounds] = useState<boolean>(false);
    const [frozenCenter, setFrozenCenter] = useState<Center | null>(null);

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
            // Don't set toBeRefinedCenter here - that should only be triggered by user search
            // The map will use the default center from state
        }
    }, [useCurrentLocation]);

    // Handle initial default center/zoom from props (e.g., from URL params)
    useEffect(() => {
        if (!map) return;

        const centerToUse = initialDefaultCenter || searchParamsCenter;
        const zoomToUse = searchParamsCenter?.zoom ?? initialDefaultZoom;

        // Only set map if we have URL params or initial props that differ from defaults
        if (centerToUse && zoomToUse !== undefined) {
            // Set the map position and zoom
            map.setCenter(centerToUse);
            map.setZoom(zoomToUse);

            // Update context state
            setDefaultCenter(centerToUse);
            setDefaultZoom(zoomToUse);

            // Trigger refinement - onIdle will call refine() to filter locations by distance
            // Use a small timeout to ensure map is fully positioned
            setTimeout(() => {
                setPendingRefine(true);
            }, 150);
        }
    }, [map]); // Only run when map becomes available

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo<LocationFinderContextValue<T>>(
        () => ({
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
            setNoResultsBounds,
            map,
            loading,
            locations,
            listLocations: listLocations as Location<T>[],
            setListLocations,
            currentPosition,
            setCurrentPosition,
            selectedLocation: selectedLocation as Location<T> | undefined,
            setSelectedLocation,
            pendingRefine,
            setPendingRefine,
            localeCenterMap,
            locale,
            noResultsBounds,
            page,
            setPage,
            frozenCenter,
            setFrozenCenter
        }),
        [
            defaultBounds,
            defaultCenter,
            defaultZoom,
            defaultSearch,
            toBeRefinedCenter,
            toBeRefinedBounds,
            map,
            loading,
            locations,
            listLocations,
            currentPosition,
            selectedLocation,
            pendingRefine,
            localeCenterMap,
            locale,
            noResultsBounds,
            page,
            frozenCenter
        ]
    );

    // Render.
    return <LocationFinderContext.Provider value={contextValue as any}>{children}</LocationFinderContext.Provider>;
};

export const useLocationFinderContext = <T extends object = {}>(): LocationFinderContextValue<T> => {
    return useContext(LocationFinderContext) as unknown as LocationFinderContextValue<T>;
};

export default LocationFinderContext;
