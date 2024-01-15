import type { Location, LocationOpeningHours, OpeningHoursDaysDay, OpeningHoursDaysDaySlot } from 'src/types';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    getKeyValue,
    TableCell,
    TableProps
} from '@nextui-org/react';
import { startOfWeek, addDays, format } from 'date-fns';
import { useMemo } from 'react';
import { isSlotOpen } from '.';

export interface OpeningHoursProps extends TableProps {
    location: Location<LocationOpeningHours>;
    locale?: string;
    region?: string;
    labelClosed?: string;
    labelDay?: string;
    labelHour?: string;
    labelTime?: string;
}

export const getFullDayName = (day: number, locale: string = 'nl', region = 'NL'): string => {
    const start = startOfWeek(new Date());
    const date = addDays(start, day);
    return date.toLocaleString(`${locale}-${region}`, { weekday: 'long' });
};

const getSlot = (slot: OpeningHoursDaysDaySlot) => {
    return `${format(slot.from, 'HH:mm')} - ${format(slot.to, 'HH:mm')}`;
};

const getTime = (day: OpeningHoursDaysDay, labelClosed: string, labelHour: string): string => {
    if (day.closed || day.slots.length === 0) {
        return labelClosed;
    }

    return `${day.slots.map(getSlot).join(', ')} ${labelHour}`;
};

const OpeningHours = ({
    location,
    locale,
    region,
    labelClosed = 'Gesloten',
    labelDay = 'Openingstijden',
    labelHour = 'uur',
    labelTime = '',
    ...props
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
                    key: key,
                    day: getFullDayName(parseInt(key), locale, region),
                    time: getTime(day, labelClosed, labelHour)
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

    const selectedKeys = useMemo(() => {
        if (!location.openingHours) {
            return [];
        }

        return Object.entries(location.openingHours.days).reduce<string[]>((a, [day, openingHours]) => {
            if (openingHours.slots.some(openingHour => isSlotOpen(new Date(), day, openingHour))) {
                return [...a, day];
            }

            return a;
        }, [])
    }, [location]);

    return (
        <Table {...props} selectedKeys={selectedKeys} selectionMode='single' color='primary'>
            <TableHeader columns={columns}>{(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}</TableHeader>
            <TableBody items={rows}>
                {(item) => <TableRow key={item.key}>{(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}</TableRow>}
            </TableBody>
        </Table>
    );
};

export default OpeningHours;
