import { GoogleMap } from '@react-google-maps/api';
import { classNamesTailwind } from '../../utils/helpers';
import { useContext, useEffect } from 'react';
import { useGoogleMapApi } from '../../hooks/useGoogleMapApi';
import { BOUNDS_NETHERLANDS, DEFAULT_CENTER, DEFAULT_ZOOM } from '../../utils/constants';
import { SettingContext } from '../../contexts/settingContext';
import { Props } from '..';
import { useOnLocationEvent } from 'src/hooks';
import { MapContext } from 'src/contexts/mapContext';
import { LocationFinderContext } from 'src/contexts/locationFinderContext';

const Map = ({ children }: Props) => {
    const { classNames, mapConfig } = useContext(SettingContext);
    const { map } = useContext(MapContext);
    const { locations } = useContext(LocationFinderContext);

    const { handleSelectedLocation } = useOnLocationEvent();
    const { loadMap, handleOnMapIdle } = useGoogleMapApi();

    const urlSearchParams = new URLSearchParams(document.location.search);
    const locationSlug = urlSearchParams.get('location');

    const {
        defaultBounds = BOUNDS_NETHERLANDS,
        defaultCenter = DEFAULT_CENTER,
        defaultZoom = DEFAULT_ZOOM,
        maxZoom = 16,
        minZoom = 8,
        styles
    } = mapConfig ?? {};

    useEffect(() => {
        if (locationSlug && locations) {
            const selectedLocationId = locationSlug.split(/[- ]+/).pop();
            const result = locations.filter((location) => location.id.toString() === selectedLocationId).pop();

            if (result) {
                handleSelectedLocation(result);
            }
        }
    }, [loadMap, locations, locationSlug]);

    return (
        <GoogleMap
            onLoad={loadMap}
            mapContainerClassName={classNamesTailwind('w-full relative z-0 h-[60vh] min-h-[25rem] md:h-screen', classNames?.map)}
            zoom={defaultZoom}
            center={defaultCenter}
            onIdle={handleOnMapIdle}
            options={{
                maxZoom: maxZoom,
                minZoom: minZoom,
                restriction: {
                    latLngBounds: defaultBounds
                },
                mapTypeControl: false,
                styles: styles,
                disableDoubleClickZoom: true
            }}
        >
            {children}
        </GoogleMap>
    );
};

export default Map;
