import { Autocomplete } from '@react-google-maps/api';
import { classNamesTailwind } from '../../utils/helpers';
import { forwardRef, useContext } from 'react';
import { useOnAutocomplete } from '../../hooks/useOnAutocomplete';
import GeoLocationButton from './GeoLocationButton';
import { SettingContext } from '../../contexts/settingContext';

type AutocompleteProps = {
  handleOnPlaceChanged?: () => void;
  handleOnInputChange?: () => void;
  handleOInputLocationButtonClick?: () => void;
};

const AutocompletePanel = forwardRef<HTMLInputElement, AutocompleteProps>(
  ({}, ref) => {
    const {
      loadAutocomplete,
      onInputChange,
      onPlaceChange,
    } = useOnAutocomplete();

    const { classNames, labels } = useContext(SettingContext);
    const { autocomplete } = classNames ?? {};
    const { placeholder = 'Zoek op een plaats of locatie' } = labels ?? {};

    return (
      <div
        className={classNamesTailwind(
          'flex items-stretch focus-within:z-10',
          autocomplete?.wrapper
        )}
      >
        <Autocomplete
          onLoad={loadAutocomplete}
          className={classNamesTailwind(
            'border border-r-0 p-2 rounded rounded-r-none border-gray-300 flex-grow',
            autocomplete?.inputWrapper
          )}
          onPlaceChanged={onPlaceChange}
        >
          <input
            ref={ref}
            onChange={onInputChange}
            className={classNamesTailwind(
              'block w-full  placeholder-gray-400 border-r-0',
              autocomplete?.input
            )}
            placeholder={placeholder}
            type="text"
          />
        </Autocomplete>
        <GeoLocationButton />
      </div>
    );
  }
);

export default AutocompletePanel;
