import { useOpeningHours } from '../../../hooks/useOpeningHours';
import { classNamesTailwind } from '../../../utils/helpers';
import { OpeningHoursDaysType } from '../../../contexts/locationFinderContext';

const OpeningHours = ({
  openingHours,
  classNames,
  labels,
}: {
  openingHours: OpeningHoursDaysType;
  classNames?: {
    label?: string;
  };
  labels?: {
    title?: string;
    hour?: string;
  };
}) => {
  if (!openingHours || Object.keys(openingHours).length === 0) {
    return <></>;
  }

  const { getFullDayName, zeroPad } = useOpeningHours();

  const maxSlots = openingHours
    ? Object.values(openingHours).reduce(
        (a, c) => (c.slots.length > a ? c.slots.length : a),
        0
      )
    : 0;

  return (
    <>
      <span
        className={classNamesTailwind(
          'font-bold text-indigo-600 block mt-4',
          classNames?.label
        )}
      >
        {labels?.title ?? 'Openingstijden'}
      </span>
      <table className="min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <th
              scope="col"
              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
            >
              <span className="sr-only">Dag</span>
            </th>
            {Array.from(Array(maxSlots).keys()).map(index => (
              <th
                key={index}
                scope="col"
                className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900"
              >
                <span className="sr-only">Tijd</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {Object.entries(openingHours)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([key, value]) => (
              <tr key={key}>
                <td className="text-sm text-gray-500 px-2 py-2 capitalize">
                  {getFullDayName(parseInt(key))}
                </td>
                {Array.from(Array(maxSlots).keys()).map(index => {
                  const slot = value.slots[index];

                  if (!slot) {
                    return (
                      <td
                        key={index}
                        className="text-sm text-gray-500 px-2 py-2"
                      />
                    );
                  }

                  return (
                    <td key={index} className="text-sm text-gray-500 px-2 py-2">
                      <span>
                        <span>
                          {zeroPad(slot.from.hours)}:
                          {zeroPad(slot.from.minutes)}
                        </span>
                        <span> - </span>
                        <span>
                          {`${zeroPad(slot.to.hours)}:${zeroPad(
                            slot.to.minutes
                          )} ${labels?.hour ?? 'uur'}`}
                        </span>
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
