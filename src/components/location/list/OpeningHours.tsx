import { OpeningHoursType } from '../../../contexts/locationFinderContext';
import { useOpeningHours } from '../../../hooks/useOpeningHours';
import { classNamesTailwind } from '../../../utils/helpers';

const OpeningHoursSlot = ({
  openingHours,
}: {
  openingHours: OpeningHoursType;
}) => {
  const { getOpeningHoursSlot } = useOpeningHours();

  const {
    currentOpeningHourSlotLabel,
    openIndicator,
    currentOpeningHour,
  } = getOpeningHoursSlot(openingHours);

  if (!currentOpeningHour) {
    return <></>;
  }

  return (
    <div>
      {currentOpeningHourSlotLabel ? (
        <div className="mt-2 flex items-center">
          <span
            className={classNamesTailwind(
              'w-2 h-2 bg-red-400 rounded-3xl mr-1',
              { 'bg-green-400': openIndicator }
            )}
          />
          <span>
            {openIndicator
              ? `Open tot ${currentOpeningHourSlotLabel}`
              : 'Gesloten'}
          </span>
        </div>
      ) : (
        currentOpeningHour &&
        currentOpeningHour.closed && (
          <div className="mt-2 flex items-center">
            <span>Gesloten</span>
          </div>
        )
      )}
    </div>
  );
};

export default OpeningHoursSlot;
