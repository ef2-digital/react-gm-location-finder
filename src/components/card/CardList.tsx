import { Listbox } from '@nextui-org/react';
import { Key, ReactElement } from 'react';
import useLocationFinder from 'src/hooks/useLocationFinder';

export interface CardListProps {
    children: ReactElement[];
}

const CardList = ({ children }: CardListProps) => {
    const { locations, onLocationClick } = useLocationFinder();

    // Methods.
    const handleOnClick = (key: Key) => {
        const location = locations.find((location) => location.id === key);

        if (!location) {
            return;
        }

        onLocationClick(location);
    };

    return <Listbox onAction={handleOnClick}>{children}</Listbox>;
};

export default CardList;
