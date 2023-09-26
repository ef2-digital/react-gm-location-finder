import type { Meta, StoryObj } from '@storybook/react';

import useLocationFinder from 'src/hooks/useLocationFinder';
import PlacesFinder from './PlacesFinder';
import { Button, Card, CardBody, CardHeader, Divider, Input, Skeleton } from '@nextui-org/react';
import { Autocomplete } from '@react-google-maps/api';
import usePlacesFinder from 'src/hooks/usePlacesFinder';

const meta = {
    title: 'places/PlacesFinder',
    component: PlacesFinder,
    parameters: {
        backgrounds: { default: 'dark' }
    }
} satisfies Meta<typeof PlacesFinder>;

export default meta;
type Story = StoryObj<typeof PlacesFinder>;

export const Primary: Story = {
    render: () => {
        // Hooks.
        const { locations, loading } = useLocationFinder(); // Optional.
        const { onPlaceChanged, onAutocompleteLoad, inputRef, onButtonClick } = usePlacesFinder();

        if (loading) {
            return (
                <div className="container mx-auto px-4">
                    <Card>
                        <CardHeader className="flex-col items-start">
                            <Skeleton className="rounded w-[60%] mb-2">
                                <div className="h-4 rounded bg-gray-300"></div>
                            </Skeleton>
                            <Skeleton className="rounded w-[40%]">
                                <div className="h-4 rounded bg-gray-300"></div>
                            </Skeleton>
                        </CardHeader>
                    </Card>
                </div>
            );
        }

        return (
            <div className="container mx-auto px-4">
                <Card>
                    <CardHeader className="flex-col items-start">
                        <p>Vind een locatie in de buurt</p>
                        <small>{locations.length} locaties gevonden</small> {/* Optional. */}
                    </CardHeader>
                    <Divider />
                    <CardBody>
                        <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged}>
                            <div className="flex gap-2">
                                <Input ref={inputRef} />
                                <Button color="primary" onClick={onButtonClick}>
                                    Zoeken
                                </Button>
                            </div>
                        </Autocomplete>
                    </CardBody>
                </Card>
            </div>
        );
    }
};
