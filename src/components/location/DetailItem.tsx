import { useContext } from 'react';
import { LocationFinderContext } from '../../contexts/locationFinderContext';
import { classNamesTailwind } from '../../utils/helpers';
import Back from './detail/Back';
import OpeningHours from './detail/OpeningHours';
import Image from './detail/Image';
import Content from './detail/Content';
import { SettingContext } from '../../contexts/settingContext';
import { useOnLocationEvent } from 'src/hooks';

const DetailItem = () => {
    const { selectedLocation } = useContext(LocationFinderContext);
    const { renders, classNames } = useContext(SettingContext);
    const { unsetSelectedLocation } = useOnLocationEvent();

    const { renderDetailBackButton, renderDetailImage, renderDetailContent, renderDetailOpeningHours, renderDetailDirections } =
        renders ?? {};

    const { detailItem } = classNames ?? {};

    const location = selectedLocation;

    const onHandleClick = () => {
        unsetSelectedLocation();
    };

    return (
        <>
            {location && (
                <div className={classNamesTailwind('p-4', detailItem?.wrapper)}>
                    {renderDetailBackButton ? (
                        renderDetailBackButton({ onHandleClick })
                    ) : (
                        <DetailItem.Back onHandleClick={onHandleClick} className={detailItem?.backButton} />
                    )}
                    {renderDetailImage ? (
                        renderDetailImage({ location })
                    ) : (
                        <DetailItem.Image location={location} className={detailItem?.image} />
                    )}

                    <div className={classNamesTailwind(detailItem?.contentWrapper)}>
                        {renderDetailContent ? (
                            renderDetailContent({ location })
                        ) : (
                            <DetailItem.Content location={location} className={detailItem?.content} />
                        )}

                        {renderDetailOpeningHours ? (
                            renderDetailOpeningHours(location?.openingHours?.days!)
                        ) : (
                            <DetailItem.OpeningHours openingHours={location?.openingHours?.days!} />
                        )}
                    </div>
                    {renderDetailDirections && renderDetailDirections({ location })}
                </div>
            )}
        </>
    );
};

DetailItem.Back = Back;
DetailItem.Image = Image;
DetailItem.Content = Content;
DetailItem.OpeningHours = OpeningHours;

export default DetailItem;
