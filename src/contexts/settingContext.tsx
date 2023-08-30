import { ReactNode, createContext, useState } from 'react';
import { LocationProps, OpeningHoursDaysType } from './locationFinderContext';
import { Props } from 'src/components';

export type MapConfig = {
    defaultZoom?: number;
    defaultCenter?: google.maps.LatLngLiteral;
    defaultBounds?: google.maps.LatLngBoundsLiteral;
    maxZoom?: number;
    minZoom?: number;
    styles?: google.maps.MapTypeStyle[];
};

export type MarkerIcon = {
    url: string;
    width: number;
    height: number;
};

export interface Labels {
    findDealerNearby?: string;
    dealers?: string;
    placeholder?: string;
    backButtonLabel?: string;
    openingHoursLabel?: string;
    timeLabel?: string;
    dayLabel?: string;
    hoursLabel?: string;
    closedLabel?: string;
}

export type ClassNameList = {
    wrapper?: string;
    map?: string;
    skeleton?: {
        panel?: string;
        panelHeading?: string;
        panelBody?: string;
        listItem?: string;
        map?: string;
    };
    panel?: {
        section?: string;
        wrapper?: string;
        content?: string;
        heading?: string;
        body?: string;
        headingTop?: {
            wrapper?: string;
            title?: string;
            subTitle?: string;
        };
    };
    autocomplete?: {
        wrapper?: string;
        inputWrapper?: string;
        input?: string;
        button?: string;
        iconWrapper?: string;
        iconVerified?: string;
        icon?: string;
    };
    list?: {
        overview?: string;
    };
    listItem?: {
        wrapper?: string;
        item?: string;
        distance?: string;
        distanceKm?: string;
        distanceKmLabel?: string;
        title?: string;
        street?: string;
    };
    detailItem?: {
        wrapper?: string;
        backButton?: string;
        image?: string;
        contentWrapper?: string;
        content?: string;
        openingHours?: {
            label?: string;
        };
    };
};

export interface Renders {
    loadingSlot?: ReactNode;
    renderPanelHeaderTop?: ({ numberOfLocations }: { numberOfLocations: number }) => ReactNode;
    renderPanelHeaderBottom?: ({ numberOfLocations }: { numberOfLocations: number }) => ReactNode;
    renderListItem?: ({ location }: { location: LocationProps }) => ReactNode;
    renderListDetail?: ({ location }: { location: LocationProps }) => ReactNode;
    renderDetailBackButton?: ({ onHandleClick }: { onHandleClick: () => void }) => ReactNode;
    renderDetailImage?: ({ location }: { location: LocationProps }) => ReactNode;
    renderDetailContent?: ({ location }: { location: LocationProps }) => ReactNode;
    renderDetailOpeningHours?: ({ openingHours }: { openingHours?: OpeningHoursDaysType }) => ReactNode;
    renderDetailDirections?: ({ location }: { location: LocationProps }) => ReactNode;
}

export type SettingContextType = {
    markerIcon?: MarkerIcon;
    renders?: Renders;
    labels?: Labels;
    classNames?: ClassNameList | undefined;
    mapConfig?: MapConfig;
    setRenders: (renders: Renders) => void;
    setClassNames: (classNames: ClassNameList) => void;
    setMapConfig: (config: MapConfig) => void;
    setLabels: (labels: Labels) => void;
    setMarkerIcon: (marker: MarkerIcon) => void;
};

export const SettingContext = createContext<SettingContextType>({
    setMarkerIcon: (marker) => marker,
    setRenders: (renders) => renders,
    setClassNames: (classNames) => classNames,
    setMapConfig: (mapConfig) => mapConfig,
    setLabels: (labels) => labels
});

export const SettingProvider = ({ children }: Props) => {
    const [markerIcon, setMarkerIcon] = useState<MarkerIcon | undefined>();
    const [renders, setRenders] = useState<Renders | undefined>();
    const [classNames, setClassNames] = useState<ClassNameList>();
    const [mapConfig, setMapConfig] = useState<MapConfig | undefined>();
    const [labels, setLabels] = useState<Labels | undefined>();

    return (
        <SettingContext.Provider
            value={{
                markerIcon,
                labels,
                mapConfig,
                renders,
                classNames,
                setRenders,
                setClassNames,
                setMapConfig,
                setLabels,
                setMarkerIcon
            }}
        >
            {children}
        </SettingContext.Provider>
    );
};
