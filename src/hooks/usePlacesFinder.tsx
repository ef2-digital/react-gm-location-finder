import { MouseEvent, useCallback, useRef, useState } from 'react';
import { Bounds, Center } from 'src/types';
import { useEventListener } from 'usehooks-ts';
import useLocationFinder from './useLocationFinder';
import { useLocationFinderContext } from 'src/contexts/LocationFinderContext';

export interface PlacesFinderProps {
    setDefaultZoom: (zoom: number) => void;
    setDefaultCenter: (center: Center) => void;
    setDefaultBounds: (bounds: Bounds) => void;
    setDefaultSearch?: (search: string) => void;
}

const usePlacesFinder = () => {
    // Hooks.
    const { map } = useLocationFinder();
    const { setToBeRefinedBounds, setToBeRefinedCenter } = useLocationFinderContext();

    // State.
    const [autocomplete, setAutocomplete] = useState<google.maps.places.SearchBox | undefined>(undefined);
    const inputRef = useRef<HTMLInputElement>(null);

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
        if (!map || !inputRef.current) {
            return;
        }

        google.maps.event.trigger(inputRef.current, 'focus', {});
        google.maps.event.trigger(inputRef.current, 'keydown', { keyCode: 13 });

        setPlaceToBeRefined();

        e?.stopPropagation();
        e?.preventDefault();
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
