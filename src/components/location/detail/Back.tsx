import { useContext } from 'react';
import { SettingContext } from '../../../contexts/settingContext';

const Back = ({ onHandleClick, className }: { onHandleClick: React.MouseEventHandler<HTMLButtonElement>; className?: string }) => {
    const { labels } = useContext(SettingContext);

    const { backButtonLabel = 'Terug' } = labels ?? {};
    return (
        <button className={className} onClick={onHandleClick}>
            {backButtonLabel}
        </button>
    );
};

export default Back;
