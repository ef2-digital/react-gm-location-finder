import { createContext, useState } from 'react';
import { Props } from 'src/components';

export interface LocationProps {
    id: number;
    title: string;
    position: google.maps.LatLngLiteral;
    distance?: number;
    street: string;
    city: string;
    openingHours?: OpeningHoursType;
    image?: string[];
    phone?: string;
    email?: string;
    attributes?: { [key: string]: string };
}

export interface OpeningHoursType {
    days: OpeningHoursDaysType;
}

export interface OpeningHoursDaysType {
    [key: number]: OpeningHoursDaysDayType;
}

export interface OpeningHoursDaysDayType {
    closed?: boolean;
    slots: OpeningHoursDaysDaySlotType[];
}

export interface OpeningHoursDaysDaySlotType {
    from: OpeningHoursDaysDaySlotTimeType;
    to: OpeningHoursDaysDaySlotTimeType;
}

export interface OpeningHoursDaysDaySlotTimeType {
    hours: number;
    minutes: number;
}

export type LocationFinderContextType = {
    selectedLocation?: LocationProps;
    refinedLocations: LocationProps[] | [];
    locations: LocationProps[] | [];
    setSelectedLocation: (location: LocationProps | undefined) => void;
    setRefinedLocations: (locations: LocationProps[]) => void;
    setLocations: (locations: LocationProps[]) => void;
};

export const LocationFinderContext = createContext<LocationFinderContextType>({
    refinedLocations: [],
    locations: [],
    setSelectedLocation: (location?: LocationProps) => {},
    setRefinedLocations: (locations: LocationProps[]) => {},
    setLocations: (locations: LocationProps[]) => {}
});

export const LocationFinderProvider = ({ children }: Props) => {
    const [selectedLocation, setSelectedLocation] = useState<LocationProps | undefined>();
    const [refinedLocations, setRefinedLocations] = useState<LocationProps[] | []>([]);
    const [locations, setLocations] = useState<LocationProps[] | []>([]);

    return (
        <LocationFinderContext.Provider
            value={{
                selectedLocation,
                locations,
                refinedLocations,
                setSelectedLocation,
                setRefinedLocations,
                setLocations
            }}
        >
            {children}
        </LocationFinderContext.Provider>
    );
};
