import { useContext } from 'react';
import { SettingContext } from '../../contexts/settingContext';

type HeadingTopProps = {
  numberOfLocations?: number;
};
const HeadingTop = ({ numberOfLocations }: HeadingTopProps) => {
  const { labels } = useContext(SettingContext);

  const {
    findDealerNearby = 'Vind een locatie in de buurt',
    dealers = `${numberOfLocations} locaties`,
  } = labels ?? {};

  return (
    <div className="mb-4 flex h-max items-center justify-between">
      <h1 className="text-base font-extrabold text-dark">{findDealerNearby}</h1>
      <span className="text-xs">{dealers}</span>
    </div>
  );
};

export default HeadingTop;
