import { Fragment, useContext, useEffect, useRef } from 'react';
import { classNamesTailwind } from '../../utils/helpers';
import AutocompletePanel from './AutocompletePanel';
import Panel from './Panel';
import { LocationFinderContext, LocationProps } from '../../contexts/locationFinderContext';
import ListItem from '../location/ListItem';
import DetailItem from '../location/DetailItem';
import { SettingContext } from '../../contexts/settingContext';

const LocationFinderPanel = ({ locations }: { locations: LocationProps[] }) => {
    const { renders, classNames } = useContext(SettingContext);

    const { refinedLocations, selectedLocation, setRefinedLocations, setLocations } = useContext(LocationFinderContext);

    useEffect(() => {
        setRefinedLocations(locations);
        setLocations(locations);
    }, []);

    const inputRef = useRef<HTMLInputElement>(null);

    const { renderPanelHeaderTop, renderPanelHeaderBottom, renderListItem, renderListDetail } = renders ?? {};

    return (
        <Panel>
            {selectedLocation ? (
                renderListDetail ? (
                    renderListDetail({ location: selectedLocation })
                ) : (
                    <DetailItem />
                )
            ) : (
                <>
                    <Panel.Heading>
                        {(renderPanelHeaderTop &&
                            renderPanelHeaderTop({
                                numberOfLocations: refinedLocations.length
                            })) ?? <Panel.HeadingTop numberOfLocations={refinedLocations.length} />}
                        <AutocompletePanel ref={inputRef} />
                        {renderPanelHeaderBottom &&
                            renderPanelHeaderBottom({
                                numberOfLocations: refinedLocations.length
                            })}
                    </Panel.Heading>
                    <Panel.Body>
                        <div className={classNamesTailwind('overflow-y-auto divide-y', classNames?.list?.overview)}>
                            {refinedLocations &&
                                refinedLocations.map((listLocation: LocationProps) =>
                                    renderListItem ? (
                                        <Fragment key={listLocation.id}>{renderListItem({ location: listLocation })}</Fragment>
                                    ) : (
                                        <ListItem location={listLocation} key={listLocation.id} showOpeningHours={true} />
                                    )
                                )}
                        </div>
                    </Panel.Body>
                </>
            )}
        </Panel>
    );
};

export default LocationFinderPanel;
