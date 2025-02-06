import { NextUIProvider } from '@nextui-org/react';
import { useJsApiLoader } from '@react-google-maps/api';
import { LocationFinderProvider } from './contexts/LocationFinderContext';
import { Map, Markers } from './components/map';
import locations from './data.json';
import List from './list';

const Demo = () => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: 'AIzaSyBY1k591VeGe3EYp3yL5Umsu7Z4CPJfY30',
        libraries: ['places', 'geometry'],
        language: 'nl',
        region: 'nl'
    });

    return (
        <NextUIProvider>
            {isLoaded ? <div>Loaded</div> : <div>Loading</div>}
            <LocationFinderProvider loading={!isLoaded} locations={locations} useCurrentLocation={false}>
                <Map mapContainerStyle={{ height: '500px' }}>
                    <Markers />
                </Map>
                <List />
            </LocationFinderProvider>
        </NextUIProvider>
    );
};

export default Demo;
