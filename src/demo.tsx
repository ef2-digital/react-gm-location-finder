import { NextUIProvider } from '@nextui-org/react';
import { useJsApiLoader } from '@react-google-maps/api';
import { LocationFinderProvider } from './contexts/LocationFinderContext';
import { Location, LocationOpeningHours } from './types';
import { setHours } from 'date-fns';
import { Map, Markers } from './components/map';
import locations from './data.json';
const Demo = () => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: 'AIzaSyBY1k591VeGe3EYp3yL5Umsu7Z4CPJfY30',
        libraries: ['places'],
        language: 'nl',
        region: 'nl'
    });

    console.log(locations);
    return (
        <NextUIProvider>
            {isLoaded ? <div>Loaded</div> : <div>Loading</div>}
            <LocationFinderProvider loading={!isLoaded} locations={locations} useCurrentLocation={false}>
                <Map mapContainerStyle={{ height: '500px' }}>
                    <Markers />
                </Map>
            </LocationFinderProvider>
            <div>
                <strong>Dummy data:</strong>
            </div>
            <div style={{ overflow: 'auto', height: '500px' }}>
                <pre>{JSON.stringify(locations, null, 2)}</pre>
            </div>
        </NextUIProvider>
    );
};

export default Demo;
