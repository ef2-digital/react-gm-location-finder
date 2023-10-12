import { useState } from 'react';
import { Location } from 'src/types';

const PAGE_SIZE = 10;

const usePagination = <T extends object>() => {
    const [page, setPage] = useState(0);

    // TODO: Optimize this.
    const getPage = (locationsInBounds: Location<T>[], bounds: google.maps.LatLngBounds): Location<T>[] => {
        const locations: Location<T>[] = [];
        let i = 0;
        let li = 0;

        while (i < (page + 1) * PAGE_SIZE) {
            const location = locationsInBounds[li];

            if (bounds.contains(location.position)) {
                locations.push(location);
                i++;
            }

            li++;
        }

        return locations;
    };

    const loadMore = () => {
        setPage(page + 1);
    };

    return {
        getPage,
        loadMore
    };
};

export default usePagination;
