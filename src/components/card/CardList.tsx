import { Listbox } from '@nextui-org/react';
import { Key, ReactElement } from 'react';
import useLocationFinder from 'src/hooks/useLocationFinder';

export interface CardListProps {
    children: ReactElement[];
}

const CardList = ({ children }: CardListProps) => {
    const { onLocationClick } = useLocationFinder();

    // Methods.
    const handleOnClick = (key: Key) => {
        onLocationClick(key as string);
    };

    return <Listbox onAction={handleOnClick}>{children}</Listbox>;
};

export default CardList;
