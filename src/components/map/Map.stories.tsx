import type { Meta, StoryObj } from '@storybook/react';

import useLocationFinder from 'src/hooks/useLocationFinder';
import { Map } from '../map';
import { Card } from '../card';
import { CardBody, ListboxItem, Input, ScrollShadow, Button } from '@nextui-org/react';
import { calculateDistance } from 'src/utils/helpers';

const meta = {
    title: 'map/Map',
    component: Map
} satisfies Meta<typeof Map>;

export default meta;
type Story = StoryObj<typeof Map>;

export const Primary: Story = {
    render: () => {
        // const { locations, selectedLocation, filteredLocations, inputRef, onBackClick, defaultSearch, center } = useLocationFinder();

        return (
            <></>
            // <Map mapContainerClassName="h-[500px] md:h-[500px]">
            //     {locations.map((location) => (
            //         <Map.Marker key={location.id} location={location} />
            //     ))}
            //     <Map.Content>
            //         <Card.Wrapper>
            //             <Card>
            //                 <ScrollShadow className="h-[20rem]" hideScrollBar>
            //                     {!selectedLocation ? (
            //                         <CardBody>
            //                             {/* TODO: remove component? */}
            //                             <Card.Autocomplete>
            //                                 <Input defaultValue={defaultSearch} ref={inputRef} />
            //                             </Card.Autocomplete>
            //                             <Card.List>
            //                                 {filteredLocations.map((location) => (
            //                                     <ListboxItem key={location.id}>{location.id}</ListboxItem>
            //                                 ))}
            //                             </Card.List>
            //                         </CardBody>
            //                     ) : (
            //                         <CardBody>
            //                             <Button color="primary" onClick={onBackClick}>
            //                                 Back
            //                             </Button>
            //                             <div>sdf</div>
            //                         </CardBody>
            //                     )}
            //                 </ScrollShadow>
            //             </Card>
            //         </Card.Wrapper>
            //     </Map.Content>
            // </Map>
        );
    }
};
