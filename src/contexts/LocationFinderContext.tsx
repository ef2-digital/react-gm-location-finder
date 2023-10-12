import { createContext, PropsWithChildren, ReactNode, useContext, useState } from 'react';
import { Bounds, Center, DEFAULT_BOUNDS, DEFAULT_CENTER, DEFAULT_ZOOM, Location } from 'src/types';

// Context.
export interface LocationFinderContextValue<T extends object = {}> {
    defaultZoom: number;
    defaultCenter: Center;
    defaultBounds: Bounds;
    defaultSearch?: string;

    loading: boolean;
    locations: Location<T>[];

    setDefaultZoom: (zoom: number) => void;
    setDefaultCenter: (center: Center) => void;
    setDefaultBounds: (bounds: Bounds) => void;
    setDefaultSearch: (search: string) => void;
}

const LocationFinderContext = createContext<LocationFinderContextValue>({
    defaultZoom: DEFAULT_ZOOM,
    defaultCenter: DEFAULT_CENTER,
    defaultBounds: DEFAULT_BOUNDS,
    defaultSearch: undefined,

    loading: true,
    locations: [],

    setDefaultZoom: () => {},
    setDefaultCenter: () => {},
    setDefaultBounds: () => {},
    setDefaultSearch: () => {}
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
    const [defaultZoom, setDefaultZoom] = useState<number>(DEFAULT_ZOOM);
    const [defaultCenter, setDefaultCenter] = useState<Center>(DEFAULT_CENTER);
    const [defaultBounds, setDefaultBounds] = useState<Bounds>(DEFAULT_BOUNDS);
    const [defaultSearch, setDefaultSearch] = useState<string | undefined>(undefined);

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
                loading,
                locations
            }}
        >
            {children}
        </LocationFinderContext.Provider>
    );
};

export const useLocationFinderContext = <T extends object = {}>(): LocationFinderContextValue<T> => {
    return useContext(LocationFinderContext) as LocationFinderContextValue<T>;
};

export default LocationFinderContext;
