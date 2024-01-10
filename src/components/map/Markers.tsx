import Marker from './Marker';
import { useEffect } from 'react';
import { MarkerClusterer, SuperClusterAlgorithm } from '@googlemaps/markerclusterer';
import { Location } from 'src/types';
import { useLocationFinder } from 'src/hooks';
import { MarkerProps } from '@react-google-maps/api';

export interface MarkersProps {
    marker?: Omit<MarkerProps, 'position'>;
    cluster?: {
        enabled: boolean;
        marker?: Omit<MarkerProps, 'position'>;
        minZoom: number;
        maxZoom: number;
    };
}

const Markers = ({ marker, cluster }: MarkersProps) => {
    const { locations, loading, map, onLocationClick } = useLocationFinder();

    if (loading) {
        return null;
    }

    // Methods.
    const getGoogleMapsMarkers = (locations: Location[]) => {
        return locations.map((location) => {
            const mapMarker = new google.maps.Marker({
                position: location.position,
                ...marker
            });

            mapMarker.addListener('click', () => onLocationClick(location.id));

            return mapMarker;
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
                        },
                        ...cluster.marker
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
                <Marker key={index} {...marker} location={location} />
            ))}
        </>
    );
};

export default Markers;
