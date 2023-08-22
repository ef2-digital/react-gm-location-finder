import { createContext, useState } from 'react';
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '../utils/constants';
import { Props } from 'src/components';

export type MapContextType = {
    map?: google.maps.Map;
    currentPosition: google.maps.LatLngLiteral;
    previousZoom: number;
    showDistance: boolean;
    pendingRefine: boolean;
    setMap: (map: google.maps.Map) => void;
    setPosition: (position: any) => void;
    setPreviousZoom: (zoom: number) => void;
    setShowDistance: (distance: boolean) => void;
    setPendingRefine: (refine: boolean) => void;
};

export const MapContext = createContext<MapContextType>({
    currentPosition: DEFAULT_CENTER,
    previousZoom: DEFAULT_ZOOM,
    showDistance: false,
    pendingRefine: false,
    setMap: (map: google.maps.Map) => {},
    setPosition: (position: any) => {},
    setPreviousZoom: (zoom: number) => {},
    setShowDistance: (distance: boolean) => {},
    setPendingRefine: (refine: boolean) => {}
});

export const MapProvider = ({ children }: Props) => {
    const [map, setMap] = useState<google.maps.Map>();
    const [currentPosition, setPosition] = useState<google.maps.LatLngLiteral>(DEFAULT_CENTER);

    const [previousZoom, setPreviousZoom] = useState(0);
    const [showDistance, setShowDistance] = useState(false);
    const [pendingRefine, setPendingRefine] = useState(false);

    return (
        <MapContext.Provider
            value={{
                map,
                showDistance,
                previousZoom,
                pendingRefine,
                setMap,
                setPendingRefine,
                setPreviousZoom,
                setShowDistance,
                currentPosition,
                setPosition
            }}
        >
            {children}
        </MapContext.Provider>
    );
};
