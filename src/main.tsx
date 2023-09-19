import React from 'react';
import ReactDOM from 'react-dom';
import { LocationFinderProvider } from './hooks/useLocationFinder';
import Map from './components/Map';
import { useJsApiLoader } from '@react-google-maps/api';
import './index.css';

const App = () => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: ''
        
    });

    if (!isLoaded) {
        return null;
    }

    return (
        <LocationFinderProvider locations={[]}>
            <Map>
                <Map.Content>sdf</Map.Content>
            </Map>
        </LocationFinderProvider>
    );
};

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);
