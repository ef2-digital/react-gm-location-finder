//@ts-nocheck
import { NextUIProvider } from '@nextui-org/react';
import { useJsApiLoader } from '@react-google-maps/api';
import { useEffect, useState } from 'react';
import { LocationFinderProvider } from './contexts/LocationFinderContext';
import { Map, Markers } from './components/map';
import locations from './data.json';
import List from './list';
import Search from './search';

const LIBRARIES = ['places', 'geometry'];

const MapPage = ({
    lat,
    lng,
    zoom,
    onBackClick,
    onLocationFound
}: {
    lat: number;
    lng: number;
    zoom: number;
    onBackClick: () => void;
    onLocationFound: (lat: number, lng: number, zoom?: number) => void;
}) => {
    // On map page, don't navigate or change history - updateMapAfterPlaceChanged handles URL updates
    const handleMapPageSearch = () => {
        // Do nothing - the search params are handled by updateMapAfterPlaceChanged in useLocationFinder
    };

    return (
        <div>
            <div style={{ marginBottom: '10px', padding: '10px' }}>
                <button onClick={onBackClick}>← Back to Search</button>
                <p style={{ fontSize: '12px', color: '#666' }}>
                    Location: lat={lat.toFixed(4)}, lng={lng.toFixed(4)}, zoom={zoom}
                </p>
            </div>
            <div style={{ padding: '10px', backgroundColor: '#f5f5f5', marginBottom: '10px' }}>
                <h3 style={{ marginTop: 0 }}>Search on Map</h3>
                <Search onLocationFound={handleMapPageSearch} />
            </div>
            <Map mapContainerStyle={{ height: '600px' }}>
                <Markers />
            </Map>
            <List />
        </div>
    );
};

const Demo = () => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: 'AIzaSyBY1k591VeGe3EYp3yL5Umsu7Z4CPJfY30',
        libraries: LIBRARIES,
        language: 'nl',
        region: 'nl'
    });

    const [page, setPage] = useState<'home' | 'map'>('home');
    const [mapParams, setMapParams] = useState({ lat: 52.1326, lng: 5.2913, zoom: 13 });

    // Simulate reading URL params on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const lat = params.get('lat');
        const lng = params.get('lng');
        const zoom = params.get('zoom');

        if (lat && lng) {
            setMapParams({
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                zoom: zoom ? parseInt(zoom) : 13
            });
            setPage('map');
        }
    }, []);

    const handleLocationFound = (lat: number, lng: number, zoom?: number) => {
        const newZoom = zoom || 14;
        setMapParams({ lat, lng, zoom: newZoom });
        // Simulate Next.js router.push with params
        window.history.pushState(null, '', `?lat=${lat}&lng=${lng}&zoom=${newZoom}`);
        setPage('map');
    };

    const handleBackClick = () => {
        window.history.pushState(null, '', '/');
        setPage('home');
    };

    return (
        <NextUIProvider>
            {!isLoaded && <div style={{ padding: '20px' }}>Loading Google Maps...</div>}
            {isLoaded && (
                <LocationFinderProvider loading={!isLoaded} locations={locations} useCurrentLocation={true}>
                    <MapPage
                        lat={mapParams.lat}
                        lng={mapParams.lng}
                        zoom={mapParams.zoom}
                        onBackClick={handleBackClick}
                        onLocationFound={handleLocationFound}
                    />
                </LocationFinderProvider>
            )}
        </NextUIProvider>
    );
};

export default Demo;
