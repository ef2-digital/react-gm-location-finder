import { PropsWithChildren, useContext } from 'react';
import { classNamesTailwind } from '../../utils/helpers';
import { LocationFinderContext } from '../../contexts/locationFinderContext';
import HeadingTop from './HeadingTop';
import { SettingContext } from '../../contexts/settingContext';
import { Props } from '..';

const Panel = ({ children }: Props) => {
    const { classNames } = useContext(SettingContext);
    const { panel } = classNames ?? {};

    return (
        <div
            className={classNamesTailwind(panel?.section, 'md:absolute -mt-12 md:mt-0 relative top-0 w-full left-0 h-full invisible z-20')}
        >
            <div className={classNamesTailwind('container mx-auto invisible h-full')}>
                <div className={classNamesTailwind('grid grid-cols-4 gap-x-4 md:grid-cols-12 invisible h-full')}>
                    <div className={classNamesTailwind('md:my-12 col-span-4 md:col-span-7 lg:col-span-5 xl:col-span-4', panel?.wrapper)}>
                        <div
                            className={classNamesTailwind(
                                panel?.content,
                                'bg-white pb-4 rounded visible h-full flex flex-col max-h-[40rem] overflow-auto z-20 relative shadow-lg'
                            )}
                        >
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PanelHeading = ({ children }: Props) => {
    const { classNames } = useContext(SettingContext);
    const { panel } = classNames ?? {};

    return <div className={classNamesTailwind('p-4', panel?.heading)}>{children}</div>;
};

const PanelBody = ({ children }: Props) => {
    const { selectedLocation } = useContext(LocationFinderContext);
    const { classNames } = useContext(SettingContext);
    const { panel } = classNames ?? {};

    return <div className={classNamesTailwind('bg-white', { 'overflow-y-auto divide-y': !selectedLocation }, panel?.body)}>{children}</div>;
};

Panel.Heading = PanelHeading;
Panel.HeadingTop = HeadingTop;
Panel.Body = PanelBody;

export default Panel;
