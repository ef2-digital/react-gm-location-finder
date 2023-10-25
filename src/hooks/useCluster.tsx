import { Cluster, ClusterStats, MarkerClusterer, SuperClusterViewportAlgorithm } from '@googlemaps/markerclusterer';
import { useCallback, useEffect, useState } from 'react';
import useLocationFinder from './useLocationFinder';
import { Location } from 'src/types';

interface ClusterProps<T extends Object> {
    maxZoom: number;
    onMarkerClick: (location: Location<T>) => void;
    markerOptions?: Omit<google.maps.MarkerOptions, 'position'>;
    clusterRenderer?: (
        cluster: Cluster,
        stats: ClusterStats,
        map: google.maps.Map
    ) => google.maps.Marker | google.maps.marker.AdvancedMarkerElement;
}

const useCluster = <T extends Object>({ clusterRenderer, maxZoom, markerOptions, onMarkerClick }: ClusterProps<T>) => {
    const { locations } = useLocationFinder<T>();
    const [clusterer, setClusterer] = useState<MarkerClusterer>();

    // Methods.
    const getGoogleMapsMarkers = useCallback(
        (locations: Location<T>[]) => {
            return locations.map((location) => {
                const marker = new google.maps.Marker({
                    position: location.position,
                    ...markerOptions
                });

                marker.addListener('click', () => onMarkerClick(location));

                return marker;
            });
        },
        [onMarkerClick]
    );

    const handleOnLoad = (map: google.maps.Map) => {
        const clusterer = new MarkerClusterer({
            map,
            markers: getGoogleMapsMarkers(locations),
            algorithm: new SuperClusterViewportAlgorithm({
                maxZoom: maxZoom
            }),
            ...(clusterRenderer && {
                renderer: {
                    render: clusterRenderer
                }
            })
        });

        setClusterer(clusterer);
    };

    // Life cycle.
    useEffect(() => {
        if (!clusterer) {
            return;
        }

        clusterer.clearMarkers();

        if (Boolean(locations.length)) {
            clusterer.addMarkers(getGoogleMapsMarkers(locations));
        }
    }, [clusterer, locations]);

    return {
        onLoad: handleOnLoad
    };
};

export default useCluster;
