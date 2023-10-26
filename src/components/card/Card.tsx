import { classNamesTailwind } from 'src/utils/helpers';
import { Card as NextCard } from '@nextui-org/react';
import { PropsWithChildren } from 'react';
import CardWrapper from './CardWrapper';
import CardList from './CardList';

export interface CardProps {
    className?: string;
}

const Card = ({ className, children }: PropsWithChildren<CardProps>) => {
    return <NextCard className={classNamesTailwind('visible', className)}>{children}</NextCard>;
};

Card.Wrapper = CardWrapper;
Card.List = CardList;

export default Card;
