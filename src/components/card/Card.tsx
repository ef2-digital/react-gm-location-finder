import { classNamesTailwind } from 'src/utils/helpers';
import { Card as HeroCard } from '@heroui/react';
import { PropsWithChildren } from 'react';
import CardWrapper from './CardWrapper';

export interface CardProps {
    className?: string;
}

const Card = ({ className, children }: PropsWithChildren<CardProps>) => {
    return <HeroCard className={classNamesTailwind('visible overflow-visible h-full md:overflow-hidden shadow-none', className)}>{children}</HeroCard>;
};

Card.Wrapper = CardWrapper;

export default Card;
