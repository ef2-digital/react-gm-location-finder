import { useContext, useState } from 'react';
import { classNamesTailwind } from '../../utils/helpers';
import { useOnLocationEvent } from '../../hooks/useOnLocationEvent';
import OpeningHoursSlot from './list/OpeningHours';
import { MapContext } from '../../contexts/mapContext';
import { LocationProps } from '../../contexts/locationFinderContext';
import { SettingContext } from '../../contexts/settingContext';

type ListItemProps = {
  location: LocationProps;
  showOpeningHours: boolean;
};

const ListItem = ({ location, showOpeningHours = true }: ListItemProps) => {
  const { showDistance } = useContext(MapContext);
  const { classNames } = useContext(SettingContext);
  const { handleSelectedLocation } = useOnLocationEvent();

  const { listItem } = classNames ?? {};

  const handleOnItemClick = () => {
    handleSelectedLocation(location);
  };

  return (
    <div
      className={classNamesTailwind(
        'hover:bg-gray-50 hover:cursor-pointer',
        listItem?.wrapper
      )}
      onClick={() => handleOnItemClick()}
    >
      <div
        className={classNamesTailwind(
          'flex items-center text-sm text-gray-500 px-4 py-4 overflow-hidden',
          listItem?.item
        )}
      >
        {showDistance && (
          <span
            className={classNamesTailwind(
              'bg-indigo-50 rounded-full inline-flex w-12 h-12 items-center justify-center flex-col leading-[1.2] text-xs text-indigo-600 mr-4',
              listItem?.distance
            )}
          >
            <span
              className={classNamesTailwind('font-bold', listItem?.distanceKm)}
            >
              {location.distance?.toFixed(1)}
            </span>
            <span className={listItem?.distanceKmLabel}>km</span>
          </span>
        )}
        <div className={classNamesTailwind('min-w-0 flex-1')}>
          <div className="flex flex-col text-sm">
            <span
              className={classNamesTailwind(
                'truncate font-medium text-indigo-600 block',
                listItem?.title
              )}
            >
              {location.title}
            </span>
            <address
              className={classNamesTailwind(
                'font-normal text-gray-500 not-italic',
                listItem?.street
              )}
            >
              {location.street}, {location.city}
            </address>
          </div>
          {showOpeningHours && location.openingHours && (
            <OpeningHoursSlot openingHours={location.openingHours} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ListItem;
