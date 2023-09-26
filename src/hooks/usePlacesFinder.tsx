import { useCallback, useRef } from 'react';
import useLocationFinder from './useLocationFinder';

const usePlacesFinder = () => {
    const { onAutocompleteLoad, autocomplete, setZoom, setCenter, setDefaultSearch } = useLocationFinder();
    const inputRef = useRef<HTMLInputElement>(null);

    const handleOnPlaceChanged = useCallback(() => {
        if (!autocomplete) {
            return;
        }

        const place = autocomplete.getPlace();
        const location = place.geometry?.location;

        if (!location) {
            return;
        }

        setCenter(location);
        setZoom(12);
    }, [autocomplete]);

    const handleOnButtonClick = useCallback(() => {
        const value = inputRef.current?.value;

        if (!setDefaultSearch || !value) {
            return;
        }

        setDefaultSearch(value);
    }, []);

    return {
        inputRef,
        onAutocompleteLoad,
        onPlaceChanged: handleOnPlaceChanged,
        onButtonClick: handleOnButtonClick
    };
};

export default usePlacesFinder;
