import type { Meta, StoryObj } from '@storybook/react';

// Local.
import { Markers } from '.';
import { Map } from '../map';

const meta = {
    title: 'map/Markers',
    component: Markers
} satisfies Meta<typeof Markers>;

export default meta;
type Story = StoryObj<typeof Map>;

export const Primary: Story = {
    render: () => {
        return (
            <Map>
                <Markers />
            </Map>
        );
    }
};

export const Cluster: Story = {
    render: () => {
        return (
            <Map>
                <Markers cluster={{ enabled: true, maxZoom: 16, minZoom: 7 }} />
            </Map>
        );
    }
};
