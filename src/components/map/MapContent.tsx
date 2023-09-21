import { PropsWithChildren } from 'react';
import { classNamesTailwind } from 'src/utils/helpers';

export interface MapContentProps {
    className?: string;
    classNameContainer?: string;
    classNameRow?: string;
}

const MapContent = ({ className, classNameContainer, classNameRow, children }: PropsWithChildren<MapContentProps>) => {
    return (
        <div className={classNamesTailwind('md:absolute -mt-12 md:mt-0 relative top-0 w-full left-0 h-full invisible z-20', className)}>
            <div className={classNamesTailwind('container mx-auto invisible h-full', classNameContainer)}>
                <div className={classNamesTailwind('grid grid-cols-4 gap-x-4 md:grid-cols-12 invisible h-full', classNameRow)}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default MapContent;
