import { useCallback, useMemo } from 'react';
import { useLocationFinderContext } from 'src/contexts/LocationFinderContext';

export const PAGE_SIZE = 5;

const useLoadMore = <T extends object>() => {
    // Hooks.
    const { setPage, page, listLocations } = useLocationFinderContext<T>();

    // Methods.
    const onButtonClick = useCallback(() => {
        setPage((page) => page + 1);
    }, [setPage]);

    const locationsToShow = useMemo(() => PAGE_SIZE + page * PAGE_SIZE, [page]);
    const pagedListLocations = useMemo(() => listLocations.slice(0, locationsToShow), [listLocations, locationsToShow]);
    const hasMore = useMemo(() => listLocations.length > locationsToShow, [listLocations, locationsToShow]);

    return {
        onButtonClick,
        pagedListLocations,
        hasMore,
        page
    };
};

export default useLoadMore;
