import { startOfWeek, addDays } from 'date-fns';
import { OpeningHoursType } from '../contexts/locationFinderContext';

export enum Enum_OpeninghoursDay {
  Sunday = 'Sunday',
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday',
}

const dayMap = new Map<Enum_OpeninghoursDay, number>([
  [Enum_OpeninghoursDay.Sunday, 0],
  [Enum_OpeninghoursDay.Monday, 1],
  [Enum_OpeninghoursDay.Tuesday, 2],
  [Enum_OpeninghoursDay.Wednesday, 3],
  [Enum_OpeninghoursDay.Thursday, 4],
  [Enum_OpeninghoursDay.Friday, 5],
  [Enum_OpeninghoursDay.Saturday, 6],
]);

export const getFullDayName = (
  day: number,
  locale: string = 'nl',
  region = 'NL'
): string => {
  const start = startOfWeek(new Date());
  const date = addDays(start, day);
  return date.toLocaleString(`${locale}-${region}`, { weekday: 'long' });
};

export const useOpeningHours = () => {
  const date = new Date();
  const day = date.getDay();
  const hours = date.getHours();
  const zeroPad = (num: number) => String(num).padStart(2, '0');

  const getOpeningHoursSlot = (openingHours: OpeningHoursType) => {
    const currentOpeningHour = openingHours
      ? openingHours.days && openingHours.days[day]
      : undefined;

    const currentOpeningHourSlot =
      currentOpeningHour?.slots && Boolean(currentOpeningHour.slots.length)
        ? currentOpeningHour.slots.at(-1)
        : undefined;

    const currentOpeningHourSlotLabel = currentOpeningHourSlot
      ? `${zeroPad(currentOpeningHourSlot.to.hours)}:${zeroPad(
          currentOpeningHourSlot.to.minutes
        )}`
      : undefined;
    const openIndicator: boolean = currentOpeningHourSlot
      ? currentOpeningHourSlot.to.hours >= hours
      : false;

    return {
      currentOpeningHour,
      currentOpeningHourSlot,
      currentOpeningHourSlotLabel,
      openIndicator,
    };
  };

  const formatTime = (
    timeString: string
  ): { hours: number; minutes: number } => {
    const time: Date = new Date(`1/01/1970 ${timeString}`);
    const hours: number = time.getHours();
    const minutes: number = time.getMinutes();
    return { hours, minutes };
  };

  return { getOpeningHoursSlot, zeroPad, formatTime, dayMap, getFullDayName };
};
