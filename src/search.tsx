import { StandaloneSearchBox } from '@react-google-maps/api';
import { useLocationFinder, usePlacesFinder } from './hooks';

const Search = () => {
    const { map } = useLocationFinder();
    const { onPlaceChanged, onLoad, inputRef, onButtonClick } = usePlacesFinder();

    if (!map) {
        return <></>;
    }

    const handleOnChanged = () => {
        onButtonClick();
    };

    return (
        <StandaloneSearchBox onLoad={onLoad} onPlacesChanged={handleOnChanged}>
            <input type="text" ref={inputRef} />
        </StandaloneSearchBox>
    );
};

export default Search;
