import type { Meta, StoryObj } from '@storybook/react';
import { Key } from 'react';

// Local.
import useLocationFinder from 'src/hooks/useLocationFinder';
import { Map } from '../map';
import { Card } from '../card';

// NextUI.
import { CardBody, ListboxItem, Listbox, Input, ScrollShadow, Skeleton, Button, CardHeader, CardFooter } from '@nextui-org/react';

// Google Maps.
import { Autocomplete } from '@react-google-maps/api';
import { LocationOpeningHours } from 'src/types';
import { OpeningHourLabel, OpeningHours } from '../content';
import { useLoadMore } from 'src/hooks';

const meta = {
    title: 'map/Map',
    component: Map
} satisfies Meta<typeof Map>;

export default meta;
type Story = StoryObj<typeof Map>;

const Search = () => {
    const { defaultSearch, loading } = useLocationFinder();

    if (loading) {
        return <Skeleton className="h-9 rounded-md" />;
    }

    return (
        <Autocomplete className="w-full">
            <Input classNames={{ inputWrapper: 'rounded-md' }} size="sm" defaultValue={defaultSearch} />
        </Autocomplete>
    );
};

export const Primary: Story = {
    render: () => {
        const { onLocationClick, selectedLocation, onBackClick } = useLocationFinder<LocationOpeningHours>();
        const { pagedListLocations, onButtonClick, hasMore } = useLoadMore<LocationOpeningHours>();

        // Methods.
        const handleOnLocationClick = (key: Key) => {
            onLocationClick(key as string);
        };

        return (
            <>
                {/* Replace 500px with the disired height (md:h-screen). */}
                <Map mapContainerClassName="h-[500px] md:h-[500px]" />
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
            </>
        );
    }
};
