import { useJsApiLoader } from '@react-google-maps/api';
import { PropsWithChildren, ReactNode, useContext, useEffect } from 'react';
import { LIBRARIES } from '../utils/constants';
import { classNamesTailwind } from '../utils/helpers';
import { ClassNameList, MapConfig, Renders, Labels, SettingContext, SettingProvider, MarkerIcon } from '../contexts/settingContext';
import { LocationFinderProvider, LocationProps } from '../contexts/locationFinderContext';

import LocationFinderMap from './map';
import LocationFinderPanel from './panel';
import { MapProvider } from '../contexts/mapContext';
import LoadingSkeleton from './LoadingSkeleton';

export type Props = {
    children?: ReactNode;
};

interface LocationFinderProps extends LocationFinderWrapperProps {
    config: {
        apiKey: string;
        region: string;
        locale: string;
    };
    locations: LocationProps[];
}

interface LocationFinderWrapperProps {
    classNames?: ClassNameList;
    mapConfig?: MapConfig;
    renders?: Renders;
    labels?: Labels;
    markerIcon?: MarkerIcon;
}

export const LocationFinder = ({
    config,
    mapConfig,
    locations,
    renders,
    classNames,
    labels,
    markerIcon,
    children
}: PropsWithChildren<LocationFinderProps>) => {
    const { loadingSlot } = renders ?? {};
    const { apiKey, locale, region } = config;

    if (Boolean(apiKey) === false) {
        throw new Error('Google maps api key is required');
    }

    if (locations.length === 0) {
        throw new Error('No locations found');
    }

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: apiKey,
        libraries: LIBRARIES,
        language: locale ?? 'nl',
        region: region ?? 'NL'
    });

    if (!isLoaded) {
        return <>{loadingSlot ?? <LoadingSkeleton classNames={classNames} />}</>;
    }

    return (
        <SettingProvider>
            <LocationFinder.Wrapper mapConfig={mapConfig} renders={renders} classNames={classNames} labels={labels} markerIcon={markerIcon}>
                <MapProvider>
                    <LocationFinderProvider>
                        <LocationFinder.Panel locations={locations} />
                        <LocationFinder.Map />
                        {children}
                    </LocationFinderProvider>
                </MapProvider>
            </LocationFinder.Wrapper>
        </SettingProvider>
    );
};

const LocationFinderWrapper = ({
    mapConfig,
    renders,
    classNames,
    labels,
    markerIcon,
    children
}: PropsWithChildren<LocationFinderWrapperProps>) => {
    const { setRenders, setClassNames, setMapConfig, setLabels, setMarkerIcon } = useContext(SettingContext);

    useEffect(() => {
        renders && setRenders(renders);
        classNames && setClassNames(classNames);
        mapConfig && setMapConfig(mapConfig);
        labels && setLabels(labels);
        markerIcon && setMarkerIcon(markerIcon);
    }, []);

    return <div className={classNamesTailwind('w-full relative', classNames?.wrapper)}>{children}</div>;
};

LocationFinder.Map = LocationFinderMap;
LocationFinder.Panel = LocationFinderPanel;
LocationFinder.Wrapper = LocationFinderWrapper;
