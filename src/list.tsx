//@ts-nocheck
import { OpeningHourLabel } from './components/content';
import { useLoadMore, useLocationFinder, usePlacesFinder } from './hooks';
import { StandaloneSearchBox } from '@react-google-maps/api';

const List = () => {
    const { defaultSearch, loading, onCurrentLocationClick } = useLocationFinder();
    const { onPlaceChanged, onLoad, inputRef, onButtonClick } = usePlacesFinder();
    const { map, locations, selectedLocation, setSelectedLocation, reset, onBackClick } = useLocationFinder();
    const { pagedListLocations, hasMore } = useLoadMore();

    if (!map) {
        return <></>;
    }

    const handleOnChanged = () => {
        onButtonClick();
        onPlaceChanged();
    };

    return (
        <>
            <StandaloneSearchBox onLoad={onLoad} onPlacesChanged={handleOnChanged}>
                <input type="text" ref={inputRef} />
            </StandaloneSearchBox>
            <button onClick={onBackClick}>RESET</button>
            {pagedListLocations.map((location, index) => (
                <div>
                    {location.name} {location.city} {location.distance}
                    <OpeningHourLabel
                        className="text-sm border-[1px]"
                        labelClosed={'gesloten'}
                        labelOpenTill={'open'}
                        labelOpenFrom={'tot'}
                        location={location}
                    />
                </div>
            ))}
        </>
    );
};

export default List;
