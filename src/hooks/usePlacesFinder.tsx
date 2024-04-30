import { MouseEvent, useCallback, useRef, useState } from 'react';
import { Bounds, Center } from 'src/types';
import { defaultOffsetCenter } from 'src/utils/helpers';
import { useEventListener, useWindowSize } from 'usehooks-ts';
import useLocationFinder, { findLocationsInBounds } from './useLocationFinder';

export interface PlacesFinderProps {
    setDefaultZoom: (zoom: number) => void;
    setDefaultCenter: (center: Center) => void;
    setDefaultBounds: (bounds: Bounds) => void;
    setDefaultSearch?: (search: string) => void;
}

export interface PlacesFinderOptions {
    zoomAfterPlaceChanged?: number;
    selectLocationAfterPlaceChanged?: boolean;
}

const DEFAULT_ZOOM_AFTER_PLACE_CHANGED = 12;

const usePlacesFinder = (options?: PlacesFinderOptions) => {
    // Hooks.
    const { map, locations, setSelectedLocation, setDefaultCenter, setDefaultZoom, refine } = useLocationFinder();
    const { width } = useWindowSize();

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
            handlePlace()
        }
    };

    useEventListener('keypress', handleOnKeyPress);

    const handleOnPlaceChanged = () => {
        handlePlace()
    };

    const handleOnButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
        if (!map || !inputRef.current) {
            return;
        }

        google.maps.event.trigger(inputRef.current, 'focus', {});
        google.maps.event.trigger(inputRef.current, 'keydown', { keyCode: 13 });

        handlePlace();

        e.stopPropagation();
        e.preventDefault();
    };

    const handlePlace = () => {
        if (!autocomplete || !map) {
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

        const newZoom = options?.zoomAfterPlaceChanged ?? DEFAULT_ZOOM_AFTER_PLACE_CHANGED;

        // Select location after place changed when option is enabled.
        if (geometry.viewport && options?.selectLocationAfterPlaceChanged) {
            const listLocations = findLocationsInBounds(map, locations, geometry.viewport, geometry.location, newZoom);

            if (Boolean(listLocations.length)) {
                const firstLocation = listLocations[0];
                const newCenter = firstLocation.position;
                const newCenterOffset = defaultOffsetCenter(map, newCenter, width, newZoom);

                map.setCenter(newCenterOffset);
                map.setZoom(newZoom);

                setDefaultCenter(newCenterOffset);
                setSelectedLocation(firstLocation);
                setDefaultZoom(newZoom);

                return place;
            }
        }

        const newCenter = geometry.location;
        const newCenterOffset = defaultOffsetCenter(map, newCenter, width, newZoom);

        map.setCenter(newCenterOffset);
        map.setZoom(newZoom);

        setDefaultCenter(newCenterOffset);
        setDefaultZoom(newZoom);
        refine();

        return place;
    }

    return {
        inputRef,
        onLoad: handleOnLoad,
        onPlaceChanged: handleOnPlaceChanged,
        onButtonClick: handleOnButtonClick,
    };
};

export default usePlacesFinder;
