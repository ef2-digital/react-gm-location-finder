import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocationFinderContext } from 'src/contexts/LocationFinderContext';
import { Bounds, Center } from 'src/types';
import { offsetCenter } from 'src/utils/helpers';

export interface PlacesFinderProps {
    setDefaultZoom: (zoom: number) => void;
    setDefaultCenter: (center: Center) => void;
    setDefaultBounds: (bounds: Bounds) => void;
    setDefaultSearch?: (search: string) => void;
}

export interface PlacesFinderOptions {
    zoomAfterPlaceChanged?: number;
    showCurrentLocation?: boolean;
}

const DEFAULT_ZOOM_AFTER_PLACE_CHANGED = 12;

const usePlacesFinder = (options?: PlacesFinderOptions) => {
    // Hooks.
    const { setDefaultCenter, currentLocation, map, setDefaultBounds, setDefaultZoom, setDefaultSearch } = useLocationFinderContext();

    // State.
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | undefined>(undefined);
    const inputRef = useRef<HTMLInputElement>(null);

    // Methods.
    const handleOnLoad = useCallback(
        (autocomplete: google.maps.places.Autocomplete) => {
            setAutocomplete(autocomplete);
        },
        [setAutocomplete]
    );

    const handleOnPlaceChanged = () => {
        if (!autocomplete || !map) {
            return;
        }

        const place = autocomplete.getPlace();
        const geometry = place.geometry;

        if (!geometry?.location) {
            return;
        }

        const newZoom = options?.zoomAfterPlaceChanged ?? DEFAULT_ZOOM_AFTER_PLACE_CHANGED;
        const newCenter = geometry.location;

        // TODO variable
        setDefaultCenter(offsetCenter(map, newCenter, 250, 0, newZoom));
        setDefaultZoom(newZoom);

        // if (geometry.viewport) {
        //     setDefaultBounds(geometry.viewport);
        // }

        handleOnButtonClick();
    };

    const handleOnButtonClick = useCallback(() => {
        const value = inputRef.current?.value;

        if (value) {
            setDefaultSearch(value);
        }
    }, [setDefaultSearch]);

    const handleOnCurrentLocationClick = () => {
        const newZoom = options?.zoomAfterPlaceChanged ?? DEFAULT_ZOOM_AFTER_PLACE_CHANGED;

        if (currentLocation && map) {
            setDefaultCenter(offsetCenter(map, currentLocation, 250, 0, newZoom));
            setDefaultZoom(newZoom);
        }
    };

    return {
        inputRef,
        onLoad: handleOnLoad,
        onPlaceChanged: handleOnPlaceChanged,
        onButtonClick: handleOnButtonClick,
        onCurrentLocationClick: handleOnCurrentLocationClick
    };
};

export default usePlacesFinder;
