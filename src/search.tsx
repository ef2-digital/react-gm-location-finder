import { StandaloneSearchBox } from '@react-google-maps/api';
import { useLocationFinder, usePlacesFinder } from './hooks';

const Search = () => {
    const { map, onCurrentLocationClick } = useLocationFinder();
    const { onPlaceChanged, onLoad, inputRef, onButtonClick } = usePlacesFinder();

    if (!map) {
        return <></>;
    }

    const handleOnChanged = () => {
        onButtonClick();
    };

    const handleOnCurrentLocationClick = () => {
        if (navigator?.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    onCurrentLocationClick(position.coords.latitude, position.coords.longitude);
                },
                () => console.log('loaded')
            );
        }
    };

    return (
        <>
            <StandaloneSearchBox onLoad={onLoad} onPlacesChanged={handleOnChanged}>
                <input type="text" ref={inputRef} />
            </StandaloneSearchBox>
            <button onClick={handleOnCurrentLocationClick}>Current Location</button>
        </>
    );
};

export default Search;
