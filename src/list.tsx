//@ts-nocheck
import { useLocationFinder } from './hooks';

const List = () => {
    const { map, listLocations } = useLocationFinder();
    // const { list, hasMore } = useLoadMore();

    if (!map) {
        return <></>;
    }

    return <div style={{ marginTop: '100px' }}>{listLocations.map((location) => `${location.city} - ${location.distance ?? ''}`)}</div>;
};

export default List;
