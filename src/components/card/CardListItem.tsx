import { ListboxItem, ListboxItemProps } from '@nextui-org/react';
import { Key, PropsWithChildren, forwardRef } from 'react';

export interface CardListItemProps extends ListboxItemProps {}

const CardListItem = forwardRef(({ children, ...props }: PropsWithChildren<CardListItemProps>, ref) => {
    return <ListboxItem {...props}>sdf</ListboxItem>;
});

export default CardListItem;
