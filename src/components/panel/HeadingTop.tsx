import { useContext } from 'react';
import { SettingContext } from '../../contexts/settingContext';
import { classNamesTailwind } from 'src/utils/helpers';

type HeadingTopProps = {
    numberOfLocations?: number;
};
const HeadingTop = ({ numberOfLocations }: HeadingTopProps) => {
    const { labels, classNames } = useContext(SettingContext);
    const { findDealerNearby = 'Vind een locatie in de buurt', dealers = `${numberOfLocations} locaties` } = labels ?? {};

    const { panel } = classNames ?? {};

    return (
        <div className={classNamesTailwind('mb-4 flex h-max items-center justify-between', panel?.headingTop?.wrapper)}>
            <h1 className={classNamesTailwind('text-base font-extrabold text-dark', panel?.headingTop?.title)}>{findDealerNearby}</h1>
            <span className={classNamesTailwind('text-xs', panel?.headingTop?.subTitle)}>{dealers}</span>
        </div>
    );
};

export default HeadingTop;
