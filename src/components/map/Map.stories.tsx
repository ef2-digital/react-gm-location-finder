import type { Meta, StoryObj } from '@storybook/react';
import { Key } from 'react';

// Local.
import useLocationFinder from 'src/hooks/useLocationFinder';
import { Map } from '../map';
import { Card } from '../card';

// NextUI.
import { CardBody, ListboxItem, Listbox, Input, ScrollShadow, Skeleton, Button } from '@nextui-org/react';

// Google Maps.
import { Autocomplete } from '@react-google-maps/api';

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
        <Autocomplete>
            <Input classNames={{ inputWrapper: 'rounded-md' }} size="sm" defaultValue={defaultSearch} />
        </Autocomplete>
    );
};

export const Primary: Story = {
    render: () => {
        const { listLocations, defaultSearch, onLocationClick, selectedLocation, onBackClick, currentLocation, map } = useLocationFinder();

        // Methods.
        const handleOnLocationClick = (key: Key) => {
            onLocationClick(key as string);
        };

        return (
            <Map mapContainerClassName="h-[500px] md:h-[500px]">
                <Map.Content classNameContainer="px-0 max-w-full md:container md:px-4">
                    <Card.Wrapper>
                        <Card>
                            <ScrollShadow className="h-full" hideScrollBar>
                                {!selectedLocation ? (
                                    <CardBody className="p-0">
                                        <div className="bg-primary p-4">
                                            <Search />
                                        </div>
                                        <Listbox onAction={handleOnLocationClick}>
                                            {listLocations.map((location) => (
                                                <ListboxItem key={location.id}>{location.id}</ListboxItem>
                                            ))}
                                        </Listbox>
                                    </CardBody>
                                ) : (
                                    <CardBody>
                                        <Button color="primary" onClick={onBackClick}>
                                            Back
                                        </Button>
                                        <div>sdf</div>
                                    </CardBody>
                                )}
                            </ScrollShadow>
                        </Card>
                    </Card.Wrapper>
                </Map.Content>
            </Map>
        );
    }
};
