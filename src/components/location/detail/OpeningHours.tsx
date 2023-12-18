import { useOpeningHours } from '../../../hooks/useOpeningHours';
import { classNamesTailwind } from '../../../utils/helpers';
import { OpeningHoursDaysType } from '../../../contexts/locationFinderContext';
import { useContext } from 'react';
import { SettingContext } from 'src/contexts/settingContext';

const OpeningHours = ({ openingHours }: { openingHours: OpeningHoursDaysType }) => {
    if (!openingHours || Object.keys(openingHours).length === 0) {
        return <></>;
    }
    const { getFullDayName, zeroPad, getMaxSlots } = useOpeningHours();
    const { classNames, labels } = useContext(SettingContext);
    const { detailItem } = classNames ?? {};
    const {
        openingHoursLabel = 'Openingstijden',
        dayLabel = 'Dag',
        timeLabel = 'Tijd',
        hoursLabel = 'uur',
        closedLabel = 'Gesloten'
    } = labels ?? {};

    const maxSlots = getMaxSlots(openingHours);

    return (
        <>
            <span className={classNamesTailwind('font-bold text-indigo-600 block mt-4', detailItem?.openingHours?.label)}>
                {openingHoursLabel}
            </span>
            <table className="min-w-full divide-y divide-gray-300">
                <thead>
                    <tr className="sr-only">
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                            <span className="sr-only">{dayLabel}</span>
                        </th>
                        {Array.from(Array(maxSlots).keys()).map((index) => (
                            <th key={index} scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
                                <span className="sr-only">{timeLabel}</span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {Object.entries(openingHours)
                        .sort(([a], [b]) => (parseInt(a) === 0 ? 7 : parseInt(a)) - (parseInt(b) === 0 ? 7 : parseInt(b)))
                        .map(([key, value]) => (
                            <tr key={key}>
                                <td className="text-sm text-gray-500 px-2 py-2 capitalize">{getFullDayName(parseInt(key))}</td>
                                {Array.from(Array(maxSlots).keys()).map((index) => {
                                    const slot = value.slots[index];

                                    if (!slot || value.closed) {
                                        return (
                                            <td key={index} className="px-2 py-2 text-sm text-gray-500">
                                                {' '}
                                                {closedLabel}
                                            </td>
                                        );
                                    }

                                    return (
                                        <td key={index} className="text-sm text-gray-500 px-2 py-2">
                                            <span>
                                                <span>
                                                    {zeroPad(slot.from.hours)}:{zeroPad(slot.from.minutes)}
                                                </span>
                                                <span> - </span>
                                                <span>{`${zeroPad(slot.to.hours)}:${zeroPad(slot.to.minutes)} ${hoursLabel}`}</span>
                                            </span>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                </tbody>
            </table>
        </>
    );
};

export default OpeningHours;
