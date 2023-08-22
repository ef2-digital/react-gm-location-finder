import { useContext } from 'react';
import { useOnLocationEvent } from '../../../hooks/useOnLocationEvent';
import { SettingContext } from '../../../contexts/settingContext';

const Back = ({ className }: { className?: string }) => {
  const { unsetSelectedLocation } = useOnLocationEvent();
  const { labels } = useContext(SettingContext);

  const { backButtonLabel = 'Terug' } = labels ?? {};
  return (
    <button className={className} onClick={unsetSelectedLocation}>
      {backButtonLabel}
    </button>
  );
};

export default Back;
