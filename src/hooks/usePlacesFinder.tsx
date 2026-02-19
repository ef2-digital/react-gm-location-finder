import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Bounds, Center } from 'src/types';
import { useEventListener } from 'usehooks-ts';
import { useLocationFinderContext } from 'src/contexts/LocationFinderContext';
import { debounce } from 'lodash-es';

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
    const geocoderRef = useRef<google.maps.Geocoder | null>(null);
    const lastSearchTextRef = useRef<string>('');
    const isProcessingRef = useRef<boolean>(false);
    const onLocationSetRef = useRef<((lat: number, lng: number) => void) | null>(null);
    const enterKeyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Initialize geocoder on mount
    useEffect(() => {
        if (!geocoderRef.current && typeof window !== 'undefined' && window.google?.maps) {
            geocoderRef.current = new window.google.maps.Geocoder();
            console.log('[usePlacesFinder] Geocoder initialized');
        }
    }, []);

    // Methods.
    const handleOnLoad = useCallback(
        (autocomplete: google.maps.places.SearchBox) => {
            setAutocomplete(autocomplete);
            // Initialize geocoder if not already done
            if (!geocoderRef.current && typeof window !== 'undefined' && window.google?.maps) {
                geocoderRef.current = new window.google.maps.Geocoder();
                console.log('[usePlacesFinder] Geocoder initialized on load');
            }
        },
        [setAutocomplete]
    );

    /**
     * Geocode a search string and update the map
     */
    const geocodeAndUpdate = useCallback(
        (searchText: string) => {
            if (!searchText || !geocoderRef.current) {
                console.warn('[usePlacesFinder] No search text or geocoder not ready');
                return;
            }

            // Skip if same as last search and we're already processing
            if (lastSearchTextRef.current === searchText && isProcessingRef.current) {
                console.log('[usePlacesFinder] Skipping duplicate search (already processing):', searchText);
                return;
            }

            lastSearchTextRef.current = searchText;
            isProcessingRef.current = true;
            console.log('[usePlacesFinder] Geocoding:', searchText);

            geocoderRef.current.geocode({ address: searchText }, (results, status) => {
                isProcessingRef.current = false;
                console.log('[usePlacesFinder] Geocode status:', status);

                if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
                    const result = results[0];
                    const geometry = result.geometry;

                    if (geometry?.location) {
                        const newCenter = geometry.location;

                        console.log('[usePlacesFinder] Geocode success:', {
                            address: result.formatted_address,
                            lat: newCenter.lat(),
                            lng: newCenter.lng()
                        });

                        if (geometry.viewport) {
                            setToBeRefinedBounds(geometry.viewport);
                        }

                        // This triggers the map centering, zoom, and location filtering
                        setToBeRefinedCenter(newCenter);

                        // Notify callback
                        if (onLocationSetRef.current) {
                            onLocationSetRef.current(newCenter.lat(), newCenter.lng());
                        }
                    }
                } else {
                    console.warn('[usePlacesFinder] Geocoding failed:', status);
                }
            });
        },
        [setToBeRefinedBounds, setToBeRefinedCenter]
    );

    /**
     * Process a place selection from autocomplete
     */
    const processAutocompletePlace = useCallback(
        (place: google.maps.places.PlaceResult) => {
            const geometry = place.geometry;

            if (!geometry?.location) {
                console.warn('[usePlacesFinder] Place has no geometry');
                return;
            }

            const newCenter = geometry.location;

            console.log('[usePlacesFinder] Autocomplete place:', {
                name: place.formatted_address || place.name,
                lat: newCenter.lat(),
                lng: newCenter.lng()
            });

            if (geometry.viewport) {
                setToBeRefinedBounds(geometry.viewport);
            }

            // This triggers the map centering, zoom, and location filtering
            setToBeRefinedCenter(newCenter);

            // Notify callback
            if (onLocationSetRef.current) {
                onLocationSetRef.current(newCenter.lat(), newCenter.lng());
            }
        },
        [setToBeRefinedBounds, setToBeRefinedCenter]
    );

    /**
     * Handle Enter key - debounced to allow user to finish typing
     */
    const handleOnKeyPress = (event: KeyboardEvent) => {
        if (inputRef.current !== document.activeElement) {
            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();

            const searchText = inputRef.current?.value?.trim();
            if (!searchText) return;

            console.log('[usePlacesFinder] Enter pressed with text:', searchText);

            // Clear any pending Enter key geocode
            if (enterKeyTimeoutRef.current) {
                clearTimeout(enterKeyTimeoutRef.current);
            }

            // Debounce to let user finish typing
            enterKeyTimeoutRef.current = setTimeout(() => {
                geocodeAndUpdate(searchText);
            }, 300); // 300ms delay to match refine debounce
        }
    };

    useEventListener('keypress', handleOnKeyPress);

    /**
     * Handle autocomplete place selection
     */
    const handleOnPlaceChanged = (callback?: (lat: number, lng: number) => void) => {
        // Store callback immediately when this function is called
        onLocationSetRef.current = callback || null;

        return () => {
            // Wait a tiny bit for autocomplete to populate
            setTimeout(() => {
                const place = autocomplete?.getPlaces()?.[0];

                if (place) {
                    console.log('[usePlacesFinder] Autocomplete selected');
                    processAutocompletePlace(place);
                } else {
                    // No place selected from dropdown, try geocoding the text
                    const searchText = inputRef.current?.value?.trim();
                    if (searchText) {
                        console.log('[usePlacesFinder] No autocomplete result, geocoding text');
                        geocodeAndUpdate(searchText);
                    }
                }
            }, 50);
        };
    };

    /**
     * Handle search button click
     */
    const handleOnButtonClick = (callback?: (lat: number, lng: number) => void) => {
        // Store callback immediately when this function is called
        onLocationSetRef.current = callback || null;

        return (e?: MouseEvent<HTMLButtonElement>) => {
            e?.stopPropagation();
            e?.preventDefault();

            if (!inputRef.current) {
                return;
            }

            const searchText = inputRef.current?.value?.trim();
            if (!searchText) return;

            console.log('[usePlacesFinder] Button clicked with text:', searchText);

            // Button click should always geocode the current input text
            // Don't use cached autocomplete results
            geocodeAndUpdate(searchText);
        };
    };

    return {
        inputRef,
        onLoad: handleOnLoad,
        onPlaceChanged: handleOnPlaceChanged,
        onButtonClick: handleOnButtonClick
    };
};

export default usePlacesFinder;
