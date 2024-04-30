import Marker from './Marker';
import { useEffect, useState } from 'react';
import { MarkerClusterer, SuperClusterAlgorithm } from '@googlemaps/markerclusterer';
import { Location } from 'src/types';
import { useLocationFinder } from 'src/hooks';
import { MarkerProps } from '@react-google-maps/api';

export interface MarkersProps {
    marker?: Omit<MarkerProps, 'position'> | ((selected: boolean) => Omit<MarkerProps, 'position'>);
    cluster?: {
        enabled: boolean;
        marker?: Omit<MarkerProps, 'position'>;
        minZoom: number;
        maxZoom: number;
    };
}

const Markers = ({ marker, cluster }: MarkersProps) => {
    const { locations, selectedLocation, loading, map, onLocationClick, setPendingRefine } = useLocationFinder();
    const [clusterer, setClusterer] = useState<MarkerClusterer | undefined>(undefined);

    if (loading) {
        return null;
    }

    // Methods.
    const getGoogleMapsMarkers = (locations: Location[]) => {
        return locations.map((location) => {
            const mapMarker = new google.maps.Marker({
                position: location.position,
                ...(typeof marker === 'function' ? marker(location.id === selectedLocation?.id) : marker)
            });

            mapMarker.set('id', location.id);
            mapMarker.addListener('click', () => onLocationClick(location.id));

            return mapMarker;
        });
    };

    const markers = getGoogleMapsMarkers(locations) ?? [];
    const handleOnLoad = (map: google.maps.Map) => {
        if (!cluster?.enabled) {
            return;
        }

        const clusterer = new MarkerClusterer({
            map,
            // onClusterClick: (cluster) => {
            //     const zoom = map.getZoom();

            //     if (cluster.latLng && zoom) {
            //         map.setCenter(cluster.latLng);
            //         map.setZoom(zoom + 1);
            //         setPendingRefine(true)
            //     }
            // },
            markers,
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
                            scale: 16
                        },
                        ...cluster.marker
                    });
                }
            }
        });

        setClusterer(clusterer);
    };

    useEffect(() => {
        if (map) {
            handleOnLoad(map);
        }
    }, [map]);

    useEffect(() => {
        // @ts-ignore, markers is a private property, find a better way to do this.
        const location = (clusterer?.markers as google.maps.Marker[])?.find((marker) => marker.get('id') === selectedLocation?.id);

        if (location && clusterer) {
            clusterer.removeMarker(location);

            const newMarker = new google.maps.Marker({
                ...location,
                ...(typeof marker === 'function' ? marker(location.get('id') === selectedLocation?.id) : marker)
            });

            newMarker.addListener('click', () => onLocationClick(location.get('id')));
            clusterer.addMarker(newMarker);
        }
    }, [selectedLocation, clusterer]);

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
