import type { Location, LocationOpeningHours, OpeningHoursDaysDay, OpeningHoursDaysDaySlot } from 'src/types';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    getKeyValue,
    TableCell,
    SlotsToClasses,
    TableSlots
} from '@nextui-org/react';
import { startOfWeek, addDays, format } from 'date-fns';
import { useMemo } from 'react';

export interface OpeningHoursProps {
    location: Location<LocationOpeningHours>;
    locale?: string;
    labelClosed?: string;
    labelDay?: string;
    labelHour?: string;
    labelTime?: string;
    classNamesTable?: SlotsToClasses<TableSlots>;
}

export const getFullDayName = (day: number, locale: string = 'nl', region = 'NL'): string => {
    const start = startOfWeek(new Date());
    const date = addDays(start, day);
    return date.toLocaleString(`${locale}-${region}`, { weekday: 'long' });
};

const getSlot = (slot: OpeningHoursDaysDaySlot) => {
    return `${format(slot.from, 'HH:mm')} - ${format(slot.to, 'HH:mm')}`;
};

const getTime = (day: OpeningHoursDaysDay, closedLabel: string): string => {
    if (day.closed || day.slots.length === 0) {
        return closedLabel;
    }

    return day.slots.map(getSlot).join(', ');
};

const OpeningHours = ({
    location,
    labelClosed = 'Gesloten',
    labelDay = 'Dag',
    labelHour = 'uur',
    labelTime = 'Tijd',
    classNamesTable
}: OpeningHoursProps) => {
    if (!location.openingHours) {
        return null;
    }

    const rows = useMemo(() => {
        return Object.entries(location.openingHours!.days)
            .sort((a, b) => {
                if (parseInt(b[0]) === 0) {
                    return -1;
                }

                if (parseInt(a[0]) === 0) {
                    return 1;
                }

                return parseInt(a[0]) - parseInt(b[0]);
            })
            .map(([key, day]) => {
                return {
                    day: getFullDayName(parseInt(key)),
                    time: `${getTime(day, labelClosed)} ${labelHour}`
                };
            });
    }, [location.openingHours]);

    const columns = useMemo(() => {
        return [
            {
                key: 'day',
                label: labelDay
            },
            {
                key: 'time',
                label: labelTime
            }
        ];
    }, [labelDay]);

    return (
        <Table classNames={classNamesTable}>
            <TableHeader columns={columns}>{(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}</TableHeader>
            <TableBody items={rows}>
                {(item) => <TableRow key={item.day}>{(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}</TableRow>}
            </TableBody>
        </Table>
    );
};

export default OpeningHours;
