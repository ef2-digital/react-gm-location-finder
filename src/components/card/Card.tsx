import { classNamesTailwind } from 'src/utils/helpers';
import { Card as NextCard } from '@nextui-org/react';
import { PropsWithChildren } from 'react';
import CardWrapper from './CardWrapper';

export interface CardProps {
    className?: string;
}

const Card = ({ className, children }: PropsWithChildren<CardProps>) => {
    return <NextCard className={classNamesTailwind('visible overflow-visible h-full md:overflow-hidden shadow-none', className)}>{children}</NextCard>;
};

Card.Wrapper = CardWrapper;

export default Card;
