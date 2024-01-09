import Marker from './Marker';
import { useEffect } from 'react';
import { MarkerClusterer, SuperClusterAlgorithm } from '@googlemaps/markerclusterer';
import { Location } from 'src/types';
import { useLocationFinder } from 'src/hooks';

export interface MarkersProps {
    icon?: google.maps.Icon;
    cluster?: {
        enabled: boolean;
        icon?: google.maps.Icon;
        minZoom: number;
        maxZoom: number;
    };
}

const Markers = ({ icon, cluster }: MarkersProps) => {
    const { locations, loading, map, onLocationClick } = useLocationFinder();

    if (loading) {
        return null;
    }

    // Methods.
    const getGoogleMapsMarkers = (locations: Location[]) => {
        return locations.map((location) => {
            const marker = new google.maps.Marker({
                position: location.position,
                icon: icon
            });

            marker.addListener('click', () => onLocationClick(location.id));

            return marker;
        });
    };

    const handleOnLoad = (map: google.maps.Map) => {
        if (!cluster?.enabled) {
            return;
        }

        new MarkerClusterer({
            map,
            markers: getGoogleMapsMarkers(locations) ?? [],
            algorithm: new SuperClusterAlgorithm({
                maxZoom: cluster.maxZoom,
                minZoom: cluster.minZoom,
                radius: 160
            }),
            renderer: {
                render: ({ count, position }) => {
                    return new google.maps.Marker({
                        position,
                        label: {
                            text: count.toString(),
                            fontWeight: 'bold',
                            color: '#002B4B'
                        },
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            fillColor: '#FFC107',
                            fillOpacity: 1,
                            strokeWeight: 0,
                            scale: 16,
                            ...cluster.icon
                        }
                    });
                }
            }
        });
    };

    useEffect(() => {
        if (map) {
            handleOnLoad(map);
        }
    }, [map]);

    if (cluster?.enabled) {
        return null;
    }

    return (
        <>
            {locations.map((location, index) => (
                <Marker key={index} icon={icon} location={location} />
            ))}
        </>
    );
};
export default Markers;
