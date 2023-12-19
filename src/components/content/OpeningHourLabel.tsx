import { Chip, ChipProps } from '@nextui-org/react';
import { format, isAfter, addDays, isBefore, startOfWeek } from 'date-fns';
import { useMemo, useState } from 'react';
import type { Location, LocationOpeningHours, OpeningHoursDaysDaySlot } from 'src/types';
import { useInterval } from 'usehooks-ts';

export interface OpeningHourLabelProps extends ChipProps {
    location: Location<LocationOpeningHours>;
    labelClosed?: string;
    labelOpenTill?: string;
    labelOpenFrom?: string;
}

const isBetween = (date: Date, from: Date, to: Date) => {
    return isAfter(date, from) && isBefore(date, to);
};

export const getDate = (date: Date, currentDate: Date, day: number): Date => {
    const start = startOfWeek(currentDate);
    const dateDay = addDays(start, day);

    dateDay.setHours(date.getHours());
    dateDay.setMinutes(date.getMinutes());

    return dateDay;
};

const OpeningHourLabel = ({
    location,
    labelClosed = 'Gesloten',
    labelOpenTill = 'Open tot',
    labelOpenFrom = 'Open vanaf',
    ...props
}: OpeningHourLabelProps) => {
    const [date, setDate] = useState<Date>(new Date());

    useInterval(
        () => setDate(new Date()),
        10000 // Update every 10 seconds.
    );

    const open = useMemo(
        () =>
            location.openingHours &&
            Object.entries(location.openingHours.days).reduce<OpeningHoursDaysDaySlot | undefined>((a, [day, openingHours]) => {
                if (openingHours.closed) {
                    return a;
                }

                const slot = openingHours.slots.find((slot) => {
                    const from = getDate(slot.from, date, parseInt(day));
                    const to = getDate(slot.to, date, parseInt(day));

                    return isBetween(date, from, to);
                });

                return slot;
            }, undefined),
        []
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
