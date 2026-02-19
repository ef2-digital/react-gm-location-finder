import { StandaloneSearchBox } from '@react-google-maps/api';
import { useLocationFinder, usePlacesFinder } from './hooks';

interface SearchProps {
    onLocationFound?: (lat: number, lng: number) => void;
}

const Search = ({ onLocationFound }: SearchProps) => {
    const { map, onCurrentLocationClick } = useLocationFinder();
    const { onLoad, inputRef, onButtonClick } = usePlacesFinder();

    if (!map) {
        return <></>;
    }

    const handleOnSearchButtonClick = onButtonClick(onLocationFound);

    const handleOnCurrentLocationClick = () => {
        if (navigator?.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    onCurrentLocationClick(position.coords.latitude, position.coords.longitude);
                    onLocationFound?.(position.coords.latitude, position.coords.longitude);
                },
                () => console.log('loaded')
            );
        }
    };

    return (
        <>
            <StandaloneSearchBox onLoad={onLoad} onPlacesChanged={handleOnSearchButtonClick}>
                <input type="text" ref={inputRef} placeholder="Search for a location..." />
            </StandaloneSearchBox>
            <button onClick={handleOnSearchButtonClick} style={{ marginTop: '10px', marginRight: '10px' }}>
                Search
            </button>
            <button onClick={handleOnCurrentLocationClick} style={{ marginTop: '10px' }}>
                Current Location
            </button>
        </>
    );
};

export default Search;
