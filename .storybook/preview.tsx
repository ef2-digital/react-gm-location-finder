import React from 'react';
import type { Preview } from '@storybook/react';
import { useJsApiLoader } from '@react-google-maps/api';

import '../src/index.css';
import { Location, LocationOpeningHours } from '../src/types';
import { LocationFinderProvider } from '../src/contexts/LocationFinderContext';
import { NextUIProvider } from '@nextui-org/react';
import { setHours } from 'date-fns';

const locations: Location<LocationOpeningHours>[] = [
    {
        id: '0',
        position: {
            lat: 52.370216,
            lng: 4.895168
        },
        openingHours: {
            days: {
                0: {
                    closed: false,
                    slots: [
                        {
                            from: setHours(new Date(), 9),
                            to: setHours(new Date(), 17)
                        }
                    ]
                },
                1: {
                    closed: false,
                    slots: [
                        {
                            from: setHours(new Date(), 9),
                            to: setHours(new Date(), 17)
                        }
                    ]
                },
                2: {
                    closed: false,
                    slots: [
                        {
                            from: setHours(new Date(), 9),
                            to: setHours(new Date(), 17)
                        }
                    ]
                }
            }
        }
    },
    {
        id: '1',
        position: {
            lat: 52.38,
            lng: 4.895168
        }
    },
    {
        id: '2',
        position: {
            lat: 52.38,
            lng: 4.9
        }
    },
    {
        id: '3',
        position: {
            lat: 52.38,
            lng: 5
        }
    },
    {
        id: '4',
        position: {
            lat: 52.4,
            lng: 5
        }
    },
    {
        id: '5',
        position: {
            lat: 52.5,
            lng: 5
        }
    },
    {
        id: '6',
        position: {
            lat: 52.6,
            lng: 5
        }
    },
    {
        id: '7',
        position: {
            lat: 52.7,
            lng: 5
        }
    },
    {
        id: '8',
        position: {
            lat: 52.8,
            lng: 5
        }
    },
    {
        id: '9',
        position: {
            lat: 52.9,
            lng: 5
        }
    },
    {
        id: '10',
        position: {
            lat: 53,
            lng: 5
        }
    },
    {
        id: '11',
        position: {
            lat: 53.1,
            lng: 5
        }
    },
    {
        id: '12',
        position: {
            lat: 53.2,
            lng: 5
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
                libraries: ['places'],
                language: 'nl',
                region: 'nl'
            });

            return (
                <NextUIProvider>
                    <LocationFinderProvider loading={!isLoaded} locations={locations}>
                        <Story />
                    </LocationFinderProvider>
                </NextUIProvider>
            );
        }
    ]
};

export default preview;
