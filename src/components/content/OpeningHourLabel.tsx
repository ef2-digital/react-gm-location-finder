import { Chip, ChipProps } from '@nextui-org/react';
import { format, isAfter, addDays, isBefore, startOfWeek } from 'date-fns';
import { useMemo } from 'react';
import type { Location, LocationOpeningHours, OpeningHoursDaysDaySlot } from 'src/types';

export interface OpeningHourLabelProps extends ChipProps {
    location: Location<LocationOpeningHours>;
    labelClosed?: string;
    labelOpenTill?: string;
    labelOpenFrom?: string;
}

const isBetween = (date: Date, from: Date, to: Date) => {
    return isAfter(date, from) && isBefore(date, to);
};
export const getDate = (date: string | Date, currentDate: Date, day: number): Date => {
    if (!date) {
        return currentDate;
    }

    const start = startOfWeek(currentDate);
    const dateDay = addDays(start, day);

    const parsedDate = typeof date === 'string' ? new Date(date) : date;

    dateDay.setHours(parsedDate.getHours());
    dateDay.setMinutes(parsedDate.getMinutes());

    return dateDay;
};

const OpeningHourLabel = ({
    location,
    labelClosed = 'Gesloten',
    labelOpenTill = 'Open tot',
    labelOpenFrom = 'Open vanaf',
    ...props
}: OpeningHourLabelProps) => {
    const date = new Date();
    const open = useMemo(
        () =>
            location.openingHours &&
            Object.entries(location.openingHours.days).reduce<OpeningHoursDaysDaySlot | undefined>((a, [day, openingHours]) => {
                if (openingHours.closed || a) {
                    return a;
                }

                const slot = openingHours.slots.find((slot) => {
                    if (!slot || (!slot.from && !slot.to)) {
                        return null;
                    }

                    const from = getDate(slot.from, date, parseInt(day));
                    const to = getDate(slot.to, date, parseInt(day));

                    return isBetween(date, from, to);
                });

                return slot;
            }, undefined),
        [date, location.openingHours]
    );

    if (!open || !location.openingHours) {
        return (
            <Chip className="border" size="sm" color="danger" variant="dot" {...props}>
                {labelClosed}
            </Chip>
        );
    }

    if (isAfter(date, open.from)) {
        return (
            <Chip className="border" size="sm" color="success" variant="dot" {...props}>
                {labelOpenTill} {format(open.to, 'HH:mm')}
            </Chip>
        );
    }

    if (isBefore(date, open.from)) {
        return (
            <Chip className="border" size="sm" color="success" variant="dot" {...props}>
                {labelOpenFrom} {format(open.from, 'HH:mm')}
            </Chip>
        );
    }

    return (
        <Chip className="border" size="sm" color="danger" variant="dot" {...props}>
            {labelClosed}
        </Chip>
    );
};

export default OpeningHourLabel;
