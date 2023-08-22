import { useCallback, useContext } from 'react';
import { LocationFinderContext, LocationProps } from '../contexts/locationFinderContext';
import { useLocations } from './useLocations';
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '../utils/constants';
import { MapContext } from '../contexts/mapContext';
import kebabCase from 'lodash-es/kebabCase';

export const useOnLocationEvent = () => {
    const { formatListLocations } = useLocations();

    const { selectedLocation, locations, setSelectedLocation } = useContext(LocationFinderContext);

    const { setPendingRefine, setShowDistance, currentPosition, map } = useContext(MapContext);

    const unsetSelectedLocation = useCallback(() => {
        setSelectedLocation(undefined);
        const path = window.location.href.split('?')[0];
        const newURL = `${path}`;

        history.pushState({}, '', newURL);

        reset();
    }, [selectedLocation, setSelectedLocation]);

    const onMarkerClick = useCallback(
        (location: LocationProps, marker: any) => {
            handleSelectedLocation(location);

            return setTimeout(() => panToMarker(marker.latLng), 200);
        },
        [map]
    );

    const panToMarker = useCallback(
        (marker: any) => {
            if (!map) {
                return;
            }

            setTimeout(() => {
                map.setZoom(12);
                map.panTo(marker);
            }, 300);
        },
        [map]
    );

    const handleSelectedLocation = useCallback(
        (location: LocationProps) => {
            const urlSearchParams = new URLSearchParams(document.location.search);

            setSelectedLocation(location);

            if (!urlSearchParams.get('location')) {
                urlSearchParams.set('location', `${kebabCase(location.title)}-${location.id}`);
            }

            if (typeof window !== 'undefined') {
                const path = window.location.href.split('?')[0];
                const newURL = `${path}?${urlSearchParams}`;

                history.pushState({}, '', newURL);
            }

            panToMarker(location.position);
            setPendingRefine(true);
        },

        [map]
    );

    const refine = useCallback(() => {
        if (!map) {
            return;
        }

        map.setCenter(currentPosition);
        formatListLocations();
    }, [map, currentPosition]);

    const reset = useCallback(() => {
        if (!map) {
            return;
        }

        map.setCenter(DEFAULT_CENTER);
        map.setZoom(DEFAULT_ZOOM);
        setShowDistance(false);

        if (locations) {
            formatListLocations();
        }
    }, [map, selectedLocation, locations, currentPosition]);

    return {
        onMarkerClick,
        handleSelectedLocation,
        unsetSelectedLocation,
        refine,
        reset
    };
};
