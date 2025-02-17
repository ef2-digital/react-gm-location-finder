import { MouseEvent, useCallback, useRef, useState } from 'react';
import { Bounds, Center } from 'src/types';
import { useEventListener } from 'usehooks-ts';
import { useLocationFinderContext } from 'src/contexts/LocationFinderContext';

export interface PlacesFinderProps {
    setDefaultZoom: (zoom: number) => void;
    setDefaultCenter: (center: Center) => void;
    setDefaultBounds: (bounds: Bounds) => void;
    setDefaultSearch?: (search: string) => void;
}

const usePlacesFinder = () => {
    // Hooks.
    const { setToBeRefinedBounds, setToBeRefinedCenter } = useLocationFinderContext();

    // State.
    const [autocomplete, setAutocomplete] = useState<google.maps.places.SearchBox | undefined>(undefined);
    const inputRef = useRef<HTMLInputElement>(null);
    const [lastPlace, setLastPlace] = useState<google.maps.LatLng | undefined>(undefined);

    // Methods.
    const handleOnLoad = useCallback(
        (autocomplete: google.maps.places.SearchBox) => {
            setAutocomplete(autocomplete);
        },
        [setAutocomplete]
    );

    const handleOnKeyPress = (event: KeyboardEvent) => {
        if (inputRef.current !== document.activeElement) {
            return;
        }

        if (event.key === 'Enter') {
            setPlaceToBeRefined();
        }
    };

    useEventListener('keypress', handleOnKeyPress);

    const handleOnPlaceChanged = () => {
        setPlaceToBeRefined();
    };

    const handleOnButtonClick = (e?: MouseEvent<HTMLButtonElement>) => {
        e?.stopPropagation();
        e?.preventDefault();

        if (!inputRef.current) {
            return;
        }

        setPlaceToBeRefined();
    };

    const setPlaceToBeRefined = () => {
        if (!autocomplete) {
            return;
        }

        const place = autocomplete.getPlaces()?.[0];

        if (!place) {
            return;
        }

        const geometry = place.geometry;

        if (!geometry?.location) {
            return;
        }

        const newCenter = geometry.location;

        // Avoid refining the same place repeatedly
        if (lastPlace?.lat() === newCenter.lat() && lastPlace?.lng() === newCenter.lng()) {
            return; // Same place, skip refinement
        }

        setLastPlace(newCenter); // Store the current place to compare next time

        if (geometry.viewport) {
            setToBeRefinedBounds(geometry.viewport);
        }

        setToBeRefinedCenter(newCenter);
    };

    return {
        inputRef,
        onLoad: handleOnLoad,
        onPlaceChanged: handleOnPlaceChanged,
        onButtonClick: handleOnButtonClick
    };
};

export default usePlacesFinder;
