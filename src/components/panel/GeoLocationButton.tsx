import { ReactElement, useContext, useState } from 'react';
import { classNamesTailwind } from '../../utils/helpers';
import { useOnAutocomplete } from '../../hooks/useOnAutocomplete';
import { SettingContext } from '../../contexts/settingContext';

const GeoLocationButton = ({ icon }: { icon?: ReactElement }) => {
    const { setCurrentGeoPosition } = useOnAutocomplete();
    const { classNames } = useContext(SettingContext);
    const [hasLoadingIcon, setIsLoadingIcon] = useState(false);
    const [geoLocationVerified, setGeoLocationVerified] = useState(false);

    const { autocomplete } = classNames ?? {};

    const handleButtonClick = async () => {
        if (hasLoadingIcon) {
            return;
        }

        setIsLoadingIcon(true);

        await setCurrentGeoPosition().then(() => {
            setIsLoadingIcon(false);
            setGeoLocationVerified(!geoLocationVerified);
        });
    };

    return (
        <button
            disabled={hasLoadingIcon}
            className={classNamesTailwind('flex-none border border-gray-300 border-l-0 pr-3 pl-2 rounded-r ', autocomplete?.button, {
                'cursor-wait': hasLoadingIcon,
                'cursor-pointer': !hasLoadingIcon
            })}
            onClick={handleButtonClick}
        >
            <div
                className={classNamesTailwind(
                    'relative',
                    {
                        'animate-pulse': hasLoadingIcon
                    },
                    autocomplete?.iconWrapper
                )}
            >
                {geoLocationVerified && (
                    <>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="48"
                            height="48"
                            viewBox="0 -960 960 960"
                            className={classNamesTailwind('fill-green-500 w-4 h-4 absolute -top-1 -right-2', autocomplete?.iconVerified)}
                        >
                            <path d="m419.87-403.696-87.261-87.261q-11.261-11.261-27.715-11.261t-29.155 12.261q-11.261 11.827-11.261 28.218t11.826 27.652L391.521-317.87q12.083 11.827 28.194 11.827 16.111 0 28.503-11.827l232.217-232.782q12.826-12.261 12.826-28.432 0-16.172-12.826-28.873-12.261-11.261-29.216-10.761-16.954.5-28.654 11.761L419.87-403.696Zm60.208 337.827q-85.469 0-161.006-32.395-75.536-32.395-131.975-88.833-56.438-56.439-88.833-131.897-32.395-75.459-32.395-160.928 0-86.469 32.395-162.006 32.395-75.536 88.745-131.504 56.349-55.968 131.849-88.616 75.5-32.648 161.017-32.648 86.516 0 162.12 32.604 75.603 32.604 131.529 88.497t88.549 131.452Q894.696-566.584 894.696-480q0 85.547-32.648 161.075-32.648 75.527-88.616 131.896-55.968 56.37-131.426 88.765-75.459 32.395-161.928 32.395Z" />
                        </svg>
                    </>
                )}
                {icon ?? (
                    <svg
                        className={classNamesTailwind('fill-current w-6 h-6', autocomplete?.icon)}
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                        viewBox="0 -960 960 960"
                    >
                        <path d="M443.782-64.652v-38.782q-138.13-14.565-232.239-108.674-94.109-94.109-108.109-231.674H64.652q-15.393 0-25.805-10.429-10.413-10.429-10.413-25.845 0-15.417 10.413-25.789 10.412-10.373 25.805-10.373h38.782q14.565-138.13 108.674-232.239 94.109-94.109 231.674-108.109v-38.782q0-15.393 10.429-25.805 10.429-10.413 25.845-10.413 15.417 0 25.789 10.413 10.373 10.412 10.373 25.805v38.782q137.565 14 231.674 108.109 94.109 94.109 108.674 232.239h38.782q15.393 0 25.805 10.429 10.413 10.429 10.413 25.845 0 15.417-10.413 25.789-10.412 10.373-25.805 10.373h-38.782q-14 137.565-108.109 231.674-94.109 94.109-232.239 108.674v38.782q0 15.393-10.429 25.805-10.429 10.413-25.845 10.413-15.417 0-25.789-10.413-10.373-10.412-10.373-25.805Zm36.121-116.435q123.401 0 211.206-87.707 87.804-87.708 87.804-211.109 0-123.401-87.707-211.206-87.708-87.804-211.109-87.804-123.401 0-211.206 87.707-87.804 87.708-87.804 211.109 0 123.401 87.707 211.206 87.708 87.804 211.109 87.804ZM480-330q-63 0-106.5-43.5T330-480q0-63 43.5-106.5T480-630q63 0 106.5 43.5T630-480q0 63-43.5 106.5T480-330Zm-.205-73.001q32.553 0 54.878-22.12 22.326-22.121 22.326-54.674t-22.12-54.878q-22.121-22.326-54.674-22.326t-54.878 22.12q-22.326 22.121-22.326 54.674t22.12 54.878q22.121 22.326 54.674 22.326ZM480-480Z" />
                    </svg>
                )}
            </div>
        </button>
    );
};

export default GeoLocationButton;
