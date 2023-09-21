import React from 'react';
import type { Preview } from '@storybook/react';
import { useJsApiLoader } from '@react-google-maps/api';

import '../src/index.css';
import { LocationFinderProvider } from '../src/hooks/useLocationFinder';
import { NextUIProvider } from '@nextui-org/react';

const locations = [
    {
        id: '0',
        position: {
            lat: 52.370216,
            lng: 4.895168
        }
    },
    {
        id: '1',
        position: {
            lat: 52.38,
            lng: 4.895168
        }
    }
];

const preview: Preview = {
    parameters: {
        actions: { argTypesRegex: '^on[A-Z].*' },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/
            }
        }
    },
    decorators: [
        (Story) => {
            const { isLoaded } = useJsApiLoader({
                id: 'google-map-script',
                // @ts-ignore, this is a storybook env variable.
                googleMapsApiKey: import.meta.env.STORYBOOK_GOOGLE_API_KEY || '',
                libraries: ["places"]
            });

            if (!isLoaded) {
                // TODO: Add a loading indicator.
                return <></>;
            }

            return (
                <NextUIProvider>
                    <LocationFinderProvider locations={locations}>
                        <Story />
                    </LocationFinderProvider>
                </NextUIProvider>
            );
        }
    ]
};

export default preview;
