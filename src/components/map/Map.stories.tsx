import type { Meta, StoryObj } from '@storybook/react';
import { Key } from 'react';

// Local.
import useLocationFinder from 'src/hooks/useLocationFinder';
import { Map, Markers } from '../map';
import { Card } from '../card';

// NextUI.
import { CardBody, ListboxItem, Listbox, Input, ScrollShadow, Skeleton, Button, CardHeader, CardFooter } from '@nextui-org/react';

// Google Maps.
import { Autocomplete } from '@react-google-maps/api';
import { LocationOpeningHours } from 'src/types';
import { OpeningHourLabel, OpeningHours } from '../content';
import { useLoadMore, usePlacesFinder } from 'src/hooks';

const meta = {
    title: 'map/Map',
    component: Map
} satisfies Meta<typeof Map>;

export default meta;
type Story = StoryObj<typeof Map>;

const Search = () => {
    const { defaultSearch, loading } = useLocationFinder();
    const { onPlaceChanged, onLoad, inputRef } = usePlacesFinder();

    if (loading) {
        return <Skeleton className="h-9 rounded-md" />;
    }

    return (
        <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
            <Input ref={inputRef} classNames={{ inputWrapper: 'rounded-md' }} size="sm" defaultValue={defaultSearch} />
        </Autocomplete>
    );
};

export const Primary: Story = {
    args: {
        // Replace 500px with the disired height (md:h-screen).
        mapContainerClassName: 'h-[500px] md:h-[500px]'
    },
    render: (args) => {
        const { onLocationClick, selectedLocation, onBackClick } = useLocationFinder<LocationOpeningHours>();
        const { pagedListLocations, onButtonClick, hasMore } = useLoadMore<LocationOpeningHours>();

        // Methods.
        const handleOnLocationClick = (key: Key) => {
            onLocationClick(key as string);
        };

        return (
            <div className="relative">
                <Map {...args}>
                    <Markers />
                </Map>
                <Map.Content classNameContainer="px-0 max-w-full md:container md:px-4">
                    {/* Replace 500px with the disired height (100vh). */}
                    <Card.Wrapper className="md:mt-8 md:mb-8 md:h-[calc(500px-4rem)]">
                        <Card>
                            {!selectedLocation ? (
                                <>
                                    <CardHeader className="bg-primary">
                                        <Search />
                                    </CardHeader>
                                    <CardBody>
                                        <ScrollShadow className="h-full" hideScrollBar>
                                            <Listbox onAction={handleOnLocationClick}>
                                                {pagedListLocations.map((location) => (
                                                    <ListboxItem key={location.id}>
                                                        {location.id}
                                                        <OpeningHourLabel location={location} />
                                                    </ListboxItem>
                                                ))}
                                            </Listbox>
                                        </ScrollShadow>
                                    </CardBody>
                                    <CardFooter className="flex-none">
                                        <Button color="primary" className="w-full" isDisabled={!hasMore} onPress={onButtonClick}>
                                            Laad meer
                                        </Button>
                                    </CardFooter>
                                </>
                            ) : (
                                <>
                                    <CardHeader className="bg-primary">
                                        <span>{selectedLocation.id}</span>
                                    </CardHeader>
                                    <CardBody>
                                        <ScrollShadow className="h-full" hideScrollBar>
                                            {selectedLocation && <OpeningHours location={selectedLocation} />}
                                        </ScrollShadow>
                                    </CardBody>
                                    <CardFooter className="flex-none">
                                        <Button className="w-full" color="primary" onClick={onBackClick}>
                                            Back
                                        </Button>
                                    </CardFooter>
                                </>
                            )}
                        </Card>
                    </Card.Wrapper>
                </Map.Content>
            </div>
        );
    }
};
