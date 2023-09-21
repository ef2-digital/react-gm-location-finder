import { Autocomplete } from '@react-google-maps/api';
import { ReactChild } from 'react';
import useLocationFinder from 'src/hooks/useLocationFinder';

export interface CardAutocompleteProps {
    children: ReactChild;
}

const CardAutocomplete = ({ children }: CardAutocompleteProps) => {
    const { onAutocompleteLoad, onPlaceChanged } = useLocationFinder();

    return (
        <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged}>
            {children}
        </Autocomplete>
    );
};

export default CardAutocomplete;
