import { useContext } from 'react';
import { LocationFinderContext, LocationProps } from '../contexts/locationFinderContext';
import { useDistances } from './useDistances';
import { notNull } from '../utils/helpers';
import { useOpeningHours } from './useOpeningHours';
import { MapContext } from '../contexts/mapContext';

export const useLocations = () => {
    const { calculateDistance } = useDistances();
    const { formatTime, dayMap } = useOpeningHours();
    const { setRefinedLocations, locations } = useContext(LocationFinderContext);
    const { map, showDistance } = useContext(MapContext);

    const formatListLocations = () => {
        const center = map?.getCenter();

        if (!center || !locations || locations.length === 0) {
            return;
        }

        setRefinedLocations(
            showDistance
                ? locations
                      .map((location) => ({
                          ...location,
                          distance: calculateDistance(center, location.position)
                      }))
                      .sort((a, b) => a.distance - b.distance)
                : locations
        );
    };

    // format locations for correct format
    const setLocationFinderFormat = (locations: any, baseUrl: string): LocationProps[] => {
        return locations.map((location: any) => {
            const days = location.days?.filter(notNull);
            let weekDays: any[] = [];

            days.map((day: any) => {
                let weekDay = dayMap.get(day.day);

                if (typeof weekDay !== 'undefined') {
                    return (weekDays[weekDay] = {
                        closed: day.closed,
                        slots:
                            day.slots?.filter(notNull).map((slot: any) => ({
                                from: formatTime(slot.from),
                                to: formatTime(slot.to)
                            })) ?? []
                    });
                }
            });

            return {
                city: location.city,
                id: location.externalId ?? location.id,
                title: location.name,
                street: location.street,
                position: {
                    lat: parseFloat(location.geolocation.lat),
                    lng: parseFloat(location.geolocation.lng)
                },
                phone: location.phone,
                email: location.email,
                image: location.image?.data?.attributes ? [`${baseUrl}${location.image.data.attributes.url}?resize=800x400`] : undefined,
                openingHours: { days: weekDays },
                attributes: location.attributes ?? {}
            };
        });
    };

    const renderDirections = (location: LocationProps) => {
        return { link: `https://www.google.com/maps/dir/${location.position.lat},${location.position.lng}` };
    };

    return { formatListLocations, setLocationFinderFormat, renderDirections };
};
