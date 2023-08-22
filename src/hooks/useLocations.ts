import { useContext } from 'react';
import { LocationFinderContext, LocationProps, OpeningHoursDaysDayType } from '../contexts/locationFinderContext';
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
    const setLocationFinderFormat = (locations: any, baseUrl: string): LocationProps => {
        return locations.map((location: any) => {
            const days = location.days?.filter(notNull);

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
                openingHours:
                    days && Boolean(days.length)
                        ? {
                              days: days.reduce(({ a, c }: { a: any; c: any }) => {
                                  const day = dayMap.get(c.day);

                                  if (day) {
                                      a[day] = {
                                          closed: c.closed,
                                          slots:
                                              c.slots?.filter(notNull).map((slot: any) => ({
                                                  from: formatTime(slot.from),
                                                  to: formatTime(slot.to)
                                              })) ?? []
                                      };
                                  }

                                  return a;
                              }, {} as { [key: number]: OpeningHoursDaysDayType })
                          }
                        : undefined
            };
        });
    };

    return { formatListLocations, setLocationFinderFormat };
};
