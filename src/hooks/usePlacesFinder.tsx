import { useCallback, useRef, useState } from 'react';
import { useLocationFinderContext } from 'src/contexts/LocationFinderContext';
import { Bounds, Center } from 'src/types';

export interface PlacesFinderProps {
    setDefaultZoom: (zoom: number) => void;
    setDefaultCenter: (center: Center) => void;
    setDefaultBounds: (bounds: Bounds) => void;
    setDefaultSearch?: (search: string) => void;
}

export interface PlacesFinderOptions {
    zoomAfterPlaceChanged?: number;
}

const DEFAULT_ZOOM_AFTER_PLACE_CHANGED = 12;

const usePlacesFinder = (options?: PlacesFinderOptions) => {
    // Hooks.
    const { setDefaultCenter, setDefaultBounds, setDefaultZoom, setDefaultSearch } = useLocationFinderContext();

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

    const handleOnPlaceChanged = useCallback(() => {
        if (!autocomplete) {
            return;
        }

        const place = autocomplete.getPlace();
        const geometry = place.geometry;

        if (!geometry?.location) {
            return;
        }

        const newZoom = options?.zoomAfterPlaceChanged ?? DEFAULT_ZOOM_AFTER_PLACE_CHANGED;
        const newCenter = geometry.location;

        setDefaultCenter(newCenter);
        setDefaultZoom(newZoom);

        if (geometry.viewport) {
            setDefaultBounds(geometry.viewport);
        }

        handleOnButtonClick();
    }, [setDefaultCenter, setDefaultZoom, autocomplete]);

    const handleOnButtonClick = useCallback(() => {
        const value = inputRef.current?.value;

        if (value) {
            setDefaultSearch(value);
        }
    }, [setDefaultSearch]);

    return {
        inputRef,
        onLoad: handleOnLoad,
        onPlaceChanged: handleOnPlaceChanged,
        onButtonClick: handleOnButtonClick
    };
};

export default usePlacesFinder;
