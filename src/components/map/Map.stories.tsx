import type { Meta, StoryObj } from '@storybook/react';

import useLocationFinder from 'src/hooks/useLocationFinder';
import { Map } from '../map';
import { Card } from '../card';
import { CardBody, ListboxItem, Input, ScrollShadow } from '@nextui-org/react';

const meta = {
    title: 'map/Map',
    component: Map
} satisfies Meta<typeof Map>;

export default meta;
type Story = StoryObj<typeof Map>;

export const Primary: Story = {
    render: () => {
        const { locations, selectedLocation, filteredLocations, inputRef } = useLocationFinder();

        return (
            <Map mapContainerClassName="h-[500px] md:h-[500px]">
                {locations.map((location) => (
                    <Map.Marker key={location.id} location={location} />
                ))}
                <Map.Content>
                    <Card.Wrapper>
                        <Card>
                            {!selectedLocation ? (
                                <CardBody>
                                    <Card.Autocomplete>
                                        <Input ref={inputRef} />
                                    </Card.Autocomplete>
                                    <Card.List>
                                        {filteredLocations.map((location) => (
                                            <ListboxItem key={location.id}>{location.id}</ListboxItem>
                                        ))}
                                    </Card.List>
                                </CardBody>
                            ) : (
                                <CardBody>
                                    <div>sdf</div>
                                </CardBody>
                            )}
                        </Card>
                    </Card.Wrapper>
                </Map.Content>
            </Map>
        );
    }
};
