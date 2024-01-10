import type { Meta, StoryObj } from '@storybook/react';

// Local.
import { Markers } from '.';
import { Map } from '../map';

const meta = {
    title: 'map/Markers',
    component: Markers
} satisfies Meta<typeof Markers>;

export default meta;
type Story = StoryObj<typeof Markers>;

export const Primary: Story = {
    render: (args) => {
        return (
            <Map>
                <Markers {...args} />
            </Map>
        );
    }
};

export const Cluster: Story = {
    args: {
        cluster: {
            enabled: true,
            maxZoom: 16,
            minZoom: 7
        }
    },
    render: (args) => {
        return (
            <Map>
                <Markers {...args} />
            </Map>
        );
    }
};

export const Custom: Story = {
    args: {
        cluster: {
            enabled: true,
            maxZoom: 16,
            minZoom: 7
        }
    },
    render: (args) => {
        return (
            <Map>
                <Markers {...args} />
            </Map>
        );
    }
};
