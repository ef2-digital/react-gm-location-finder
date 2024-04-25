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
import { startOfWeek, addDays } from 'date-fns';
import { useMemo } from 'react';
import { isSlotOpen } from '.';
import { localeMap } from 'src/utils/helpers';
import { zonedTimeToUtc, utcToZonedTime, format, formatInTimeZone } from "date-fns-tz";
import nl from 'date-fns/locale/nl'

export interface OpeningHoursProps extends TableProps {
    location: Location<LocationOpeningHours>;
    locale?: string;
    region?: string;
    labelClosed?: string;
    labelDay?: string;
    labelHour?: string;
    labelTime?: string;
}

const timezone = 'Europe/Amsterdam';

const formatZonedTime = (date: Date, formatString: string) => {
    return formatInTimeZone(date, timezone, formatString, { locale: nl })
}

const upperCaseFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export const getFullDayName = (day: number, locale: string = 'nl', region = 'NL'): string => {
    const start = startOfWeek(new Date());
    const date = addDays(start, day);
    return upperCaseFirstLetter(date.toLocaleString(`${locale}-${region}`, { weekday: 'long' }));
};

const getSlot = (slot: OpeningHoursDaysDaySlot, locale: string) => {
    return `${formatZonedTime(slot.from, 'HH:mm')} - ${formatZonedTime(slot.to, 'HH:mm')}`;
};

const getTime = (day: OpeningHoursDaysDay, labelClosed: string, labelHour: string, locale: string = 'nl'): string => {
    if (day.closed || day.slots.length === 0) {
        return labelClosed;
    }

    return `${day.slots.map(slot => getSlot(slot, locale)).join(', ')} ${labelHour}`;
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
                // Sort Sunday to the end.
                if (parseInt(b[0]) === 0) {
                    return -1;
                }
                
                // Sort Sunday to the end.
                if (parseInt(a[0]) === 0) {
                    return 1;
                }

                return parseInt(a[0]) - parseInt(b[0]);
            })
            .map(([key, day]) => {
                return {
                    key: key,
                    day: getFullDayName(parseInt(key), locale, region),
                    time: getTime(day, labelClosed, labelHour, locale)
                };
            });
    }, [location.openingHours, locale]);

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

    if (rows.length === 0) {
        return null;
    }

    return (
        <Table {...props} selectedKeys={selectedKeys} selectionMode='single' color='primary' aria-label={labelDay}>
            <TableHeader columns={columns}>{(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}</TableHeader>
            <TableBody items={rows}>
                {(item) => <TableRow key={item.key}>{(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}</TableRow>}
            </TableBody>
        </Table>
    );
};

export default OpeningHours;
