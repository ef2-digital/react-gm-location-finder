import OpeningHours, { type OpeningHoursProps } from './OpeningHours';
import OpeningHourLabel, { type OpeningHourLabelProps } from './OpeningHourLabel';
import { OpeningHoursDaysDaySlot } from 'src/types';
import { startOfWeek, addDays, isAfter, isBefore } from 'date-fns';

const getDate = (date: Date, currentDate: Date, day: number): Date => {
    const start = startOfWeek(currentDate);
    const dateDay = addDays(start, day);

    dateDay.setHours(date.getHours());
    dateDay.setMinutes(date.getMinutes());

    return dateDay;
};

const isBetween = (date: Date, from: Date, to: Date) => {
    return isAfter(date, from) && isBefore(date, to);
};

const isSlotOpen = (date: Date, day: number | string, slot: OpeningHoursDaysDaySlot) => {
    const from = getDate(slot.from, date, parseInt(day as string));
    const to = getDate(slot.to, date, parseInt(day as string));

    return isBetween(date, from, to);
};

export type { OpeningHoursProps, OpeningHourLabelProps };
export { OpeningHours, OpeningHourLabel, isSlotOpen, getDate };
