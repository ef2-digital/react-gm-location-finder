import { PropsWithChildren } from 'react';
import { classNamesTailwind } from 'src/utils/helpers';

export interface CardWrapperProps {
    className?: string;
}

const CardWrapper = ({ className, children }: PropsWithChildren<CardWrapperProps>) => {
    return <div className={classNamesTailwind('md:my-12 col-span-4 md:col-span-7 lg:col-span-5 xl:col-span-4', className)}>{children}</div>;
};

export default CardWrapper;
